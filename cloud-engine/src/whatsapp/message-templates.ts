import { RegistroLocker, Empresa } from '@gma-lockers/shared';

/**
 * Genera el mensaje de WhatsApp para el ingreso de un nuevo paquete.
 * 
 * @param registro Datos del registro del locker.
 * @param empresa Datos de la empresa (tenant).
 * @returns Cadena de texto formateada para el mensaje.
 */
export function buildIngresoMessage(registro: RegistroLocker, empresa: Empresa): string {
  const isPagado = registro.estado_pago === 'Pagado';
  const nombreLocal = (empresa as any).nombre_empresa || empresa.nombre_negocio || 'el local';
  const ubicacionLocal = empresa.ubicacion || 'la sede central';
  
  return `📦 *NUEVO PAQUETE RECIBIDO* 📦

Hola *${registro.nombre_cliente}*,
Tienes un nuevo paquete esperando por ti en *${nombreLocal}*.

📍 *Ubicación de recojo:* ${ubicacionLocal}
🔢 *Número de Locker:* ${registro.numero_locker}
🏷️ *Contenido:* ${registro.contenido}
💵 *Estado de Pago:* ${isPagado ? '✅ Pagado' : '❌ Pendiente (Pagar al recoger)'}

*Para retirar tu paquete:*
Muestra el Código QR adjunto a este mensaje al operario del local. 
Si tienes problemas con el QR, puedes dictarle tu código manual: *${registro.codigo_manual}*

¡Te esperamos!
`;
}

/**
 * Genera el mensaje de WhatsApp de alerta de penalización por atraso.
 * 
 * @param registro Datos del registro del locker atrasado.
 * @param empresa Datos de la empresa (tenant).
 * @returns Cadena de texto formateada para la alerta.
 */
export function buildPenalizacionMessage(registro: RegistroLocker, empresa: Empresa): string {
  const nombreLocal = (empresa as any).nombre_empresa || empresa.nombre_negocio || 'el local';
  const ubicacionLocal = empresa.ubicacion || 'la sede central';

  return `⚠️ *ALERTA DE PENALIZACIÓN* ⚠️

Hola *${registro.nombre_cliente}*,
Te recordamos que tu paquete (Locker ${registro.numero_locker}) en *${nombreLocal}* ha excedido el tiempo de gracia gratuito de ${empresa.configuracion_tarifas?.gracia_horas || 0} horas.

Se ha aplicado un recargo por almacenaje prolongado.
💰 *Monto de penalización actual:* $${registro.monto_penalizacion.toFixed(2)}

📍 *Ubicación de recojo:* ${ubicacionLocal}

Por favor, recoge tu paquete lo antes posible para evitar que los cargos sigan incrementando.
`;
}

/**
 * Genera el mensaje de WhatsApp de confirmación de retiro.
 * 
 * @param registro Datos del registro del locker.
 * @param empresa Datos de la empresa (tenant).
 * @returns Cadena de texto formateada para el mensaje de retiro exitoso.
 */
export function buildRetiroMessage(registro: RegistroLocker, empresa: Empresa): string {
  const nombreLocal = (empresa as any).nombre_empresa || empresa.nombre_negocio || 'el local';

  return `✅ *RETIRO EXITOSO* ✅

Hola *${registro.nombre_cliente}*,
Confirmamos que tu paquete ha sido retirado con éxito de *${nombreLocal}*.

🔢 *Locker Liberado:* ${registro.numero_locker}
🏷️ *Contenido:* ${registro.contenido}
📅 *Fecha de Retiro:* ${new Date().toLocaleString('es-ES')}

¡Gracias por utilizar nuestros servicios! Te esperamos pronto.
`;
}
