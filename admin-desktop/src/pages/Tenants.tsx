import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Empresa } from '@gma-lockers/shared';
import { FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';
import { apiClient } from '../services/api-client';

export default function Tenants() {
  const [showForm, setShowForm] = useState(false);
  const [empresas, setEmpresas] = useState<(Empresa & { id: string })[]>([]);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [prefijo, setPrefijo] = useState('+591');
  const [lockers, setLockers] = useState('10');
  const [diasServicio, setDiasServicio] = useState('30');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  } | null>(null);

  const [promptModal, setPromptModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    defaultValue: string;
    onConfirm: (val: string) => void;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, FIRESTORE_COLLECTIONS.EMPRESAS), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (Empresa & { id: string })[];
      setEmpresas(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setErrorMsg('');
    if (!nombre) return setErrorMsg('El nombre es requerido');
    
    setLoading(true);
    try {
      await apiClient.post('/tenants', {
        nombre_empresa: nombre,
        ubicacion,
        prefijo_telefono: prefijo,
        cantidad_lockers: lockers,
        diasServicio: parseInt(diasServicio, 10)
      });
      
      setShowForm(false);
      setNombre('');
      setUbicacion('');
      setDiasServicio('30');
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Error al crear local. Verifique su conexión al API.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (emp: Empresa & { id: string }) => {
    try {
      await apiClient.patch(`/tenants/${emp.id}/suspend`, {
        estado_suscripcion: !emp.estado_suscripcion
      });
      setConfirmModal(null);
    } catch (error: any) {
      setAlertModal({ open: true, title: 'Error', message: error.message });
    }
  };

  const handleDelete = async (emp: Empresa & { id: string }) => {
    try {
      await apiClient.delete(`/tenants/${emp.id}`);
      setConfirmModal(null);
    } catch (error: any) {
      setAlertModal({ open: true, title: 'Error', message: error.message });
    }
  };

  const handleAddDays = (emp: Empresa & { id: string }) => {
    setPromptModal({
      open: true,
      title: 'Añadir Días',
      message: '¿Cuántos días quieres añadir? (Ej: 30)',
      defaultValue: '30',
      onConfirm: async (diasStr) => {
        if (!diasStr) return;
        const dias = parseInt(diasStr, 10);
        if (isNaN(dias)) return;
        
        try {
          await apiClient.patch(`/tenants/${emp.id}/extend`, { dias });
        } catch (error: any) {
          setAlertModal({ open: true, title: 'Error extendiendo días', message: error.message });
        }
      }
    });
  };

  // Filtrar eliminados
  const empresasVisibles = empresas.filter(emp => emp.estado !== 'eliminado');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Gestión de Locales (Tenants)</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Local'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Crear Nuevo Local</h3>
          {errorMsg && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: 'bold' }}>{errorMsg}</div>}
          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nombre del Negocio</label>
              <input type="text" className="input-field" placeholder="Ej. Mi Tienda" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Ubicación / Dirección</label>
              <input type="text" className="input-field" placeholder="Ej. Av. Principal #123" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Prefijo País (WhatsApp)</label>
              <input type="text" className="input-field" placeholder="+591" value={prefijo} onChange={e => setPrefijo(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Cantidad Lockers</label>
              <input type="number" className="input-field" placeholder="10" value={lockers} onChange={e => setLockers(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Días de Servicio Inicial</label>
              <input type="number" className="input-field" placeholder="30" value={diasServicio} onChange={e => setDiasServicio(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Plan de Suscripción</label>
              <select className="input-field">
                <option value="Básico">Básico</option>
                <option value="Pro">Pro</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Tenant'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL INLINE (React State) */}
      {confirmModal && confirmModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>{confirmModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }} onClick={() => setConfirmModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmModal.onConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT MODAL */}
      {alertModal && alertModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>{alertModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{alertModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setAlertModal(null)}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {/* PROMPT MODAL */}
      {promptModal && promptModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>{promptModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{promptModal.message}</p>
            <input 
              type="text" 
              className="input-field" 
              style={{ marginBottom: '2rem' }}
              defaultValue={promptModal.defaultValue} 
              id="prompt-input"
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }} onClick={() => setPromptModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => {
                const val = (document.getElementById('prompt-input') as HTMLInputElement).value;
                promptModal.onConfirm(val);
                setPromptModal(null);
              }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Código App</th>
              <th style={{ padding: '1rem' }}>PIN</th>
              <th style={{ padding: '1rem' }}>Nombre</th>
              <th style={{ padding: '1rem' }}>Vencimiento</th>
              <th style={{ padding: '1rem' }}>Estado</th>
              <th style={{ padding: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresasVisibles.map(emp => {
              let diasRestantes = 0;
              if (emp.fecha_vencimiento) {
                const venci = (emp.fecha_vencimiento as any).toDate ? (emp.fecha_vencimiento as any).toDate() : new Date(emp.fecha_vencimiento);
                const hoy = new Date();
                const diffTime = venci.getTime() - hoy.getTime();
                diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              }

              const isWarning = diasRestantes <= 2 && diasRestantes >= 0;
              const isExpired = diasRestantes < 0;

              return (
                <tr key={emp.id}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#0A84FF', fontWeight: 'bold' }}>{emp.codigo_acceso || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', letterSpacing: '2px' }}>{emp.pin_acceso || '****'}</td>
                  <td style={{ padding: '1rem' }}>
                    {emp.nombre_negocio || emp.nombre_empresa}
                    {emp.ubicacion && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.ubicacion}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: isExpired ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'white', fontWeight: isWarning || isExpired ? 'bold' : 'normal' }}>
                      {emp.fecha_vencimiento ? `${diasRestantes} días` : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: emp.estado_suscripcion ? 'var(--success)' : 'var(--danger)' }}>
                      {emp.estado_suscripcion ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn" style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', fontSize: '0.8rem', padding: '0.5rem' }} onClick={() => handleAddDays(emp)}>
                      + Días
                    </button>
                    <button className="btn" style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', fontSize: '0.8rem', padding: '0.5rem', color: emp.estado_suscripcion ? 'var(--danger)' : 'var(--success)' }} onClick={() => {
                      setConfirmModal({
                        open: true,
                        title: emp.estado_suscripcion ? 'Suspender Local' : 'Reactivar Local',
                        message: `¿Estás seguro de ${emp.estado_suscripcion ? 'suspender' : 'reactivar'} a ${emp.nombre_negocio || emp.nombre_empresa}?`,
                        onConfirm: () => handleSuspend(emp)
                      });
                    }}>
                      {emp.estado_suscripcion ? 'Suspender' : 'Reactivar'}
                    </button>
                    <button className="btn" style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--danger)', fontSize: '0.8rem', padding: '0.5rem', color: 'var(--danger)' }} onClick={() => {
                      setConfirmModal({
                        open: true,
                        title: 'Eliminar Local',
                        message: `¿Estás seguro de ELIMINAR el local ${emp.nombre_negocio || emp.nombre_empresa}? Desaparecerá de la vista pero mantendrá su historial en BD.`,
                        onConfirm: () => handleDelete(emp)
                      });
                    }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
            {empresasVisibles.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay locales registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
