export type EstadoPago = 'Pagado' | 'Pendiente';
export type EstadoPaquete = 'Activo' | 'Recogido' | 'Atrasado';

/**
 * Modelo de un Registro de Locker (paquete) en la base de datos Firestore.
 */
export interface RegistroLocker {
  id_registro: string;
  numero_locker: number;
  nombre_cliente: string;
  telefono_cliente: string;
  contenido: string;
  estado_pago: EstadoPago;
  codigo_qr: string;
  codigo_manual: string;
  fecha_ingreso: any; // Date | FieldValue
  fecha_retiro: any | null; // Date | FieldValue | null
  estado_paquete: EstadoPaquete;
  notificacion_enviada: boolean;
  penalizacion_notificada: boolean;
  retiro_notificado?: boolean;
  monto_penalizacion: number;
  estado_sync?: 'pendiente_resolucion'; // Para registros offline
}

/**
 * Entrada para crear un nuevo RegistroLocker, omitiendo campos generados automáticamente.
 */
export type CreateRegistroInput = Omit<RegistroLocker, 'id_registro' | 'fecha_ingreso' | 'fecha_retiro' | 'estado_paquete' | 'notificacion_enviada' | 'penalizacion_notificada' | 'retiro_notificado' | 'monto_penalizacion'>;
