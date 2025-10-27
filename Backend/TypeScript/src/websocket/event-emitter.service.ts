import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { ClientManagerService } from './client-manager.service';
import { RoomManagerService } from './room-manager.service';

export interface EventData {
  type: string;
  data: any;
  from?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);
  private server: Server;

  constructor(
    private readonly clientManager: ClientManagerService,
    private readonly roomManager: RoomManagerService,
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  async emitToRoom(roomName: string, eventData: EventData): Promise<void> {
    if (!this.server) {
      this.logger.warn('Servidor no inicializado');
      return;
    }

    const room = this.roomManager.getRoom(roomName);
    if (!room) {
      this.logger.warn(`Sala no encontrada: ${roomName}`);
      return;
    }

    const clients = this.roomManager.getRoomClients(roomName);
    let successCount = 0;

    for (const userId of clients) {
      const client = this.clientManager.getClientByUserId(userId);
      if (client && client.socket && client.socket.connected) {
        try {
          client.socket.emit('event', eventData);
          successCount++;
        } catch (error) {
          this.logger.error(`Error enviando evento a ${userId}:`, error);
        }
      }
    }

    this.logger.log(`📡 Evento '${eventData.type}' enviado a ${successCount}/${clients.length} clientes en sala '${roomName}'`);
  }

  async emitToUser(userId: string, eventData: EventData): Promise<void> {
    if (!this.server) {
      this.logger.warn('Servidor no inicializado');
      return;
    }

    const client = this.clientManager.getClientByUserId(userId);
    if (client && client.socket && client.socket.connected) {
      try {
        client.socket.emit('event', eventData);
        this.logger.log(`📡 Evento '${eventData.type}' enviado a usuario '${userId}'`);
      } catch (error) {
        this.logger.error(`Error enviando evento a ${userId}:`, error);
      }
    } else {
      this.logger.warn(`Usuario no conectado: ${userId}`);
    }
  }

  async emitToRole(role: 'cliente' | 'proveedor' | 'admin', eventData: EventData): Promise<void> {
    const clients = this.clientManager.getClientsByRole(role);
    let successCount = 0;

    for (const client of clients) {
      if (client.socket && client.socket.connected) {
        try {
          client.socket.emit('event', eventData);
          successCount++;
        } catch (error) {
          this.logger.error(`Error enviando evento a ${client.userId}:`, error);
        }
      }
    }

    this.logger.log(`📡 Evento '${eventData.type}' enviado a ${successCount}/${clients.length} ${role}s`);
  }

  async emitToAll(eventData: EventData): Promise<void> {
    if (!this.server) {
      this.logger.warn('Servidor no inicializado');
      return;
    }

    const clients = this.clientManager.getAllClients();
    let successCount = 0;

    for (const client of clients) {
      if (client.socket && client.socket.connected) {
        try {
          client.socket.emit('event', eventData);
          successCount++;
        } catch (error) {
          this.logger.error(`Error enviando evento a ${client.userId}:`, error);
        }
      }
    }

    this.logger.log(`📡 Evento '${eventData.type}' enviado a ${successCount}/${clients.length} clientes`);
  }

  async emitToDashboard(eventType: string, data: any): Promise<void> {
    await this.emitToRoom('admin_dashboard', {
      type: eventType,
      data: data,
      timestamp: new Date().toISOString(),
    });
  }

  // Métodos específicos para eventos del negocio
  async emitReservationCreated(reservation: any): Promise<void> {
    const eventData: EventData = {
      type: 'reservation_created',
      data: reservation,
      timestamp: new Date().toISOString(),
    };

    // Notificar al proveedor
    await this.emitToRoom(`proveedor_${reservation.proveedorId}`, eventData);
    
    // Notificar al dashboard
    await this.emitToDashboard('reservation_created', reservation);
  }

  async emitReservationAccepted(reservation: any): Promise<void> {
    const eventData: EventData = {
      type: 'reservation_accepted',
      data: reservation,
      timestamp: new Date().toISOString(),
    };

    // Notificar al cliente
    await this.emitToRoom(`cliente_${reservation.clienteId}`, eventData);
    
    // Notificar al dashboard
    await this.emitToDashboard('reservation_accepted', reservation);
  }

  async emitPaymentCreated(payment: any): Promise<void> {
    const eventData: EventData = {
      type: 'payment_created',
      data: payment,
      timestamp: new Date().toISOString(),
    };

    // Notificar al proveedor
    await this.emitToRoom(`proveedor_${payment.proveedorId}`, eventData);
    
    // Notificar al dashboard
    await this.emitToDashboard('payment_created', payment);
  }

  async emitCommentCreated(comment: any): Promise<void> {
    const eventData: EventData = {
      type: 'comment_created',
      data: comment,
      timestamp: new Date().toISOString(),
    };

    // Notificar al proveedor
    await this.emitToRoom(`proveedor_${comment.proveedorId}`, eventData);
    
    // Notificar al dashboard
    await this.emitToDashboard('comment_created', comment);
  }

  async emitSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    const eventData: EventData = {
      type: 'system_notification',
      data: { message, type },
      timestamp: new Date().toISOString(),
    };

    await this.emitToAll(eventData);
  }

  // Método para obtener estadísticas de eventos
  getEventStats() {
    return {
      totalRooms: this.roomManager.getAllRooms().length,
      totalClients: this.clientManager.getConnectedClientsCount(),
      clientsByRole: this.clientManager.getClientsCountByRole(),
    };
  }
}
