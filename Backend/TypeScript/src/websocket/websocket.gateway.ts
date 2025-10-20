import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientManagerService } from './client-manager.service';
import { EventEmitterService } from './event-emitter.service';
import { RoomManagerService } from './room-manager.service';
import { DjangoApiService } from '../services/django-api.service';
import { Logger } from '@nestjs/common';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: 'cliente' | 'proveedor' | 'admin';
  isAuthenticated?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true,
  },
  namespace: '/',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly clientManager: ClientManagerService,
    private readonly eventEmitter: EventEmitterService,
    private readonly roomManager: RoomManagerService,
    private readonly djangoApi: DjangoApiService,
  ) {}

  afterInit(server: Server) {
    this.eventEmitter.setServer(server);
    this.logger.log('🚀 WebSocket Gateway inicializado');
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`🔌 Cliente conectado: ${client.id}`);
    
    // Enviar evento de conexión al dashboard
    this.eventEmitter.emitToDashboard('client_connected', {
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`🔌 Cliente desconectado: ${client.id}`);
    
    // Limpiar datos del cliente
    if (client.isAuthenticated && client.userId) {
      await this.clientManager.removeClient(client.userId);
      await this.roomManager.leaveAllRooms(client.userId);
    }

    // Enviar evento de desconexión al dashboard
    this.eventEmitter.emitToDashboard('client_disconnected', {
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('authenticate')
  async handleAuthentication(
    @MessageBody() data: { token: string; userId: string; role: 'cliente' | 'proveedor' | 'admin' },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // Verificar token con Django API
      const isValid = await this.djangoApi.verifyToken(data.token);
      
      if (!isValid) {
        client.emit('auth_error', { message: 'Token inválido' });
        return;
      }

      // Registrar cliente autenticado
      client.userId = data.userId;
      client.userRole = data.role;
      client.isAuthenticated = true;

      await this.clientManager.addClient({
        socketId: client.id,
        userId: data.userId,
        role: data.role,
        socket: client,
        connectedAt: new Date(),
      });

      // Unir a salas según el rol
      await this.joinRoleBasedRooms(client);

      client.emit('auth_success', { 
        message: 'Autenticación exitosa',
        userId: data.userId,
        role: data.role,
      });

      this.logger.log(`✅ Cliente autenticado: ${data.userId} (${data.role})`);

      // Notificar al dashboard
      this.eventEmitter.emitToDashboard('client_authenticated', {
        userId: data.userId,
        role: data.role,
        socketId: client.id,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error('Error en autenticación:', error);
      client.emit('auth_error', { message: 'Error en autenticación' });
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { roomName: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.isAuthenticated) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    try {
      await this.roomManager.joinRoom(client.userId, data.roomName);
      client.emit('room_joined', { roomName: data.roomName });
      
      this.logger.log(`🏠 ${client.userId} se unió a la sala: ${data.roomName}`);
    } catch (error) {
      client.emit('error', { message: 'Error al unirse a la sala' });
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { roomName: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.isAuthenticated) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    try {
      await this.roomManager.leaveRoom(client.userId, data.roomName);
      client.emit('room_left', { roomName: data.roomName });
      
      this.logger.log(`🚪 ${client.userId} salió de la sala: ${data.roomName}`);
    } catch (error) {
      client.emit('error', { message: 'Error al salir de la sala' });
    }
  }

  @SubscribeMessage('reservation_created')
  async handleReservationCreated(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.isAuthenticated) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    try {
      // Emitir evento a la sala del proveedor
      const roomName = `proveedor_${data.proveedorId}`;
      await this.eventEmitter.emitToRoom(roomName, {
        type: 'reservation_created',
        data: data,
        from: client.userId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`📅 Reserva creada por ${client.userId} para proveedor ${data.proveedorId}`);
    } catch (error) {
      client.emit('error', { message: 'Error al procesar reserva' });
    }
  }

  @SubscribeMessage('reservation_accepted')
  async handleReservationAccepted(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.isAuthenticated) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    try {
      // Emitir evento al cliente
      const roomName = `cliente_${data.clienteId}`;
      await this.eventEmitter.emitToRoom(roomName, {
        type: 'reservation_accepted',
        data: data,
        from: client.userId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`✅ Reserva aceptada por ${client.userId} para cliente ${data.clienteId}`);
    } catch (error) {
      client.emit('error', { message: 'Error al procesar aceptación' });
    }
  }

  @SubscribeMessage('payment_created')
  async handlePaymentCreated(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.isAuthenticated) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    try {
      const roomName = `proveedor_${data.proveedorId}`;
      await this.eventEmitter.emitToRoom(roomName, {
        type: 'payment_created',
        data: data,
        from: client.userId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`💰 Pago creado por ${client.userId} para proveedor ${data.proveedorId}`);
    } catch (error) {
      client.emit('error', { message: 'Error al procesar pago' });
    }
  }

  @SubscribeMessage('comment_created')
  async handleCommentCreated(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.isAuthenticated) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    try {
      const roomName = `proveedor_${data.proveedorId}`;
      await this.eventEmitter.emitToRoom(roomName, {
        type: 'comment_created',
        data: data,
        from: client.userId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`💬 Comentario creado por ${client.userId} para proveedor ${data.proveedorId}`);
    } catch (error) {
      client.emit('error', { message: 'Error al procesar comentario' });
    }
  }

  private async joinRoleBasedRooms(client: AuthenticatedSocket) {
    const userId = client.userId;
    const role = client.userRole;

    // Sala personal del usuario
    await this.roomManager.joinRoom(userId, `${role}_${userId}`);

    // Sala general según rol
    await this.roomManager.joinRoom(userId, `all_${role}s`);

    // Sala de administradores si es admin
    if (role === 'admin') {
      await this.roomManager.joinRoom(userId, 'admin_dashboard');
    }
  }

  // Métodos públicos para ser llamados desde otros servicios
  async emitToUser(userId: string, event: string, data: any) {
    const client = await this.clientManager.getClientByUserId(userId);
    if (client && client.socket) {
      client.socket.emit(event, data);
    }
  }

  async emitToRoom(roomName: string, event: string, data: any) {
    await this.eventEmitter.emitToRoom(roomName, {
      type: event,
      data: data,
      timestamp: new Date().toISOString(),
    });
  }
}
