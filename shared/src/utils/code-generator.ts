import { CODIGO_MANUAL_PREFIX, CODIGO_MANUAL_LENGTH, CODIGO_EMPRESA_PREFIX, CODIGO_EMPRESA_LENGTH } from '../constants/config.js';

/**
 * Genera un código alfanumérico aleatorio.
 */
function generateRandomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Genera un código manual para un paquete (ej. L-4592).
 */
export function generateCodigoManual(): string {
  return `${CODIGO_MANUAL_PREFIX}${generateRandomAlphanumeric(CODIGO_MANUAL_LENGTH)}`;
}

/**
 * Genera un código de empresa para login en APK (ej. GMA-A7K2).
 */
export function generateCodigoEmpresa(): string {
  return `${CODIGO_EMPRESA_PREFIX}${generateRandomAlphanumeric(CODIGO_EMPRESA_LENGTH)}`;
}

/**
 * Genera un PIN numérico de 6 dígitos.
 */
export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Genera un hash único (UUID-like) para codificar en el QR.
 */
export function generateCodigoQR(): string {
  // Use a fallback for React Native where crypto.randomUUID() might not be available
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
