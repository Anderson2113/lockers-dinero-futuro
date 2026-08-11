import { AuthenticationCreds, AuthenticationState, BufferJSON, initAuthCreds, SignalDataTypeMap } from '@whiskeysockets/baileys';
import { db } from '../config/firebase-admin.js';
import { logInfo, logError } from '../utils/logger.js';

export async function useFirestoreAuthState(tenantId: string) {
  const collectionRef = db.collection('empresas').doc(tenantId).collection('whatsapp_auth');

  const readData = async (id: string) => {
    try {
      const docSnap = await collectionRef.doc(id).get();
      if (docSnap.exists) {
        const dataStr = docSnap.data()?.data;
        return JSON.parse(dataStr, BufferJSON.reviver);
      }
      return null;
    } catch (error) {
      logError('Auth', `Error leyendo ${id} de Firestore`, error);
      return null;
    }
  };

  const writeData = async (data: any, id: string) => {
    try {
      const dataStr = JSON.stringify(data, BufferJSON.replacer);
      await collectionRef.doc(id).set({ data: dataStr });
    } catch (error) {
      logError('Auth', `Error escribiendo ${id} en Firestore`, error);
    }
  };

  const removeData = async (id: string) => {
    try {
      await collectionRef.doc(id).delete();
    } catch (error) {
      logError('Auth', `Error eliminando ${id} de Firestore`, error);
    }
  };

  const creds = await readData('creds') || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: { [key: string]: SignalDataTypeMap[keyof SignalDataTypeMap] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = { ...value, value: Buffer.from(value.value) }; // ensure value is Buffer
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const fileId = `${category}-${id}`;
              tasks.push(value ? writeData(value, fileId) : removeData(fileId));
            }
          }
          await Promise.all(tasks);
        }
      }
    } as AuthenticationState,
    saveCreds: () => {
      return writeData(creds, 'creds');
    },
    clearState: async () => {
      try {
        const snapshot = await collectionRef.get();
        const batch = db.batch();
        snapshot.docs.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        logInfo('Auth', `Estado de sesión eliminado para tenant: ${tenantId}`);
      } catch (error) {
        logError('Auth', `Error limpiando estado para tenant: ${tenantId}`, error);
      }
    }
  };
}
