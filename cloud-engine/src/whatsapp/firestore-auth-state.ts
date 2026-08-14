import { proto, AuthenticationCreds, AuthenticationState, SignalDataTypeMap, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { db } from '../config/firebase-admin.js';

// Caché en RAM para mantener la velocidad
const memoryCache = new Map<string, { creds: AuthenticationCreds, keys: any }>();

export const useFirestoreAuthState = async (tenantId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void>, clearState: () => Promise<void> }> => {
  // V3 para empezar con una base de datos limpia y sin historiales corruptos
  const docRef = db.collection('whatsapp_auth_v3').doc(tenantId);
  
  let creds: AuthenticationCreds;
  let keys: any = {};

  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const data = docSnap.data();
    creds = JSON.parse(data?.creds || '{}', BufferJSON.reviver);
    keys = JSON.parse(data?.keys || '{}', BufferJSON.reviver);
  } else {
    creds = initAuthCreds();
  }

  if (memoryCache.has(tenantId)) {
    const cached = memoryCache.get(tenantId)!;
    creds = cached.creds;
    keys = { ...keys, ...cached.keys };
  }
  
  memoryCache.set(tenantId, { creds, keys });

  let saveTimer: NodeJS.Timeout | null = null;

  const saveState = async () => {
    try {
      // 🚀 EL FILTRO ANTI-GRASA: Aislar las llaves pesadas
      const lightweightKeys: any = {};
      for (const key in keys) {
        // Ignoramos todo el historial (app-state) que pesa 1MB y rompe Firebase
        if (!key.startsWith('app-state')) {
          lightweightKeys[key] = keys[key];
        }
      }

      await docRef.set({
        creds: JSON.stringify(creds, BufferJSON.replacer),
        keys: JSON.stringify(lightweightKeys, BufferJSON.replacer)
      });
    } catch (error) {
      console.error(`[Auth] Error guardando estado comprimido para ${tenantId}:`, error);
    }
  };

  const debouncedSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveState();
    }, 1000); 
  };

  const clearState = async () => {
    if (saveTimer) clearTimeout(saveTimer);
    memoryCache.delete(tenantId);
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
            const categoryData = data[category as keyof typeof data];
            if (categoryData) {
              for (const id in categoryData) {
                const value = categoryData[id];
                const key = `${category}-${id}`;
                if (value) {
                  keys[key] = value;
                } else {
                  delete keys[key];
                }
                hasChanges = true;
              }
            }
          }
          if (hasChanges) {
            memoryCache.set(tenantId, { creds, keys });
            debouncedSave(); 
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