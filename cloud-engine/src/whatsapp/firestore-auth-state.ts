import { proto, AuthenticationCreds, AuthenticationState, SignalDataTypeMap, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { db } from '../config/firebase-admin.js';

export const useFirestoreAuthState = async (tenantId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void>, clearState: () => Promise<void> }> => {
  // Usamos una nueva colección (_v2) para ignorar para siempre la data corrupta anterior
  const docRef = db.collection('whatsapp_auth_v2').doc(tenantId);
  
  const docSnap = await docRef.get();
  let creds: AuthenticationCreds;
  let keys: any = {};

  // 1. Cargar estado anterior si existe, o inicializar uno nuevo
  if (docSnap.exists) {
    const data = docSnap.data();
    creds = JSON.parse(data?.creds || '{}', BufferJSON.reviver);
    keys = JSON.parse(data?.keys || '{}', BufferJSON.reviver);
  } else {
    creds = initAuthCreds();
  }

  let saveTimer: NodeJS.Timeout | null = null;

  // 2. Función maestra que guarda TODO el estado en un solo documento
  const saveState = async () => {
    try {
      await docRef.set({
        creds: JSON.stringify(creds, BufferJSON.replacer),
        keys: JSON.stringify(keys, BufferJSON.replacer)
      });
    } catch (error) {
      console.error(`[Auth] Error guardando estado comprimido para ${tenantId}:`, error);
    }
  };

  // 3. EL AMORTIGUADOR (Debounce): Agrupa miles de peticiones en una sola escritura cada 3 segundos
  const debouncedSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveState();
    }, 3000);
  };

  const clearState = async () => {
    if (saveTimer) clearTimeout(saveTimer);
    await docRef.delete();
  };

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const data: { [id: string]: SignalDataTypeMap[typeof type] } = {};
          ids.forEach(id => {
            let value = keys[`${type}-${id}`];
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          });
          return data;
        },
        set: (data) => {
          let hasChanges = false;
          for (const category in data) {
            for (const id in data[category as keyof typeof data]) {
              const value = data[category as keyof typeof data][id];
              const key = `${category}-${id}`;
              if (value) {
                keys[key] = value;
              } else {
                delete keys[key];
              }
              hasChanges = true;
            }
          }
          if (hasChanges) {
            debouncedSave(); // Disparar el amortiguador en lugar de escribir directo
          }
        }
      }
    },
    saveCreds: () => {
      debouncedSave();
      return Promise.resolve();
    },
    clearState
  };
};