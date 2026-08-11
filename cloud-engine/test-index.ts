import dotenv from 'dotenv';
dotenv.config();

import { db } from './src/config/firebase-admin.js';
import { FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

async function run() {
  try {
    console.log("Intentando hacer la consulta...");
    await db.collectionGroup(FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS)
      .where('estado_paquete', '==', 'Activo')
      .get();
    console.log("Consulta exitosa (el índice ya existe).");
  } catch (error: any) {
    console.error("ERROR CAPTURADO:");
    console.error(error.message);
  }
  process.exit(0);
}

run();
