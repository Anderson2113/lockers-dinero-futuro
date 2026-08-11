import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Empresa, FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';
import { useAppStore } from '../stores/app-store';

export const useEmpresa = () => {
  const { tenantId, setTenantInfo } = useAppStore();
  const [empresaLive, setEmpresaLive] = useState<Empresa | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setEmpresaLive(null);
      return;
    }

    const ref = doc(db, FIRESTORE_COLLECTIONS.EMPRESAS, tenantId);
    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Empresa;
        // Convertir timestamp a Date
        if (data.fecha_vencimiento && (data.fecha_vencimiento as any).toDate) {
            data.fecha_vencimiento = (data.fecha_vencimiento as any).toDate();
        } else if (data.fecha_vencimiento) {
            data.fecha_vencimiento = new Date(data.fecha_vencimiento);
        }
        setEmpresaLive(data);
        // Actualizamos el store global también si es necesario, pero mejor mantener estado local reactivo
      }
    });

    return () => unsubscribe();
  }, [tenantId]);

  let daysUntilExpiration = null;
  if (empresaLive?.fecha_vencimiento) {
    const venci = new Date(empresaLive.fecha_vencimiento);
    const diffTime = venci.getTime() - new Date().getTime();
    daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return { empresaLive, daysUntilExpiration };
};
