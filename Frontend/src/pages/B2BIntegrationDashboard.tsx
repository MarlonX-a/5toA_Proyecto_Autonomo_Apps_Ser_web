import React, { useEffect, useState } from 'react';
import '../styles/B2BIntegrationDashboard.css';

// ============================================================================
// DASHBOARD B2B - PILAR 2: WEBHOOKS E INTEROPERABILIDAD
// ============================================================================
// Este dashboard visualiza cómo FindYourWork se integra con socios B2B como 
// Chuwue Grill mediante webhooks firmados con HMAC-SHA256.
// 
// IMPORTANTE: Este es un dashboard de DEMOSTRACIÓN/DOCUMENTACIÓN que muestra
// la arquitectura y flujo de eventos del Pilar 2. Los datos son simulados para
// ilustrar el funcionamiento de la integración B2B.
// ============================================================================

// Interfaces para los datos B2B
interface Partner {
  id: string;
  name: string;
  webhookUrl: string;
  status: 'active' | 'inactive' | 'pending';
  lastSync: string;
  eventsSubscribed: string[];
  successCount: number;
  failureCount: number;
}

interface WebhookEvent {
  id: string;
  type: string;
  direction: 'incoming' | 'outgoing';
  source: string;
  target: string;
  status: 'success' | 'failed' | 'pending' | 'verified';
  hmacStatus: 'valid' | 'invalid' | 'pending';
  timestamp: string;
  payload: object;
}

interface PaymentInfo {
  id: string;
  provider: 'mock' | 'stripe' | 'mercadopago';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  createdAt: string;
  relatedEvent?: string;
}

// Datos demo para visualización
const DEMO_PARTNERS: Partner[] = [
  {
    id: 'chuwue-grill',
    name: 'Chuwue Grill',
    webhookUrl: 'http://localhost:8002/webhooks/partner/findyourwork',
    status: 'active',
    lastSync: new Date().toISOString(),
    eventsSubscribed: ['service.booked_for_event', 'service.confirmed', 'provider.assigned'],
    successCount: 142,
    failureCount: 3,
  },
];

const DEMO_EVENTS: WebhookEvent[] = [
  {
    id: 'evt-001',
    type: 'event.reservation_confirmed',
    direction: 'incoming',
    source: 'Chuwue Grill',
    target: 'FindYourWork',
    status: 'verified',
    hmacStatus: 'valid',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    payload: { reservation_id: 'RES-2026-001', event_name: 'Cena Corporativa TechCorp', guests: 50 },
  },
  {
    id: 'evt-002',
    type: 'service.booked_for_event',
    direction: 'outgoing',
    source: 'FindYourWork',
    target: 'Chuwue Grill',
    status: 'success',
    hmacStatus: 'valid',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    payload: { service_id: 123, service_name: 'DJ Profesional', price: 250.00 },
  },
  {
    id: 'evt-003',
    type: 'booking.confirmed',
    direction: 'outgoing',
    source: 'FindYourWork',
    target: 'Chuwue Grill',
    status: 'success',
    hmacStatus: 'valid',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    payload: { booking_id: 'BK-456', provider: 'DJ Sounds Pro' },
  },
  {
    id: 'evt-004',
    type: 'payment.success',
    direction: 'outgoing',
    source: 'FindYourWork',
    target: 'Chuwue Grill',
    status: 'success',
    hmacStatus: 'valid',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    payload: { payment_id: 'PAY-789', amount: 250.00, currency: 'USD' },
  },
  {
    id: 'evt-005',
    type: 'service.activated',
    direction: 'outgoing',
    source: 'FindYourWork',
    target: 'Chuwue Grill',
    status: 'pending',
    hmacStatus: 'pending',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    payload: { service_id: 123, activation_time: '19:00' },
  },
];

