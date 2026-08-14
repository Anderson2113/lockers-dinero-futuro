import { proto, AuthenticationCreds, AuthenticationState, SignalDataTypeMap, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { db } from '../config/firebase-admin.js';

export const useFirestoreAuthState = async (tenantId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void>, clearState: () => Promise<void> }> => {
  const docRef = db.collection('whatsapp_auth_v2').doc(tenantId);
  
  const docSnap = await docRef.get();
  let creds: AuthenticationCreds;
  let keys: any = {};

  if (docSnap.exists) {
    const data = docSnap.data();
    creds = JSON.parse(data?.creds || '{}', BufferJSON.reviver);
    keys = JSON.parse(data?.keys || '{}', BufferJSON.reviver);
  } else {
    creds = initAuthCreds();
  }

  let saveTimer: NodeJS.Timeout | null = null;

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
            const categoryData = data[category as keyof typeof data];
            // PARCHE: Verificamos que categoryData exista antes de procesarlo
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