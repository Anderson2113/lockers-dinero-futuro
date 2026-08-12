import { Router, Request, Response } from 'express';
import { db } from '../../config/firebase-admin.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';
import { FIRESTORE_COLLECTIONS, Empresa } from '@gma-lockers/shared';
import { logInfo, logError } from '../../utils/logger.js';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();

// Proteger todas las rutas de tenant con requireAdminAuth
router.use(requireAdminAuth);

// Crear nueva empresa
router.post('/tenants', async (req: Request, res: Response) => {
  try {
    const { nombre_empresa, ubicacion, prefijo_telefono, cantidad_lockers, diasServicio } = req.body;
    
    const now = new Date();
    const venci = new Date(now.getTime() + ((diasServicio || 30) * 24 * 60 * 60 * 1000));
    
    // Generar código de acceso (LAV-XXX) y PIN (4 dígitos)
    const randomNum = Math.floor(100 + Math.random() * 900);
    const codigo_acceso = `LAV-${randomNum}`;
    const pin_acceso = Math.floor(1000 + Math.random() * 9000).toString();

    const nuevaEmpresa: Partial<Empresa> = {
      nombre_negocio: nombre_empresa,
      ubicacion: ubicacion || 'Sede Central',
      prefijo_telefono,
      cantidad_lockers: parseInt(cantidad_lockers, 10),
      estado_suscripcion: true,
      estado: 'activo',
      codigo_acceso,
      pin_acceso,
      fecha_creacion: FieldValue.serverTimestamp() as any,
      fecha_vencimiento: venci as any,
      configuracion_tarifas: {
        tarifa_base: 0,
        tarifa_penalizacion: 5,
        gracia_horas: 12
      }
    };

    const docRef = await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).add(nuevaEmpresa);
    logInfo('API', `Nueva empresa creada vía API: ${docRef.id} - Código: ${codigo_acceso}`);
    
    res.json({ success: true, id: docRef.id, codigo_acceso, pin_acceso });
  } catch (error: any) {
    logError('API', 'Error al crear empresa', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Suspender o reactivar empresa
router.patch('/tenants/:id/suspend', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { estado_suscripcion } = req.body;
    
    await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).doc(id).update({
      estado_suscripcion: !!estado_suscripcion
    });
    
    logInfo('API', `Estado de suscripción actualizado para ${id}: ${!!estado_suscripcion}`);
    res.json({ success: true });
  } catch (error: any) {
    logError('API', `Error al suspender empresa ${req.params.id}`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminar empresa (Soft Delete)
router.delete('/tenants/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    await db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).doc(id).update({
      estado: 'eliminado',
      estado_suscripcion: false
    });
    
    logInfo('API', `Empresa ${id} eliminada (Soft Delete)`);
    res.json({ success: true });
  } catch (error: any) {
    logError('API', `Error al eliminar empresa ${req.params.id}`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Extender días de servicio
router.patch('/tenants/:id/extend', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { dias } = req.body;
    
    const docRef = db.collection(FIRESTORE_COLLECTIONS.EMPRESAS).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }
    
    const emp = docSnap.data();
    let newVenci = new Date();
    
    if (emp?.fecha_vencimiento) {
      const currentVenci = emp.fecha_vencimiento.toDate ? emp.fecha_vencimiento.toDate() : new Date(emp.fecha_vencimiento);
      newVenci = currentVenci.getTime() > new Date().getTime() ? currentVenci : new Date();
    }
    
    newVenci = new Date(newVenci.getTime() + (parseInt(dias, 10) * 24 * 60 * 60 * 1000));
    
    await docRef.update({
      fecha_vencimiento: newVenci,
      estado_suscripcion: true
    });
    
    logInfo('API', `Suscripción extendida para ${id}. Vence: ${newVenci.toISOString()}`);
    res.json({ success: true });
  } catch (error: any) {
    logError('API', `Error al extender suscripción de ${req.params.id}`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

router.get('/tenants', (req, res) => { res.status(200).json({ status: 'ok', message: 'API Tenants Activa' }); });