const DEMO_PAYMENTS: PaymentInfo[] = [
  { id: 'PAY-001', provider: 'mock', status: 'completed', amount: 150.00, currency: 'USD', createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'PAY-002', provider: 'stripe', status: 'completed', amount: 250.00, currency: 'USD', createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'PAY-003', provider: 'mercadopago', status: 'pending', amount: 180.00, currency: 'USD', createdAt: new Date(Date.now() - 180000).toISOString() },
  { id: 'PAY-004', provider: 'mock', status: 'failed', amount: 90.00, currency: 'USD', createdAt: new Date(Date.now() - 120000).toISOString() },
];

// Eventos que puede emitir FindYourWork
const EVENTS_EMITTED = [
  { name: 'service.booked_for_event', description: 'Servicio contratado para evento externo' },
  { name: 'service.confirmed', description: 'Proveedor confirmó el servicio' },
  { name: 'provider.assigned', description: 'Proveedor asignado al evento' },
  { name: 'booking.confirmed', description: 'Reserva de servicio confirmada' },
  { name: 'payment.success', description: 'Pago procesado exitosamente' },
];

// Eventos que recibe FindYourWork
const EVENTS_RECEIVED = [
  { name: 'event.reservation_confirmed', description: 'Evento corporativo confirmado en Chuwue' },
  { name: 'event.updated', description: 'Cambios en el evento' },
  { name: 'event.cancelled', description: 'Evento cancelado' },
  { name: 'tour.purchased', description: 'Tour o servicio adicional comprado' },
];

