/**
 * Request para vincular WhatsApp (Motor Nube).
 */
export interface VincularWhatsAppRequest {
  tenant_id: string;
}

/**
 * Response al vincular WhatsApp.
 */
export interface VincularWhatsAppResponse {
  success: boolean;
  qr_base64?: string;
  error?: string;
}

/**
 * Response al desvincular WhatsApp.
 */
export interface DesvincularWhatsAppResponse {
  success: boolean;
  error?: string;
}

/**
 * Response del Health Check (Motor Nube).
 */
export interface HealthCheckResponse {
  status: string;
  uptime: number;
  active_sessions: number;
  timestamp: string;
}

/**
 * Response al generar nuevas credenciales para el APK.
 */
export interface GenerarCredencialesResponse {
  codigo_empresa: string;
  pin: string;
}
