import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, runTransaction, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { RegistroLocker, CreateRegistroInput, FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';
import NetInfo from '@react-native-community/netinfo';

export const createRegistro = async (tenantId: string, input: CreateRegistroInput) => {
  const collectionRef = collection(db, FIRESTORE_COLLECTIONS.EMPRESAS, tenantId, FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS);
  const newDocRef = doc(collectionRef);
  
  const registro: RegistroLocker = {
    ...input,
    id_registro: newDocRef.id,
    fecha_ingreso: new Date() as any,
    fecha_retiro: null,
    estado_paquete: 'Activo',
    notificacion_enviada: false,
    penalizacion_notificada: false,
    retiro_notificado: false,
    monto_penalizacion: 0,
  };

  const netInfo = await NetInfo.fetch();
  const isOnline = netInfo.isConnected;

  if (!isOnline) {
    console.warn("OFFLINE MODE: Using setDoc directly (offline fallback)");
    await setDoc(newDocRef, registro);
    return registro;
  }

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Verify if the locker is already assigned and active
      const q = query(
        collectionRef, 
        where('numero_locker', '==', input.numero_locker),
        where('estado_paquete', 'in', ['Activo', 'Atrasado'])
      );
      
      const existing = await getDocs(q); 
      if (!existing.empty) {
        throw new Error('LOCKER_OCCUPIED');
      }
      
      transaction.set(newDocRef, registro);
    });
    return registro;
  } catch (error: any) {
    if (error.message === 'LOCKER_OCCUPIED') {
      throw error;
    }
    // Fallback offline o error de red
    console.warn("TRANSACTION FAILED, attempting setDoc fallback", error);
    await setDoc(newDocRef, registro);
    return registro;
  }
};

export const markAsPickedUp = async (tenantId: string, recordId: string) => {
  const ref = doc(db, FIRESTORE_COLLECTIONS.EMPRESAS, tenantId, FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS, recordId);

  await updateDoc(ref, {
    estado_paquete: 'Recogido',
    estado_pago: 'Pagado',
    fecha_retiro: serverTimestamp()
  });
};
