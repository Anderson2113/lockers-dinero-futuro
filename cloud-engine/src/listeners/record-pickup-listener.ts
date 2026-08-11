import { db } from '../config/firebase-admin.js';
import { logInfo, logError } from '../utils/logger.js';
import { isSessionActive, sendMessage } from '../whatsapp/session-manager.js';
import { buildRetiroMessage } from '../whatsapp/message-templates.js';
import { RegistroLocker, Empresa, toWhatsAppJID, FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

/**
 * Inicia el listener de Firestore para detectar retiros de paquetes en todos los tenants activos.
 */
export function startRecordPickupListener() {
  logInfo('Listeners', 'Iniciando listener global para retiros de paquetes...');

  db.collectionGroup(FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS)
    .where('estado_paquete', '==', 'Recogido')
    .onSnapshot(async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added' || change.type === 'modified') {
          const registro = change.doc.data() as RegistroLocker;
          
          if (registro.retiro_notificado) continue;

          const tenantId = change.doc.ref.parent.parent?.id;
          if (!tenantId) continue;

          try {
            if (!isSessionActive(tenantId)) {
              logInfo('Listeners', `Ignorando retiro ${registro.id_registro}: Tenant ${tenantId} no tiene WhatsApp activo.`);
              continue;
            }

            const empresaDoc = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).doc(tenantId).get();
            if (!empresaDoc.exists) continue;
            
            const empresa = empresaDoc.data() as Empresa;

            if (!empresa.estado_suscripcion) {
              logInfo('Listeners', `Ignorando retiro ${registro.id_registro}: Tenant ${tenantId} suspendido.`);
              continue;
            }

            const mensaje = buildRetiroMessage(registro, empresa);
            const jid = toWhatsAppJID(registro.telefono_cliente, empresa.prefijo_telefono);

            await sendMessage(tenantId, jid, mensaje);

            await change.doc.ref.update({
              retiro_notificado: true
            });

            logInfo('Listeners', `Notificación de retiro enviada para el registro ${registro.id_registro}`);
          } catch (error) {
            logError('Listeners', `Error procesando retiro ${registro.id_registro}`, error);
          }
        }
      }
    }, (error) => {
      logError('Listeners', 'Error crítico en onSnapshot de retiros', error);
    });
}
