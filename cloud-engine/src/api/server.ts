/**
 * Configuración del servidor Express para el Motor Central en la Nube.
 *
 * Crea y configura la aplicación Express con middlewares de CORS,
 * parsing de JSON, y las rutas de la API. No inicia el listener —
 * eso se hace en index.ts para facilitar testing y control de ciclo de vida.
 *
 * @module api/server
 */

import express, { type Express } from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import tenantRoutes from './routes/tenant.routes.js';

/**
 * Crea y configura la aplicación Express.
 *
 * Middlewares aplicados:
 * - CORS: Permite orígenes definidos en ALLOWED_ORIGINS (separados por coma)
 * - express.json(): Parseo automático de cuerpos JSON
 *
 * Rutas montadas:
 * - / → Health check (GET /health)
 * - / → WhatsApp API (POST /api/vincular-wa, DELETE /api/desvincular-wa/:tenantId)
 * - /api → Tenant Management (POST /api/tenants, PATCH ...)
 *
 * @returns La aplicación Express configurada (sin listener activo)
 */
export function createServer(): Express {
  const app = express();

  // --- Middlewares ---
  const allowedOriginsEnv = (process.env['ALLOWED_ORIGINS'] || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  // Electron packaged apps make requests from file:// or with null Origin.
  // We allow all configured origins plus null (packaged Electron) and electron:// (dev Electron).
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (file://, curl, Postman, packaged Electron)
        if (!origin) return callback(null, true);
        if (allowedOriginsEnv.includes(origin)) return callback(null, true);
        if (origin.startsWith('electron://')) return callback(null, true);
        callback(new Error(`CORS: Origin '${origin}' not allowed`));
      },
      credentials: true,
    })
  );

  app.use(express.json());

  // --- Rutas ---
  app.use(healthRoutes);
  app.use(whatsappRoutes);
  app.use('/api', tenantRoutes);

  return app;
}
