/**
 * Asegura que el número de teléfono tenga el prefijo del país.
 * Elimina ceros a la izquierda y caracteres no numéricos, y añade el prefijo si es necesario.
 * 
 * @param phone Número de teléfono ingresado.
 * @param prefix Prefijo del país (ej. '+591').
 * @returns Número formateado con el prefijo.
 */
export function formatPhoneNumber(phone: string, prefix: string): string {
  // Eliminar todos los caracteres no numéricos
  let cleanPhone = phone.replace(/\D/g, '');
  
  const cleanPrefix = prefix.replace(/\D/g, '');

  // Si ya empieza con el prefijo (sin el +), lo dejamos
  if (cleanPhone.startsWith(cleanPrefix)) {
    return `+${cleanPhone}`;
  }

  // Eliminar ceros a la izquierda si los hay (común en llamadas locales)
  cleanPhone = cleanPhone.replace(/^0+/, '');

  return `${prefix}${cleanPhone}`;
}

/**
 * Convierte un número de teléfono al formato JID requerido por WhatsApp Baileys.
 * 
 * @param phone Número de teléfono (con o sin prefijo).
 * @param prefix Prefijo del país (ej. '+591').
 * @returns Cadena en formato JID (ej. '59112345678@s.whatsapp.net').
 */
export function toWhatsAppJID(phone: string, prefix: string): string {
  const formattedPhone = formatPhoneNumber(phone, prefix);
  // Eliminar el '+' para el formato JID
  const cleanPhone = formattedPhone.replace('+', '');
  return `${cleanPhone}@s.whatsapp.net`;
}

/**
 * Validación básica de un número de teléfono.
 * 
 * @param phone Número de teléfono a validar.
 * @returns `true` si es válido, `false` de lo contrario.
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Validación muy básica: después de limpiar no-dígitos, debe tener al menos 7 números.
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 7;
}
