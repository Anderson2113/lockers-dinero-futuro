import 'dotenv/config';
import { db } from './config/firebase-admin.js';
import { FIRESTORE_COLLECTIONS, RegistroLocker, Empresa } from '@gma-lockers/shared';
import { Timestamp } from 'firebase-admin/firestore';
import { startPenaltyCheckerCron } from './cron/penalty-checker.js';
import { logInfo } from './utils/logger.js';

// Simulamos que el cron se ejecuta inmediatamente llamando a la logica interna
// Pero como el cron usa setInterval, vamos a aislar la logica para probarla

async function runChaosB() {
  logInfo('Chaos', 'Iniciando Prueba B: Sincronización Tardía');
  
  // 1. Crear empresa de prueba
  const tenantRef = db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).doc('tenant_chaos_b');
  const testEmpresa: Partial<Empresa> = {
    nombre_negocio: 'Local de Prueba (Caos B)',
    estado_suscripcion: true,
    configuracion_tarifas: {
      tarifa_base: 0,
      gracia_horas: 1, 
      tarifa_penalizacion: 10 
    }
  };
  await tenantRef.set(testEmpresa);

  // 2. Inyectar paquete con 2 horas de retraso en fecha_ingreso
  const now = Date.now();
  const dosHorasAtras = new Date(now - (2 * 60 * 60 * 1000));
  
  const registroRef = tenantRef.collection(FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS).doc('paquete_retrasado');
  
  // Usamos set para forzar el createTime a AHORA, pero fecha_ingreso al PASADO
  await registroRef.set({
    id_registro: 'paquete_retrasado',
    nombre_cliente: 'TEST_CAOS_SYNC',
    estado_paquete: 'Activo',
    estado_sync: 'pendiente_resolucion',
    penalizacion_notificada: false,
    fecha_ingreso: Timestamp.fromDate(dosHorasAtras)
  });

  logInfo('Chaos', 'Documento inyectado. Esperando 3 segundos para que Firestore asiente el createTime...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 3. Verificamos el createTime y fecha_ingreso
  const docSnap = await registroRef.get();
  logInfo('Chaos', `createTime real del server: ${docSnap.createTime?.toDate().toISOString()}`);
  logInfo('Chaos', `fecha_ingreso guardada: ${(docSnap.data() as any).fecha_ingreso.toDate().toISOString()}`);

  logInfo('Chaos', 'Prueba configurada exitosamente. Se puede ejecutar el Cron real o validar la logica aislandola.');
}

runChaosB().catch(console.error);
