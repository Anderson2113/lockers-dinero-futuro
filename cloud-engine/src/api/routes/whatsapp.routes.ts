/**
 * Rutas de gestión de sesiones de WhatsApp.
 *
 * Estos endpoints permiten vincular y desvincular cuentas de WhatsApp
 * para cada tenant del sistema. La implementación completa se realizará
 * en la Fase 2 con la integración de Baileys.
 *
 * @module api/routes/whatsapp
 */

import { Router, type Request, type Response } from 'express';
import { isSessionActive, startSession, stopSession } from '../../whatsapp/session-manager.js';
import { logInfo, logError } from '../../utils/logger.js';

// TODO: Definir estos tipos en @gma-lockers/shared en el futuro, o definirlos localmente por ahora
interface VincularWhatsAppRequest {
  tenant_id: string;
}
interface VincularWhatsAppResponse {
  success: boolean;
  qr_base64?: string;
  error?: string;
}
interface DesvincularWhatsAppResponse {
  success: boolean;
  error?: string;
}

const router = Router();

/**
 * POST /api/vincular-wa
 *
 * Inicia el proceso de vinculación de una cuenta de WhatsApp para un tenant.
 */
router.post('/api/vincular-wa', async (req: Request<{}, {}, VincularWhatsAppRequest>, res: Response<VincularWhatsAppResponse>) => {
  const { tenant_id } = req.body;

  if (!tenant_id) {
    res.status(400).json({ success: false, error: 'tenant_id es requerido' });
    return;
  }

  if (isSessionActive(tenant_id)) {
    res.status(400).json({ success: false, error: 'El tenant ya tiene una sesión activa' });
    return;
  }

  logInfo('API', `Petición para vincular WA recibida: ${tenant_id}`);

  try {
    let qrSent = false;
    
    await startSession(tenant_id, 
      (qr) => {
        if (!qrSent) {
          qrSent = true;
          import('../../whatsapp/qr-generator.js').then(({ generateQRImage }) => {
            generateQRImage(qr).then(qr_base64 => {
              res.json({ success: true, qr_base64 });
            });
          });
        }
      },
      () => {
        if (!qrSent) {
          qrSent = true;
          res.json({ success: true });
        }
      }
    );
    
    setTimeout(() => {
      if (!qrSent) {
        qrSent = true;
        stopSession(tenant_id);
        res.status(504).json({ success: false, error: 'Timeout esperando el QR de WhatsApp' });
      }
    }, 15000);

  } catch (error: any) {
    logError('API', `Error iniciando vinculación para ${tenant_id}`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/desvincular-wa/:tenantId
 * Cierra la sesión activa de WhatsApp para un tenant.
 */
router.delete('/api/desvincular-wa/:tenantId', async (req: Request<{ tenantId: string }>, res: Response<DesvincularWhatsAppResponse>) => {
  const { tenantId } = req.params;

  if (!tenantId) {
    res.status(400).json({
      success: false,
      error: 'Se requiere el parámetro tenantId',
    });
    return;
  }

  try {
    if (!isSessionActive(tenantId)) {
       res.status(400).json({ success: false, error: 'No hay sesión activa para desvincular' });
       return;
    }

    await stopSession(tenantId);
    logInfo('API', `Sesión de WA desvinculada exitosamente para ${tenantId}`);
    
    res.json({ success: true });
  } catch (error: any) {
    logError('API', `Error desvinculando WA para ${tenantId}`, error);
    res.status(500).json({ success: false, error: error.message || 'Error interno' });
  }
});

export default router;
