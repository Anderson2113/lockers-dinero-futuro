import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { logInfo, logError, logWarn } from '../utils/logger.js';
import { useFirestoreAuthState } from './firestore-auth-state.js';
import { db } from '../config/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

// Map en memoria para guardar los sockets activos por tenant
const activeSessions = new Map<string, ReturnType<typeof makeWASocket>>();
const reconnectAttempts = new Map<string, number>();
const BACKOFF_SCHEDULE = [1000, 5000, 30000, 300000]; // 1s, 5s, 30s, 5min

/**
 * Inicia una nueva sesión de Baileys para un tenant específico.
 * 
 * @param tenantId ID del tenant (empresa).
 * @param onQR Callback que se ejecuta cuando se genera un QR para vinculación.
 * @param onConnected Callback que se ejecuta cuando la sesión se establece exitosamente.
 */
export async function startSession(
  tenantId: string, 
  onQR?: (qr: string) => void,
  onConnected?: () => void
): Promise<void> {
  const { state, saveCreds, clearState } = await useFirestoreAuthState(tenantId);

  logInfo('WhatsApp', `Iniciando sesión para tenant: ${tenantId}`);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update: any) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && onQR) {
      logInfo('WhatsApp', `QR generado para tenant: ${tenantId}`);
      onQR(qr);
    }

    if (connection === 'close') {
      activeSessions.delete(tenantId);
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      
      logWarn('WhatsApp', `Conexión cerrada para tenant: ${tenantId}. StatusCode: ${statusCode}`);
      
      switch (statusCode) {
        case DisconnectReason.loggedOut:
          // Logout explícito — limpiar sesión
          await clearState();
          reconnectAttempts.delete(tenantId);
          break;
          
        case 403: // Baneado por Meta
        case 405: // Rate limited
        case 410: // Gone (número desactivado)
          // Marcar en Firestore para alertar al panel .exe
          await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).doc(tenantId).set({
            whatsapp_baneado: true,
            whatsapp_ban_codigo: statusCode,
            whatsapp_ban_fecha: FieldValue.serverTimestamp(),
          }, { merge: true });
          logError('WhatsApp', `Tenant ${tenantId} BANEADO (código ${statusCode})`);
          reconnectAttempts.delete(tenantId);
          break;
          
        default:
          // Reconexión con backoff exponencial
          const attempt = reconnectAttempts.get(tenantId) || 0;
          const delay = BACKOFF_SCHEDULE[Math.min(attempt, BACKOFF_SCHEDULE.length - 1)];
          reconnectAttempts.set(tenantId, attempt + 1);
          
          logWarn('WhatsApp', `Reconectando ${tenantId} en ${delay/1000}s (intento ${attempt + 1})`);
          setTimeout(() => startSession(tenantId), delay);
      }
    }

    if (connection === 'open') {
      logInfo('WhatsApp', `Conexión establecida para tenant: ${tenantId}`);
      activeSessions.set(tenantId, sock);
      reconnectAttempts.delete(tenantId); // Reset en conexión exitosa
      if (onConnected) onConnected();
    }
  });
}

/**
 * Detiene y elimina la sesión de un tenant.
 */
export async function stopSession(tenantId: string): Promise<void> {
  const sock = activeSessions.get(tenantId);
  if (sock) {
    logInfo('WhatsApp', `Cerrando sesión para tenant: ${tenantId}`);
    sock.logout();
    activeSessions.delete(tenantId);
  }
}

/**
 * Verifica si un tenant tiene una sesión activa.
 */
export function isSessionActive(tenantId: string): boolean {
  return activeSessions.has(tenantId);
}

/**
 * Envía un mensaje (con o sin imagen) a través de la sesión de un tenant.
 * 
 * @param tenantId ID del tenant que envía el mensaje.
 * @param jid Identificador de destino de WhatsApp (ej. 59112345678@s.whatsapp.net).
 * @param text Texto del mensaje.
 * @param imageBase64 Data URI de la imagen (opcional).
 */
export async function sendMessage(tenantId: string, jid: string, text: string, imageBase64?: string): Promise<void> {
  const sock = activeSessions.get(tenantId);
  if (!sock) {
    throw new Error(`No hay sesión activa para el tenant: ${tenantId}`);
  }

  try {
    if (imageBase64) {
      // Extraer el buffer de la cadena base64 (ej. "data:image/png;base64,iVBORw0KGgo...")
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      await sock.sendMessage(jid, { 
        image: buffer, 
        caption: text 
      });
    } else {
      await sock.sendMessage(jid, { text });
    }
    logInfo('WhatsApp', `Mensaje enviado correctamente a ${jid} desde tenant ${tenantId}`);
  } catch (error) {
    logError('WhatsApp', `Error enviando mensaje a ${jid} desde tenant ${tenantId}`, error);
    throw error;
  }
}
