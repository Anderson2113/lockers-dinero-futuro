/**
 * Configuración de Firebase Admin SDK para el Motor Central en la Nube.
 *
 * Inicializa la aplicación de Firebase Admin usando las credenciales por defecto
 * de la variable de entorno GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Este módulo exporta:
 * - `admin` — La instancia de la aplicación Firebase Admin inicializada.
 * - `db` — La instancia de Firestore para operaciones de base de datos.
 *
 * @module config/firebase-admin
 */

import { initializeApp, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { logInfo, logError } from '../utils/logger.js';

const CONTEXT = 'FirebaseAdmin';

let admin: App;
let db: Firestore;

try {
  /**
   * Inicializa la app de Firebase Admin con credenciales por defecto.
   * Lee automáticamente el archivo de cuenta de servicio desde
   * la ruta especificada en GOOGLE_APPLICATION_CREDENTIALS.
   */
  admin = initializeApp({
    credential: applicationDefault(),
  });

  db = getFirestore(admin);

  logInfo(CONTEXT, 'Firebase Admin SDK inicializado correctamente');
} catch (error) {
  logError(CONTEXT, 'Error al inicializar Firebase Admin SDK', error);
  throw new Error(
    'No se pudo inicializar Firebase Admin. Verifica que GOOGLE_APPLICATION_CREDENTIALS esté configurado correctamente.'
  );
}

export { admin, db };
