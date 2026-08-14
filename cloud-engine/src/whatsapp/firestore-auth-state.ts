import { proto, AuthenticationCreds, AuthenticationState, SignalDataTypeMap, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { db } from '../config/firebase-admin.js';

// Caché en RAM global para máxima velocidad (evita cuellos de botella)
const memoryCache = new Map<string, any>();

export const useFirestoreAuthState = async (tenantId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void>, clearState: () => Promise<void> }> => {
  // V4: Arquitectura multi-documento. Supera el límite de 1MB de Firebase.
  const credsRef = db.collection('whatsapp_auth_v5').doc(tenantId);
  const keysRef = credsRef.collection('keys'); // Subcolección infinita

  let creds: AuthenticationCreds;
  
  // 1. Cargar Credenciales principales
  if (memoryCache.has(`creds_${tenantId}`)) {
    creds = memoryCache.get(`creds_${tenantId}`);
  } else {
    const credsSnap = await credsRef.get();
    if (credsSnap.exists) {
      creds = JSON.parse(credsSnap.data()?.creds || '{}', BufferJSON.reviver);
    } else {
      creds = initAuthCreds();
    }
    memoryCache.set(`creds_${tenantId}`, creds);
  }

  // 2. Motor de escritura en segundo plano (Evita el error "Transaction too big")
  const writeQueue = async (ops: any[]) => {
    const chunkSize = 400; // Límite seguro de Firebase (el máximo es 500)
    for (let i = 0; i < ops.length; i += chunkSize) {
      const chunk = ops.slice(i, i + chunkSize);
      const batch = db.batch();
      chunk.forEach(op => {
        if (op.type === 'set') batch.set(op.ref, { value: op.value });
        else batch.delete(op.ref);
      });
      // Fire and forget: Guarda en la nube sin trabar el Event Loop de Node
      await batch.commit().catch(e => console.error(`[Auth] Error de Batch para ${tenantId}:`, e));
    }
  };

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [id: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async id => {
              const key = `${type}-${id}`;
              let value = memoryCache.get(`${tenantId}_${key}`);
              
              if (value === undefined) {
                const docSnap = await keysRef.doc(key).get();
                if (docSnap.exists) {
                  value = JSON.parse(docSnap.data()?.value || '{}', BufferJSON.reviver);
                } else {
                  value = null; // Guardar nulos en caché para acelerar consultas futuras
                }
                memoryCache.set(`${tenantId}_${key}`, value);
              }

              if (value) {
                if (type === 'app-state-sync-key') {
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }
                data[id] = value;
              }
            })
          );
          return data;
        },
        set: async (data) => {
          const ops: any[] = [];
          for (const category in data) {
            const categoryData = data[category as keyof typeof data];
            if (categoryData) {
              for (const id in categoryData) {
                const value = categoryData[id];
                const key = `${category}-${id}`;
                
                // Actualizar caché RAM al instante para que el Bot fluya a 100% de velocidad
                memoryCache.set(`${tenantId}_${key}`, value ? value : null);
                
                // Encolar la operación para Firebase
                const doc = keysRef.doc(key);
                if (value) {
                  ops.push({ type: 'set', ref: doc, value: JSON.stringify(value, BufferJSON.replacer) });
                } else {
                  ops.push({ type: 'delete', ref: doc });
                }
              }
            }
          }
          // Disparar Firebase en lotes por la ruta trasera
          if (ops.length > 0) {
            writeQueue(ops);
          }
        }
      }
    },
    saveCreds: async () => {
      memoryCache.set(`creds_${tenantId}`, creds);
      await credsRef.set({ creds: JSON.stringify(creds, BufferJSON.replacer) });
    },
    clearState: async () => {
      memoryCache.clear();
      await credsRef.delete();
    }
  };
};