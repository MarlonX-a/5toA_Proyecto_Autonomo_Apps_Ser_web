import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket;
  private userId: string;
  private role: 'cliente' | 'proveedor' | 'admin';
  private token: string;

  constructor(userId: string, role: 'cliente' | 'proveedor' | 'admin', token: string) {
    this.userId = userId;
    this.role = role;
    this.token = token;
    this.socket = io('http://localhost:4000');
    
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log(`🔌 ${this.role} ${this.userId} conectado`);
      this.authenticate();
    });

    this.socket.on('disconnect', () => {
      console.log(`🔌 ${this.role} ${this.userId} desconectado`);
    });

    this.socket.on('auth_success', (data) => {
      console.log(`✅ Autenticación exitosa:`, data);
      this.onAuthenticated();
    });

    this.socket.on('auth_error', (error) => {
      console.error(`❌ Error de autenticación:`, error);
    });

    this.socket.on('event', (eventData) => {
      console.log(`📨 Evento recibido:`, eventData);
      this.handleEvent(eventData);
    });

    this.socket.on('error', (error) => {
      console.error(`❌ Error:`, error);
    });

    this.socket.on('room_joined', (data) => {
      console.log(`🏠 Unido a sala:`, data.roomName);
    });

    this.socket.on('room_left', (data) => {
      console.log(`🚪 Salido de sala:`, data.roomName);
    });
  }

  private authenticate() {
    this.socket.emit('authenticate', {
      token: this.token,
      userId: this.userId,
      role: this.role,
    });
  }

  private onAuthenticated() {
    // Unirse a salas específicas según el rol
    this.joinRoleRooms();
    
    // Simular actividad según el rol
    this.simulateActivity();
  }

  private joinRoleRooms() {
    // Sala personal
    this.socket.emit('join_room', { roomName: `${this.role}_${this.userId}` });
    
    // Sala general del rol
    this.socket.emit('join_room', { roomName: `all_${this.role}s` });
    
    // Sala de admin si es admin
    if (this.role === 'admin') {
      this.socket.emit('join_room', { roomName: 'admin_dashboard' });
    }
  }

  private simulateActivity() {
    // Simular diferentes actividades según el rol
    switch (this.role) {
      case 'cliente':
        this.simulateClientActivity();
        break;
      case 'proveedor':
        this.simulateProviderActivity();
        break;
      case 'admin':
        this.simulateAdminActivity();
        break;
    }
  }

  private simulateClientActivity() {
    // Simular creación de reserva cada 30 segundos
    setInterval(() => {
      const reservation = {
        clienteId: this.userId,
        proveedorId: 'proveedor_1',
        servicioId: 'servicio_1',
        fecha: new Date().toISOString(),
        estado: 'pendiente',
      };

      console.log(`📅 Cliente ${this.userId} creando reserva...`);
      this.socket.emit('reservation_created', reservation);
    }, 30000);

    // Simular creación de comentario cada 60 segundos
    setInterval(() => {
      const comment = {
        clienteId: this.userId,
        proveedorId: 'proveedor_1',
        servicioId: 'servicio_1',
        texto: `Comentario de ${this.userId} - ${new Date().toLocaleString()}`,
      };

      console.log(`💬 Cliente ${this.userId} creando comentario...`);
      this.socket.emit('comment_created', comment);
    }, 60000);
  }

  private simulateProviderActivity() {
    // Simular aceptación de reserva cada 45 segundos
    setInterval(() => {
      const reservation = {
        clienteId: 'cliente_1',
        proveedorId: this.userId,
        servicioId: 'servicio_1',
        fecha: new Date().toISOString(),
        estado: 'confirmada',
      };

      console.log(`✅ Proveedor ${this.userId} aceptando reserva...`);
      this.socket.emit('reservation_accepted', reservation);
    }, 45000);

    // Simular creación de pago cada 90 segundos
    setInterval(() => {
      const payment = {
        clienteId: 'cliente_1',
        proveedorId: this.userId,
        reservaId: 'reserva_1',
        monto: Math.floor(Math.random() * 1000) + 100,
        metodo_pago: 'tarjeta',
        estado: 'pagado',
      };

      console.log(`💰 Proveedor ${this.userId} procesando pago...`);
      this.socket.emit('payment_created', payment);
    }, 90000);
  }

  private simulateAdminActivity() {
    // Los admins principalmente monitorean
    console.log(`👨‍💼 Admin ${this.userId} monitoreando sistema...`);
    
    // Simular notificaciones del sistema cada 2 minutos
    setInterval(() => {
      console.log(`📢 Admin ${this.userId} recibiendo notificación del sistema`);
    }, 120000);
  }

  private handleEvent(eventData: any) {
    switch (eventData.type) {
      case 'reservation_created':
        console.log(`📅 Nueva reserva recibida:`, eventData.data);
        break;
      case 'reservation_accepted':
        console.log(`✅ Reserva aceptada:`, eventData.data);
        break;
      case 'payment_created':
        console.log(`💰 Nuevo pago:`, eventData.data);
        break;
      case 'comment_created':
        console.log(`💬 Nuevo comentario:`, eventData.data);
        break;
      case 'system_notification':
        console.log(`📢 Notificación del sistema:`, eventData.data);
        break;
      default:
        console.log(`📨 Evento no reconocido:`, eventData);
    }
  }

  // Métodos públicos para control manual
  public joinRoom(roomName: string) {
    this.socket.emit('join_room', { roomName });
  }

  public leaveRoom(roomName: string) {
    this.socket.emit('leave_room', { roomName });
  }

  public createReservation(reservationData: any) {
    this.socket.emit('reservation_created', reservationData);
  }

  public acceptReservation(reservationData: any) {
    this.socket.emit('reservation_accepted', reservationData);
  }

  public createPayment(paymentData: any) {
    this.socket.emit('payment_created', paymentData);
  }

  public createComment(commentData: any) {
    this.socket.emit('comment_created', commentData);
  }

  public disconnect() {
    this.socket.disconnect();
  }
}

// Función para crear múltiples clientes de prueba
export function createTestClients() {
  const clients: WebSocketClient[] = [];

  // Crear clientes
  for (let i = 1; i <= 3; i++) {
    const client = new WebSocketClient(`cliente_${i}`, 'cliente', `token_cliente_${i}`);
    clients.push(client);
  }

  // Crear proveedores
  for (let i = 1; i <= 2; i++) {
    const provider = new WebSocketClient(`proveedor_${i}`, 'proveedor', `token_proveedor_${i}`);
    clients.push(provider);
  }

  // Crear admin
  const admin = new WebSocketClient('admin_1', 'admin', 'token_admin_1');
  clients.push(admin);

  return clients;
}

// Función para crear un cliente específico
export function createClient(userId: string, role: 'cliente' | 'proveedor' | 'admin', token: string) {
  return new WebSocketClient(userId, role, token);
}

// Ejemplo de uso
if (require.main === module) {
  console.log('🚀 Iniciando clientes de prueba...');
  
  const clients = createTestClients();
  
  // Manejar cierre del proceso
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando clientes...');
    clients.forEach(client => client.disconnect());
    process.exit(0);
  });
}
