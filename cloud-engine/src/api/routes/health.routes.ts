/**
 * Rutas de verificación de salud del servidor.
 *
 * Proporciona un endpoint para monitorear el estado del Motor Central,
 * incluyendo el tiempo de actividad y las sesiones activas de WhatsApp.
 *
 * @module api/routes/health
 */

import { Router, type Request, type Response } from 'express';
import type { HealthCheckResponse } from '@gma-lockers/shared';

const router = Router();

/**
 * GET /health
 *
 * Retorna el estado actual del servidor incluyendo:
 * - status: Estado general ('ok' o 'degraded')
 * - uptime: Tiempo de actividad del proceso en segundos
 * - active_sessions: Número de sesiones de WhatsApp activas (placeholder por ahora)
 * - timestamp: Marca de tiempo ISO de la respuesta
 */
router.get('/health', (_req: Request, res: Response) => {
  const response: HealthCheckResponse = {
    status: 'ok',
    uptime: process.uptime(),
    active_sessions: 0, // TODO Phase 2: Obtener conteo real del SessionManager
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});

export default router;
