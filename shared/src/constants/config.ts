export const DEFAULT_PREFIJO_TELEFONO = '+591';

export const CODIGO_MANUAL_PREFIX = 'L-';
export const CODIGO_MANUAL_LENGTH = 4;

export const CODIGO_EMPRESA_PREFIX = 'GMA-';
export const CODIGO_EMPRESA_LENGTH = 4;

export const CRON_INTERVAL = '0 * * * *'; // Cada hora
export const DEFAULT_GRACIA_HORAS = 48;

export const FIRESTORE_COLLECTIONS = {
  EMPRESAS: 'empresas',
  REGISTROS_LOCKERS: 'registros_lockers',
  METRICAS: 'metricas_mensuales'
} as const;
