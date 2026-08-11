import { db } from '../config/firebase-admin.js';
import { logInfo, logError } from '../utils/logger.js';
import { isSessionActive, sendMessage } from '../whatsapp/session-manager.js';
import { generateQRImage } from '../whatsapp/qr-generator.js';
import { buildIngresoMessage } from '../whatsapp/message-templates.js';
import { RegistroLocker, Empresa, toWhatsAppJID, FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

/**
 * Inicia el listener de Firestore para detectar nuevos registros en todos los tenants activos.
 */
export function startNewRecordListener() {
  logInfo('Listeners', 'Iniciando listener global para nuevos registros...');

  // Escuchar a toda la collection group de registros_lockers
  // Esto requiere un índice compuesto en Firestore
  db.collectionGroup(FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS)
    .where('estado_paquete', '==', 'Activo')
    .onSnapshot(async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        // Solo nos importan los registros "added" que no tengan notificación enviada
        if (change.type === 'added') {
          const registro = change.doc.data() as RegistroLocker;
          
          if (registro.notificacion_enviada) continue;

          // Obtener el ID del tenant desde la ruta (empresas/{tenantId}/registros_lockers/{docId})
          const tenantId = change.doc.ref.parent.parent?.id;
          if (!tenantId) continue;

          try {
            // Verificar si el tenant tiene una sesión activa
            if (!isSessionActive(tenantId)) {
              logInfo('Listeners', `Ignorando registro ${registro.id_registro}: Tenant ${tenantId} no tiene WhatsApp activo.`);
              continue;
            }

            // Obtener datos de la empresa
            const empresaDoc = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).doc(tenantId).get();
            if (!empresaDoc.exists) continue;
            
            const empresa = empresaDoc.data() as Empresa;

            if (!empresa.estado_suscripcion) {
              logInfo('Listeners', `Ignorando registro ${registro.id_registro}: Tenant ${tenantId} suspendido.`);
              continue;
            }

            // Construir el mensaje y generar QR
            const mensaje = buildIngresoMessage(registro, empresa);
            const qrBase64 = await generateQRImage(registro.codigo_qr);
            const jid = toWhatsAppJID(registro.telefono_cliente, empresa.prefijo_telefono);

            // Enviar WhatsApp
            await sendMessage(tenantId, jid, mensaje, qrBase64);

            // Marcar como notificado
            await change.doc.ref.update({
              notificacion_enviada: true
            });

            logInfo('Listeners', `Notificación enviada para el registro ${registro.id_registro}`);
          } catch (error) {
            logError('Listeners', `Error procesando nuevo registro ${registro.id_registro}`, error);
          }
        }
      }
    }, (error) => {
      logError('Listeners', 'Error crítico en onSnapshot de registros_lockers', error);
    });
}
