import 'dotenv/config';
import { db } from './config/firebase-admin.js';
import { FIRESTORE_COLLECTIONS, RegistroLocker, Empresa } from '@gma-lockers/shared';
import { logInfo } from './utils/logger.js';

async function validate() {
  const tenantId = 'tenant_chaos_b';
  const empresaDoc = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).doc(tenantId).get();
  if (!empresaDoc.exists) return logInfo('Chaos B', 'No hay empresa de prueba');
  
  const empresa = empresaDoc.data() as Empresa;
  const graciaHoras = empresa.configuracion_tarifas.gracia_horas;

  const registrosSnapshot = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS)
    .doc(tenantId)
    .collection(FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS)
    .where('estado_paquete', '==', 'Activo')
    .get();

  for (const regDoc of registrosSnapshot.docs) {
    const registro = regDoc.data() as RegistroLocker;
    const nowMs = Date.now();
    let fechaIngresoMs = (registro.fecha_ingreso as any).toDate().getTime();
    const createTimeMs = regDoc.createTime.toDate().getTime();

    const syncDelay = createTimeMs - fechaIngresoMs;
    const referenciaBaseMs = syncDelay > 3600000 ? createTimeMs : fechaIngresoMs;
    
    const horasTranscurridas = (nowMs - referenciaBaseMs) / (1000 * 60 * 60);
    
    logInfo('Chaos B', `Paquete: ${registro.id_registro}`);
    logInfo('Chaos B', `syncDelay: ${syncDelay} ms ( > 1h ? ${syncDelay > 3600000} )`);
    logInfo('Chaos B', `horas transcurridas calculadas: ${horasTranscurridas.toFixed(2)}`);
    logInfo('Chaos B', `¿Supera gracia de ${graciaHoras}h? : ${horasTranscurridas > graciaHoras}`);
    
    if (horasTranscurridas > graciaHoras) {
      logInfo('Chaos B', 'RESULTADO INCORRECTO: Fue penalizado');
    } else {
      logInfo('Chaos B', 'RESULTADO CORRECTO: No fue penalizado por gracia de sync');
    }
    
    // Limpiar BD
    await regDoc.ref.delete();
  }
  await empresaDoc.ref.delete();
  logInfo('Chaos B', 'Base de datos limpia.');
}
validate().catch(console.error);
