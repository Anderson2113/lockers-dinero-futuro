/**
 * Configuración de tarifas para una empresa (Tenant).
 */
export interface ConfiguracionTarifas {
  tarifa_base: number;
  gracia_horas: number;
  tarifa_penalizacion: number;
}

/**
 * Modelo de una Empresa (Tenant) en la base de datos Firestore.
 */
export interface Empresa {
  id_empresa: string;
  nombre_negocio: string;
  ubicacion: string;
  cantidad_lockers: number;
  plan_suscripcion: string;
  configuracion_tarifas: ConfiguracionTarifas;
  estado_suscripcion: boolean;
  prefijo_telefono: string;
  codigo_empresa: string;
  codigo_acceso?: string;
  pin_acceso?: string;
  estado?: 'activo' | 'eliminado';
  pin_hash: string;
  whatsapp_session_id: string | null;
  whatsapp_vinculado: boolean;
  fecha_creacion: Date;
  ultima_actividad: Date;
  fecha_vencimiento?: Date;
  whatsapp_baneado?: boolean;
  whatsapp_ban_codigo?: number;
  whatsapp_ban_fecha?: any;
}

/**
 * Entrada para crear una nueva Empresa, omitiendo campos generados automáticamente.
 */
export type CreateEmpresaInput = Omit<Empresa, 'id_empresa' | 'fecha_creacion' | 'ultima_actividad' | 'whatsapp_session_id' | 'whatsapp_vinculado' | 'fecha_vencimiento'>;
