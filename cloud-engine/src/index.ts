/**
 * Punto de entrada principal del Motor Central en la Nube — GMA Lockers SaaS.
 *
 * Inicializa las variables de entorno, Firebase Admin SDK, el servidor Express,
 * y en fases futuras: el gestor de sesiones de WhatsApp, los listeners de
 * Firestore, y los trabajos programados (cron).
 *
 * @module index
 */

import dotenv from 'dotenv';
dotenv.config();

// Inicializar Firebase Admin SDK (se ejecuta al importar)
import './config/firebase-admin.js';

import { createServer } from './api/server.js';
import { logInfo, logError } from './utils/logger.js';
import { startNewRecordListener } from './listeners/new-record-listener.js';
import { startRecordPickupListener } from './listeners/record-pickup-listener.js';
import { startPenaltyCheckerCron } from './cron/penalty-checker.js';

import { startSession } from './whatsapp/session-manager.js';
import { db } from './config/firebase-admin.js';
import { FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

const CONTEXT = 'Main';
const PORT = parseInt(process.env['PORT'] || '3000', 10);

/**
 * Recupera todas las empresas activas de Firestore e inicia sus sesiones de WhatsApp.
 */
async function initializeActiveSessions() {
  logInfo(CONTEXT, 'Inicializando sesiones activas de WhatsApp...');
  try {
    const empresasSnapshot = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS)
      .where('estado_suscripcion', '==', true)
      .get();
      
    if (empresasSnapshot.empty) {
      logInfo(CONTEXT, 'No hay empresas activas para inicializar.');
      return;
    }

    let count = 0;
    for (const doc of empresasSnapshot.docs) {
      const tenantId = doc.id;
      // Iniciar sesión sin callbacks (ya que no estamos esperando el QR aquí)
      await startSession(tenantId).catch(err => {
        logError(CONTEXT, `Error al inicializar sesión para ${tenantId}`, err);
      });
      count++;
    }
    logInfo(CONTEXT, `Se inicializaron ${count} sesiones de WhatsApp.`);
  } catch (error) {
    logError(CONTEXT, 'Error al inicializar sesiones activas', error);
  }
}

// Iniciar Listeners y Cron Jobs
startNewRecordListener();
startRecordPickupListener();
startPenaltyCheckerCron();

// Inicializar sesiones de WhatsApp
initializeActiveSessions();

/**
 * Inicia el servidor Express y registra el mensaje de arranque.
 */
function main(): void {
  const app = createServer();

  app.listen(PORT, () => {
    logInfo(CONTEXT, `Motor Central en la Nube iniciado en puerto ${PORT}`, {
      port: PORT,
      node_env: process.env['NODE_ENV'] || 'development',
      pid: process.pid,
    });
  });
}

// --- Manejo global de errores no capturados ---

/**
 * Captura excepciones no manejadas para evitar caídas silenciosas.
 * Registra el error y termina el proceso con código de error.
 */
process.on('uncaughtException', (error: Error) => {
  logError(CONTEXT, 'Excepción no capturada — cerrando proceso', error);
  process.exit(1);
});

/**
 * Captura promesas rechazadas sin manejar.
 * Registra la advertencia sin detener el proceso.
 */
process.on('unhandledRejection', (reason: unknown) => {
  logError(CONTEXT, 'Promesa rechazada sin manejar', reason);
});

// --- Arranque ---
main();
