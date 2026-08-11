import cron from 'node-cron';
import { db } from '../config/firebase-admin.js';
import { logInfo, logError } from '../utils/logger.js';
import { isSessionActive, sendMessage } from '../whatsapp/session-manager.js';
import { buildPenalizacionMessage } from '../whatsapp/message-templates.js';
import { RegistroLocker, Empresa, toWhatsAppJID, CRON_INTERVAL, FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Inicia el cron job que verifica cada hora los paquetes atrasados.
 */
export function startPenaltyCheckerCron() {
  logInfo('Cron', `Iniciando Cron Job de penalizaciones con intervalo: ${CRON_INTERVAL}`);

  cron.schedule(CRON_INTERVAL, async () => {
    logInfo('Cron', 'Ejecutando revisión de paquetes atrasados...');
    
    try {
      const nowMs = Date.now();
      
      // Obtener todas las empresas activas
      const empresasSnapshot = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS)
        .where('estado_suscripcion', '==', true)
        .get();

      for (const empresaDoc of empresasSnapshot.docs) {
        const tenantId = empresaDoc.id;
        const empresa = empresaDoc.data() as Empresa;
        const graciaHoras = empresa.configuracion_tarifas.gracia_horas;
        const graciaMs = graciaHoras * 60 * 60 * 1000;

        // Solo procesar si el tenant tiene sesión de WA activa (si no, no podemos enviar alerta)
        if (!isSessionActive(tenantId)) continue;

        // Buscar paquetes 'Activos' (no recogidos) de esta empresa
        const registrosSnapshot = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS)
          .doc(tenantId)
          .collection(FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS)
          .where('estado_paquete', '==', 'Activo')
          .get();

        for (const regDoc of registrosSnapshot.docs) {
          const registro = regDoc.data() as RegistroLocker;
          
          // Lógica de "gracia de sincronización"
          let fechaIngresoMs: number;
          if (registro.fecha_ingreso && (registro.fecha_ingreso as any).toDate) {
            fechaIngresoMs = (registro.fecha_ingreso as any).toDate().getTime();
          } else {
             fechaIngresoMs = new Date(registro.fecha_ingreso).getTime();
          }

          const createTimeMs = regDoc.createTime.toDate().getTime();

          // Si el documento tardó más de 1h en llegar al servidor (sync tardía offline)
          const syncDelay = createTimeMs - fechaIngresoMs;
          const referenciaBaseMs = syncDelay > 3600000 ? createTimeMs : fechaIngresoMs;
          
          const horasTranscurridas = (nowMs - referenciaBaseMs) / (1000 * 60 * 60);

          // Si excedió el tiempo de gracia y no ha sido notificado
          if (horasTranscurridas > graciaHoras && !registro.penalizacion_notificada) {
            
            // Calcular monto penalización (redondeado hacia arriba por horas completas excedidas)
            const horasExcedidas = Math.ceil(horasTranscurridas - graciaHoras);
            const monto = horasExcedidas * empresa.configuracion_tarifas.tarifa_penalizacion;

            const jid = toWhatsAppJID(registro.telefono_cliente, empresa.prefijo_telefono);
            const registroAtrasado: RegistroLocker = { ...registro, monto_penalizacion: monto };
            
            const mensaje = buildPenalizacionMessage(registroAtrasado, empresa);

            try {
               await sendMessage(tenantId, jid, mensaje);
               
               // Actualizar en BD
               await regDoc.ref.update({
                 estado_paquete: 'Atrasado',
                 monto_penalizacion: monto,
                 penalizacion_notificada: true
               });
               
               logInfo('Cron', `Penalización aplicada y notificada para registro ${registro.id_registro}`);
            } catch (err) {
               logError('Cron', `Fallo al enviar alerta de penalización para ${registro.id_registro}`, err);
            }
          }
        }
      }
    } catch (error) {
      logError('Cron', 'Error durante la ejecución del cron de penalizaciones', error);
    }
  });
}
