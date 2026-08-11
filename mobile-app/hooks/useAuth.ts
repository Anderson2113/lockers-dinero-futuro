import { useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const login = async (codigoEmpresa: string, pin: string) => {
    setLoading(true);
    try {
      if (!codigoEmpresa || !pin) {
        return { success: false, error: "El código de local y PIN son obligatorios" };
      }

      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.EMPRESAS),
        where('codigo_acceso', '==', codigoEmpresa)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, error: "Local no encontrado. Verifica el código." };
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      
      if (data.pin_acceso !== pin) {
         return { success: false, error: "El PIN ingresado es incorrecto." };
      }

      if (!data?.estado_suscripcion || data?.estado === 'eliminado') {
        return { success: false, error: "Suscripción suspendida o local eliminado." };
      }

      return { success: true, tenantId: docSnap.id, tenantData: data }; 
      
    } catch (err: any) {
      return { success: false, error: err.message || "Error al conectar" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // await firebaseAuth.signOut(); // Si usáramos auth real
  };

  return { login, logout, loading };
};
