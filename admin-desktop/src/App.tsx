import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, LogOut } from 'lucide-react';
import { useAdminStore } from './store';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import WhatsApp from './pages/WhatsApp';

const Sidebar = () => {
  const location = useLocation();
  const setAdminEmail = useAdminStore(state => state.setAdminEmail);
  
  return (
    <div className="sidebar">
      <h2 style={{ color: 'white', padding: '0 1rem', marginBottom: '2rem' }}>GMA Admin</h2>
      
      <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
        <LayoutDashboard size={20} /> Dashboard
      </Link>
      <Link to="/tenants" className={`sidebar-link ${location.pathname === '/tenants' ? 'active' : ''}`}>
        <Users size={20} /> Locales (Tenants)
      </Link>
      <Link to="/whatsapp" className={`sidebar-link ${location.pathname === '/whatsapp' ? 'active' : ''}`}>
        <QrCode size={20} /> WhatsApp
      </Link>

      <div style={{ marginTop: 'auto' }}>
        <button 
          className="sidebar-link" 
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={() => setAdminEmail(null)}
        >
          <LogOut size={20} /> Salir
        </button>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const adminEmail = useAdminStore(state => state.adminEmail);
  if (!adminEmail) return <Navigate to="/login" />;
  
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tenants" element={<PrivateRoute><Tenants /></PrivateRoute>} />
        <Route path="/whatsapp" element={<PrivateRoute><WhatsApp /></PrivateRoute>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
