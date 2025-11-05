import { useEffect, useMemo, useState } from 'react';
import { getUsers } from '../../api/usersApi';
import { getServicioByProveedor } from '../../api/servicio';
import { getAllReservas } from '../../api/reserva';
import { createPago } from '../../api/pago';

type Rol = 'cliente' | 'proveedor' | 'admin' | null;

interface Servicio {
  id: number;
  nombre_servicio: string;
  descripcion: string;
  duracion?: string;
  rating_promedio?: number;
}

interface Reserva {
  id: number;
  fecha: string;
  hora: string;
  total_estimado: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  servicio: number; // servicio_id
  cliente: number; // cliente_id
}

export default function DashboardProveedor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rol, setRol] = useState<Rol>(null);
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  const token = useMemo(() => localStorage.getItem('token') || '', []);

  useEffect(() => {
    async function load() {
      try {
        if (!token) {
          setError('No hay token. Inicia sesión.');
          setLoading(false);
          return;
        }

        const perfil = await getUsers(token);
        const data = perfil.data as { id: number; rol: Rol };
        setRol(data.rol);
        if (data.rol !== 'proveedor') {
          setError('Este panel es solo para proveedores.');
          setLoading(false);
          return;
        }

        setProveedorId(data.id);

        const [servRes, allReservas] = await Promise.all([
          getServicioByProveedor(data.id, token),
          getAllReservas(token),
        ]);

        const svc: Servicio[] = servRes.data || [];
        setServicios(svc);

        const servicioIds = new Set<number>(svc.map(s => s.id));
        const resFiltradas: Reserva[] = (allReservas.data || []).filter((r: any) => servicioIds.has(r.servicio));
        setReservas(resFiltradas);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Error cargando dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const totalPendientes = reservas.filter(r => r.estado === 'pendiente').length;
  const totalConfirmadas = reservas.filter(r => r.estado === 'confirmada').length;
  const ingresoEstimado = reservas
    .filter(r => r.estado !== 'cancelada')
    .reduce((acc, r) => acc + (Number(r.total_estimado) || 0), 0);

  const pill = (text: string, color: string) => (
    <span style={{
      display: 'inline-block',
      padding: '0.15rem 0.5rem',
      borderRadius: '999px',
      background: color,
      color: '#fff',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>{text}</span>
  );

  const statusPill = (estado: Reserva['estado']) => {
    if (estado === 'pendiente') return pill('Pendiente', '#ff9800');
    if (estado === 'confirmada') return pill('Confirmada', '#4caf50');
    return pill('Cancelada', '#f44336');
  };

  const card: React.CSSProperties = {
    background: '#1f1f1f',
    border: '1px solid #2c2c2c',
    borderRadius: 12,
    padding: '1rem',
  };

  const h2Style: React.CSSProperties = { margin: 0, marginBottom: '0.25rem' };
  const subtitle: React.CSSProperties = { color: '#a7a7a7', marginBottom: '1rem' };

  if (loading) return (
    <div style={{ padding: '1rem', color: '#fff' }}>
      <h2 style={h2Style}>Dashboard Proveedor</h2>
      <p style={subtitle}>Cargando...</p>
    </div>
  );
  if (error) return (
    <div style={{ padding: '1rem', color: '#fff' }}>
      <h2 style={h2Style}>Dashboard Proveedor</h2>
      <p style={{ color: '#f44336' }}>{error}</p>
    </div>
  );

  return (
    <div style={{ padding: '1rem', color: '#fff' }}>
      <h2 style={h2Style}>Dashboard Proveedor</h2>
      <p style={subtitle}>Resumen de tu negocio</p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={card}>
          <div style={{ color: '#a7a7a7', fontSize: 12 }}>Servicios publicados</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{servicios.length}</div>
        </div>
        <div style={card}>
          <div style={{ color: '#a7a7a7', fontSize: 12 }}>Reservas pendientes</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalPendientes}</div>
        </div>
        <div style={card}>
          <div style={{ color: '#a7a7a7', fontSize: 12 }}>Reservas confirmadas</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalConfirmadas}</div>
        </div>
        <div style={card}>
          <div style={{ color: '#a7a7a7', fontSize: 12 }}>Ingreso estimado</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>${ingresoEstimado}</div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Mis Servicios</h3>
          {servicios.length === 0 ? (
            <p style={{ color: '#a7a7a7' }}>No tienes servicios registrados.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {servicios.map(s => (
                <li key={s.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #2c2c2c' }}>
                  <div style={{ fontWeight: 600 }}>{s.nombre_servicio}</div>
                  <div style={{ color: '#a7a7a7', fontSize: 13 }}>{s.descripcion}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Reservas recientes</h3>
          {reservas.length === 0 ? (
            <p style={{ color: '#a7a7a7' }}>No tienes reservas aún.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ color: '#a7a7a7', borderBottom: '1px solid #2c2c2c' }}>
                  <th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Reserva</th>
                  <th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Hora</th>
                  <th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.slice(0, 12).map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #2c2c2c' }}>
                    <td style={{ padding: '0.35rem 0' }}>#{r.id}</td>
                    <td style={{ padding: '0.35rem 0' }}>{r.fecha}</td>
                    <td style={{ padding: '0.35rem 0' }}>{r.hora}</td>
                    <td style={{ padding: '0.35rem 0' }}>${r.total_estimado}</td>
                    <td style={{ padding: '0.35rem 0' }}>{statusPill(r.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}