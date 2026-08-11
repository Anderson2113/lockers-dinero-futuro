import QRCode from 'qrcode';

/**
 * Genera una imagen QR (base64) a partir de una cadena de texto.
 * Utilizado para generar el código QR que se enviará por WhatsApp.
 * 
 * @param text Texto a codificar en el QR.
 * @returns Cadena en formato base64 con la imagen QR.
 */
export async function generateQRImage(text: string): Promise<string> {
  try {
    // Retorna una promesa con la cadena base64 del QR
    return await QRCode.toDataURL(text);
  } catch (error) {
    throw new Error('Error al generar la imagen QR');
  }
}
