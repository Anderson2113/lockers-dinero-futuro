import dotenv from 'dotenv';
dotenv.config();

import { db } from '../src/config/firebase-admin.js';

async function run() {
  const tenantId = '0XEUcviju2rXtze1fzbF'; // ID del panel admin
  console.log('Simulando ingreso de paquete para:', tenantId);
  
  const ref = db.collection('empresas').doc(tenantId).collection('registros_lockers').doc();
  await ref.set({
    id_registro: ref.id,
    numero_locker: 1,
    nombre_cliente: 'Cliente Prueba',
    telefono_cliente: '59170000000', // Modifica si es necesario
    contenido: 'Paquete de Prueba',
    estado_pago: 'Pendiente',
    codigo_qr: 'QR_TEST',
    codigo_manual: 'MANUAL_TEST',
    fecha_ingreso: new Date(),
    fecha_retiro: null,
    estado_paquete: 'Activo',
    notificacion_enviada: false,
    penalizacion_notificada: false,
    monto_penalizacion: 0
  });
  console.log('Paquete simulado exitosamente con ID:', ref.id);
  process.exit(0);
}
run();