const B2BIntegrationDashboard: React.FC = () => {
  const [partners] = useState<Partner[]>(DEMO_PARTNERS);
  const [events, setEvents] = useState<WebhookEvent[]>(DEMO_EVENTS);
  const [payments] = useState<PaymentInfo[]>(DEMO_PAYMENTS);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simular actualización de eventos cada 30 segundos para demostración
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simular nuevo evento ocasionalmente
      if (Math.random() > 0.7) {
        const newEvent: WebhookEvent = {
          id: `evt-${Date.now()}`,
          type: simulationMode ? 'booking.confirmed' : 'payment.success',
          direction: 'outgoing',
          source: 'FindYourWork',
          target: 'Chuwue Grill',
          status: 'success',
          hmacStatus: 'valid',
          timestamp: new Date().toISOString(),
          payload: { demo: true, message: 'Evento simulado para demostración' }
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [simulationMode]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    return formatDate(dateStr);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; icon: string }> = {
      success: { class: 'badge-success', icon: '✅' },
      verified: { class: 'badge-success', icon: '🔐' },
      completed: { class: 'badge-success', icon: '✅' },
      active: { class: 'badge-success', icon: '🟢' },
      pending: { class: 'badge-warning', icon: '⏳' },
      failed: { class: 'badge-error', icon: '❌' },
      inactive: { class: 'badge-error', icon: '🔴' },
      refunded: { class: 'badge-info', icon: '↩️' },
    };
    const badge = badges[status] || { class: 'badge-default', icon: '❓' };
    return <span className={`status-badge ${badge.class}`}>{badge.icon} {status.toUpperCase()}</span>;
  };

  const getHmacBadge = (hmacStatus: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      valid: { class: 'hmac-valid', label: '🔒 HMAC Válido' },
      invalid: { class: 'hmac-invalid', label: '⚠️ HMAC Inválido' },
      pending: { class: 'hmac-pending', label: '🔄 Verificando...' },
    };
    const badge = badges[hmacStatus] || { class: '', label: hmacStatus };
    return <span className={`hmac-badge ${badge.class}`}>{badge.label}</span>;
  };

  const getProviderLogo = (provider: string) => {
    const logos: Record<string, string> = {
      mock: '🧪',
      stripe: '💳',
      mercadopago: '💰',
    };
    return logos[provider] || '💵';
  };

  const handleSimulateEvent = (eventType: string) => {
    const newEvent: WebhookEvent = {
      id: `evt-sim-${Date.now()}`,
      type: eventType,
      direction: 'outgoing',
      source: 'FindYourWork',
      target: 'Chuwue Grill',
      status: 'pending',
      hmacStatus: 'pending',
      timestamp: new Date().toISOString(),
      payload: { simulated: true, event: eventType },
    };

    setEvents([newEvent, ...events]);

    // Simular procesamiento
    setTimeout(() => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === newEvent.id ? { ...e, status: 'success', hmacStatus: 'valid' } : e
        )
      );
    }, 2000);
  };

  // Estadísticas
  const stats = {
    totalEvents: events.length,
    successEvents: events.filter((e) => e.status === 'success' || e.status === 'verified').length,
    failedEvents: events.filter((e) => e.status === 'failed').length,
    pendingEvents: events.filter((e) => e.status === 'pending').length,
    incomingEvents: events.filter((e) => e.direction === 'incoming').length,
    outgoingEvents: events.filter((e) => e.direction === 'outgoing').length,
    totalPayments: payments.length,
    completedPayments: payments.filter((p) => p.status === 'completed').length,
    totalRevenue: payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="b2b-dashboard">
      {/* Header */}
      <header className="b2b-header">
        <div className="b2b-header-content">
          <div className="b2b-header-left">
            <h1>🔗 Integración B2B - Pilar 2</h1>
            <p>Webhooks e Interoperabilidad con Partners</p>
          </div>
          <div className="b2b-header-right">
            <span className="demo-badge">📋 MODO DEMOSTRACIÓN</span>
            <span className="last-update">Actualizado: {lastUpdate.toLocaleTimeString('es-CO')}</span>
            <button 
              className={`btn-simulate ${simulationMode ? 'active' : ''}`} 
              onClick={() => setSimulationMode(!simulationMode)}
            >
              {simulationMode ? '⏸️ Pausar' : '▶️ Simular Eventos'}
            </button>
          </div>
        </div>
      </header>

      {/* Banner informativo */}
      <div className="info-banner">
        <strong>📚 Dashboard de Documentación del Pilar 2</strong> — Esta visualización muestra cómo funciona 
        la arquitectura de webhooks e interoperabilidad B2B entre FindYourWork y socios como Chuwue Grill.
        Los datos son simulados para fines de demostración y documentación.
      </div>

      {/* Diagrama de Flujo Visual */}
      <section className="b2b-flow-section">
        <h2>📊 Flujo de Integración B2B</h2>
        <div className="b2b-flow-diagram">
          <div className="flow-system flow-left">
            <div className="flow-system-header">
              <span className="flow-icon">🏢</span>
              <h3>FindYourWork</h3>
              <span className="flow-subtitle">Marketplace de Servicios</span>
            </div>
            <div className="flow-events-list">
              <h4>📤 Eventos Emitidos</h4>
              {EVENTS_EMITTED.map((e) => (
                <div key={e.name} className="flow-event-item outgoing">
                  <code>{e.name}</code>
                  <span>{e.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flow-connection">
            <div className="flow-arrow flow-arrow-right">
              <span className="arrow-label">Webhooks HMAC-SHA256</span>
              <div className="arrow-line">→</div>
            </div>
            <div className="flow-security">
              <span>🔐</span>
              <span>Firmado</span>
            </div>
            <div className="flow-arrow flow-arrow-left">
              <div className="arrow-line">←</div>
              <span className="arrow-label">Webhooks HMAC-SHA256</span>
            </div>
          </div>

          <div className="flow-system flow-right">
            <div className="flow-system-header">
              <span className="flow-icon">🍗</span>
              <h3>Chuwue Grill</h3>
              <span className="flow-subtitle">Restaurante / Eventos</span>
            </div>
            <div className="flow-events-list">
              <h4>📥 Eventos Recibidos</h4>
              {EVENTS_RECEIVED.map((e) => (
                <div key={e.name} className="flow-event-item incoming">
                  <code>{e.name}</code>
                  <span>{e.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="b2b-stats-section">
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalEvents}</span>
              <span className="stat-label">Total Eventos</span>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-value">{stats.successEvents}</span>
              <span className="stat-label">Exitosos</span>
            </div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <span className="stat-value">{stats.pendingEvents}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
          <div className="stat-card stat-error">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <span className="stat-value">{stats.failedEvents}</span>
              <span className="stat-label">Fallidos</span>
            </div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-icon">📥</div>
            <div className="stat-content">
              <span className="stat-value">{stats.incomingEvents}</span>
              <span className="stat-label">Entrantes</span>
            </div>
          </div>
          <div className="stat-card stat-secondary">
            <div className="stat-icon">📤</div>
            <div className="stat-content">
              <span className="stat-value">{stats.outgoingEvents}</span>
              <span className="stat-label">Salientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Registrados */}
      <section className="b2b-partners-section">
        <h2>🤝 Partners B2B Registrados</h2>
        <div className="partners-grid">
          {partners.map((partner) => (
            <div key={partner.id} className={`partner-card partner-${partner.status}`}>
              <div className="partner-header">
                <h3>{partner.name}</h3>
                {getStatusBadge(partner.status)}
              </div>
              <div className="partner-details">
                <p><strong>ID:</strong> <code>{partner.id}</code></p>
                <p><strong>Webhook:</strong> <code className="url">{partner.webhookUrl}</code></p>
                <p><strong>Última sincronización:</strong> {formatRelativeTime(partner.lastSync)}</p>
              </div>
              <div className="partner-events">
                <strong>Eventos suscritos:</strong>
                <div className="event-tags">
                  {partner.eventsSubscribed.map((e) => (
                    <span key={e} className="event-tag">{e}</span>
                  ))}
                </div>
              </div>
              <div className="partner-stats">
                <div className="partner-stat success">
                  <span className="stat-num">{partner.successCount}</span>
                  <span className="stat-lbl">Exitosos</span>
                </div>
                <div className="partner-stat error">
                  <span className="stat-num">{partner.failureCount}</span>
                  <span className="stat-lbl">Fallidos</span>
                </div>
                <div className="partner-stat rate">
                  <span className="stat-num">
                    {((partner.successCount / (partner.successCount + partner.failureCount)) * 100).toFixed(1)}%
                  </span>
                  <span className="stat-lbl">Tasa Éxito</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simulación de Eventos */}
      <section className="b2b-simulation-section">
        <div className="simulation-header">
          <h2>🧪 Simulación de Eventos</h2>
          <button
            className={`btn-toggle ${simulationMode ? 'active' : ''}`}
            onClick={() => setSimulationMode(!simulationMode)}
          >
            {simulationMode ? '🔴 Desactivar' : '🟢 Activar'}
          </button>
        </div>
        {simulationMode && (
          <div className="simulation-panel">
            <p>Haz clic en un evento para enviarlo a Chuwue Grill:</p>
            <div className="simulation-buttons">
              {EVENTS_EMITTED.map((e) => (
                <button
                  key={e.name}
                  className="btn-simulate"
                  onClick={() => handleSimulateEvent(e.name)}
                >
                  📤 {e.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Timeline de Webhooks */}
      <section className="b2b-timeline-section">
        <h2>📜 Timeline de Webhooks</h2>
        <div className="timeline-container">
          {events.map((event) => (
            <div
              key={event.id}
              className={`timeline-item timeline-${event.direction} timeline-status-${event.status}`}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="timeline-marker">
                {event.direction === 'incoming' ? '📥' : '📤'}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <code className="event-type">{event.type}</code>
                  {getStatusBadge(event.status)}
                  {getHmacBadge(event.hmacStatus)}
                </div>
                <div className="timeline-meta">
                  <span className="flow-direction">
                    {event.source} → {event.target}
                  </span>
                  <span className="timestamp">{formatRelativeTime(event.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detalle de Evento Seleccionado */}
      {selectedEvent && (
        <div className="event-detail-modal" onClick={() => setSelectedEvent(null)}>
          <div className="event-detail-content" onClick={(e) => e.stopPropagation()}>
            <div className="event-detail-header">
              <h3>📋 Detalle del Evento</h3>
              <button className="btn-close" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>
            <div className="event-detail-body">
              <div className="detail-row">
                <label>ID:</label>
                <code>{selectedEvent.id}</code>
              </div>
              <div className="detail-row">
                <label>Tipo:</label>
                <code>{selectedEvent.type}</code>
              </div>
              <div className="detail-row">
                <label>Dirección:</label>
                <span>{selectedEvent.direction === 'incoming' ? '📥 Entrante' : '📤 Saliente'}</span>
              </div>
              <div className="detail-row">
                <label>Origen:</label>
                <span>{selectedEvent.source}</span>
              </div>
              <div className="detail-row">
                <label>Destino:</label>
                <span>{selectedEvent.target}</span>
              </div>
              <div className="detail-row">
                <label>Estado:</label>
                {getStatusBadge(selectedEvent.status)}
              </div>
              <div className="detail-row">
                <label>HMAC:</label>
                {getHmacBadge(selectedEvent.hmacStatus)}
              </div>
              <div className="detail-row">
                <label>Fecha:</label>
                <span>{formatDate(selectedEvent.timestamp)}</span>
              </div>
              <div className="detail-row full">
                <label>Payload:</label>
                <pre>{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de Pagos */}
      <section className="b2b-payments-section">
        <h2>💳 Estado de Pagos - Adaptadores</h2>
        <div className="payments-summary">
          <div className="summary-card">
            <h4>Proveedores de Pago</h4>
            <div className="providers-grid">
              <div className="provider-item">
                <span className="provider-logo">🧪</span>
                <span className="provider-name">Mock</span>
                <span className="provider-status active">Activo</span>
              </div>
              <div className="provider-item">
                <span className="provider-logo">💳</span>
                <span className="provider-name">Stripe</span>
                <span className="provider-status active">Activo</span>
              </div>
              <div className="provider-item">
                <span className="provider-logo">💰</span>
                <span className="provider-name">MercadoPago</span>
                <span className="provider-status active">Activo</span>
              </div>
            </div>
          </div>
          <div className="summary-card">
            <h4>Resumen</h4>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="value">{stats.totalPayments}</span>
                <span className="label">Total</span>
              </div>
              <div className="summary-stat success">
                <span className="value">{stats.completedPayments}</span>
                <span className="label">Completados</span>
              </div>
              <div className="summary-stat revenue">
                <span className="value">${stats.totalRevenue.toFixed(2)}</span>
                <span className="label">Ingresos</span>
              </div>
            </div>
          </div>
        </div>
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>ID Pago</th>
                <th>Proveedor</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td><code>{payment.id}</code></td>
                  <td>
                    <span className="provider-badge">
                      {getProviderLogo(payment.provider)} {payment.provider}
                    </span>
                  </td>
                  <td className="amount">${payment.amount.toFixed(2)} {payment.currency}</td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>{formatRelativeTime(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer informativo */}
      <footer className="b2b-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🔐 Seguridad HMAC-SHA256</h4>
            <p>Todos los webhooks están firmados digitalmente para garantizar la integridad y autenticidad de los mensajes.</p>
          </div>
          <div className="footer-section">
            <h4>📋 Contrato de Eventos</h4>
            <ul>
              <li><code>booking.confirmed</code></li>
              <li><code>payment.success</code></li>
              <li><code>order.created</code></li>
              <li><code>service.activated</code></li>
              <li><code>tour.purchased</code></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>🏗️ Pilar 2: Webhooks e Interoperabilidad B2B</h4>
            <p>Implementación completa del patrón Adapter para pasarelas de pago y sistema de webhooks bidireccionales con partners empresariales.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default B2BIntegrationDashboard;
