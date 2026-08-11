import { useState } from 'react';
import { apiClient } from '../services/api-client';

// Declaración global para TypeScript si `electronAPI` se inyectó
declare global {
  interface Window {
    electronAPI?: {
      getWhatsAppQR: (tenantId: string) => Promise<{ success: boolean, qr_base64?: string, error?: string }>;
      desvincularWhatsApp: (tenantId: string) => Promise<{ success: boolean, error?: string }>;
    }
  }
}

export default function WhatsApp() {
  const [tenantId, setTenantId] = useState('');
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const vincularWhatsApp = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    setQrBase64(null);

    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.getWhatsAppQR(tenantId);
        if (res.success && res.qr_base64) {
          setQrBase64(res.qr_base64);
        } else if (res.success && !res.qr_base64) {
          setSuccess('El tenant ya estaba conectado a WhatsApp exitosamente.');
        } else {
          setError(res.error || 'Error desconocido');
        }
      } else {
        // Fallback for browser (development)
        const res = await apiClient.getWhatsAppQR(tenantId);
        if (res.success && res.qr_base64) setQrBase64(res.qr_base64);
        else setError(res.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeDesvincular = async () => {
    setLoading(true);
    try {
      if (window.electronAPI) {
         await window.electronAPI.desvincularWhatsApp(tenantId);
      } else {
         await apiClient.desvincularWhatsApp(tenantId);
      }
      setSuccess('Desvinculado correctamente');
      setQrBase64(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setConfirmModal(null);
    }
  };

  const desvincularWhatsApp = () => {
    if (!tenantId) return;
    setConfirmModal({
      open: true,
      title: 'Desvincular WhatsApp',
      message: '¿Seguro que deseas desvincular WhatsApp?',
      onConfirm: executeDesvincular
    });
  }

  return (
    <div>
      <h1 className="page-title">Vincular WhatsApp (Motor en la Nube)</h1>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Ingresa el ID del tenant para generar un código QR de WhatsApp. El teléfono escaneado actuará como el bot de notificaciones para ese local.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="ID del Tenant (ej. demo-tenant)"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          />
          <button className="btn btn-primary" onClick={vincularWhatsApp} disabled={loading || !tenantId}>
            {loading ? 'Cargando...' : 'Generar QR'}
          </button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>{success}</div>}

        {qrBase64 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'white' }}>Escanea con WhatsApp</h3>
            <img src={qrBase64} alt="WhatsApp QR" style={{ width: '250px', height: '250px', borderRadius: '16px' }} />
            <div style={{ marginTop: '2rem' }}>
               <button className="btn" style={{ backgroundColor: 'var(--danger)' }} onClick={desvincularWhatsApp}>
                 Desvincular Sesión Activa
               </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM MODAL */}
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
    </div>
  );
}
