import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAdminEmail = useAdminStore(state => state.setAdminEmail);
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.email) {
        setAdminEmail(userCredential.user.email);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>Acceso Super Admin</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
          {error && <div style={{ color: 'var(--danger)', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
