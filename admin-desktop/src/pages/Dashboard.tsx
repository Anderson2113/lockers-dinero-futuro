import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Empresa } from '@gma-lockers/shared';
import { FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

const mockChartData = [
  { name: 'Ene', lockers: 400, ingresos: 240 },
  { name: 'Feb', lockers: 300, ingresos: 139 },
  { name: 'Mar', lockers: 200, ingresos: 980 },
  { name: 'Abr', lockers: 278, ingresos: 390 },
  { name: 'May', lockers: 189, ingresos: 480 },
  { name: 'Jun', lockers: 239, ingresos: 380 },
];

export default function Dashboard() {
  const [empresas, setEmpresas] = useState<(Empresa & { id: string })[]>([]);

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

  return (
    <div>
      <h1 className="page-title">Dashboard (Global Metrics)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Uso Mensual de Lockers (Demo)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: 8 }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="lockers" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Ingresos Generados (Demo)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: 8 }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Métricas Recientes (Locales en Firestore)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Local (Tenant)</th>
              <th style={{ padding: '1rem' }}>Plan</th>
              <th style={{ padding: '1rem' }}>Lockers Asignados</th>
              <th style={{ padding: '1rem' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{emp.nombre_empresa}</td>
                <td style={{ padding: '1rem' }}><span style={{ color: 'var(--primary)' }}>Pro</span></td>
                <td style={{ padding: '1rem' }}>{emp.cantidad_lockers}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: emp.estado_suscripcion ? 'var(--success)' : 'var(--danger)' }}>
                    {emp.estado_suscripcion ? 'Activo' : 'Suspendido'}
                  </span>
                </td>
              </tr>
            ))}
            {empresas.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay locales registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
