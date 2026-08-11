/**
 * Logger estructurado para el Motor Central en la Nube.
 *
 * Proporciona funciones de logging con formato estructurado JSON
 * para facilitar el monitoreo y depuración en producción.
 *
 * Formato de salida: [TIMESTAMP] [LEVEL] [CONTEXT] mensaje { datos }
 *
 * @module utils/logger
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

/**
 * Formatea una entrada de log en formato estructurado.
 *
 * @param level - Nivel de severidad del log
 * @param context - Módulo o componente que genera el log
 * @param message - Mensaje descriptivo del evento
 * @param data - Datos adicionales opcionales
 * @returns Cadena formateada para el log
 */
function formatLog(
  level: LogLevel,
  context: string,
  message: string,
  data?: unknown
): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] [${context}] ${message}`;

  if (data !== undefined) {
    const serialized =
      data instanceof Error
        ? { name: data.name, message: data.message, stack: data.stack }
        : data;
    return `${base} ${JSON.stringify(serialized)}`;
  }

  return base;
}

/**
 * Registra un mensaje informativo.
 *
 * @param context - Módulo o componente que genera el log
 * @param message - Mensaje descriptivo del evento
 * @param data - Datos adicionales opcionales para contexto
 */
export function logInfo(context: string, message: string, data?: unknown): void {
  console.log(formatLog('INFO', context, message, data));
}

/**
 * Registra una advertencia.
 *
 * @param context - Módulo o componente que genera el log
 * @param message - Mensaje descriptivo de la advertencia
 * @param data - Datos adicionales opcionales para contexto
 */
export function logWarn(context: string, message: string, data?: unknown): void {
  console.warn(formatLog('WARN', context, message, data));
}

/**
 * Registra un error.
 *
 * @param context - Módulo o componente que genera el log
 * @param message - Mensaje descriptivo del error
 * @param error - Objeto de error o datos adicionales opcionales
 */
export function logError(context: string, message: string, error?: unknown): void {
  console.error(formatLog('ERROR', context, message, error));
}
