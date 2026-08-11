import dotenv from 'dotenv';
dotenv.config();

import '../src/config/firebase-admin.js';
import { db } from '../src/config/firebase-admin.js';
import { FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

async function backdatePackages() {
  console.log('⏳ Alterando fechas de paquetes activos para simular atraso de 24 horas...');
  
  const empresasSnapshot = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).get();
  
  let count = 0;
  const now = new Date();
  // 24 horas atrás
  const backdatedTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));

  for (const empresaDoc of empresasSnapshot.docs) {
    const tenantId = empresaDoc.id;
    const registrosSnapshot = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS)
      .doc(tenantId)
      .collection(FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS)
      .where('estado_paquete', '==', 'Activo')
      .get();

    for (const regDoc of registrosSnapshot.docs) {
      await regDoc.ref.update({
        fecha_ingreso: backdatedTime,
        penalizacion_notificada: false
      });
      count++;
    }
  }
  
  console.log(`✅ Se modificaron ${count} paquetes para que parezcan tener 24 horas de antigüedad.`);
  console.log('👉 Ahora espera al inicio de la siguiente hora para que el Cron Job lo detecte, o fuerza el cron en tu código local.');
  process.exit(0);
}

backdatePackages().catch(console.error);
