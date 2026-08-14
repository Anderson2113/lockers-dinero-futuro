const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

// 1. Cargar la llave maestra de Firebase
const serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));

// 2. Inicializar la conexión (Formato Modular Moderno)
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function ejecutarSimulacion() {
  const tenantId = 'LAV-835'; 
  
  // ⚠️ REEMPLAZA ESTO: Pon tu número de celular real, empezando con 591, SIN el símbolo "+"
  const telefonoDestino = '59170537902'; 

  // Simulamos la estructura de un paquete recién ingresado
  const paqueteFalso = {
    casilla: 'M-01', 
    estado: 'depositado', 
    telefono: telefonoDestino,
    codigo_retiro: '7777',
    fecha_registro: FieldValue.serverTimestamp(),
    nota: 'Simulación de Inyección'
  };

  console.log(`🚀 Conectando a Firebase e inyectando paquete para el local ${tenantId}...`);

  try {
    const docRef = await db.collection('empresas').doc(tenantId).collection('paquetes').add(paqueteFalso);
    
    console.log(`✅ ¡INYECCIÓN EXITOSA!`);
    console.log(`📦 Documento creado en Firebase con ID: ${docRef.id}`);
    console.log(`\n👉 Ve a la pestaña de Logs en Render.com.`);
    console.log(`El backend debería detectar esta inyección al instante y enviar el WhatsApp a ${telefonoDestino}.`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error al romper la Matrix:`, error);
    process.exit(1);
  }
}

ejecutarSimulacion();