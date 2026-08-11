import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { RegistroLocker, FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';
import { useAppStore } from '../stores/app-store';

export const useLockers = () => {
  const { tenantId } = useAppStore();
  const [lockers, setLockers] = useState<RegistroLocker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLockers([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.EMPRESAS, tenantId, FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS),
      where('estado_paquete', 'in', ['Activo', 'Atrasado'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        // Convertir Timestamps a Date
        return {
          ...docData,
          fecha_ingreso: docData.fecha_ingreso?.toDate ? docData.fecha_ingreso.toDate() : docData.fecha_ingreso,
          fecha_retiro: docData.fecha_retiro?.toDate ? docData.fecha_retiro.toDate() : docData.fecha_retiro,
        } as RegistroLocker;
      });
      setLockers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching lockers: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tenantId]);

  return { lockers, loading };
};
