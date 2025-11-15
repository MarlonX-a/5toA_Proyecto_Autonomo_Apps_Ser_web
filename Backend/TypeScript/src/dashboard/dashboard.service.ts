import { Injectable, Logger } from '@nestjs/common';
import { ClientManagerService } from '../websocket/client-manager.service';
import { RoomManagerService } from '../websocket/room-manager.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { DjangoApiService } from '../services/django-api.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private metrics: {
    totalConnections: number;
    activeConnections: number;
    eventsEmitted: number;
    roomsCreated: number;
    lastUpdated: Date;
  } = {
    totalConnections: 0,
    activeConnections: 0,
    eventsEmitted: 0,
    roomsCreated: 0,
    lastUpdated: new Date(),
  };

  constructor(
    private readonly clientManager: ClientManagerService,
    private readonly roomManager: RoomManagerService,
    private readonly eventEmitter: EventEmitterService,
    private readonly djangoApi: DjangoApiService,
  ) {}

  getDashboardData() {
    const clientStats = this.clientManager.getClientStats();
    const roomStats = this.roomManager.getRoomStats();
    
    return {
      metrics: {
        ...this.metrics,
        activeConnections: clientStats.total,
        lastUpdated: new Date().toISOString(),
      },
      clients: {
        total: clientStats.total,
        byRole: clientStats.byRole,
        averageConnectionTime: clientStats.averageConnectionTime,
        inactiveClients: clientStats.inactiveClients,
      },
      rooms: {
        total: roomStats.total,
        totalClients: roomStats.totalClients,
        averageClientsPerRoom: roomStats.averageClientsPerRoom,
        mostActiveRooms: roomStats.mostActiveRooms,
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
      },
    };
  }

  getClientDetails() {
    return this.clientManager.getAllClients().map(client => ({
      userId: client.userId,
      role: client.role,
      socketId: client.socketId,
      connectedAt: client.connectedAt,
      lastActivity: client.lastActivity,
      rooms: Array.from(client.rooms),
      isActive: client.socket?.connected || false,
    }));
  }

  getRoomDetails() {
    return this.roomManager.getAllRooms().map(room => ({
      name: room.name,
      clientsCount: room.clients.size,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      clients: Array.from(room.clients),
      metadata: room.metadata,
    }));
  }

  getEventHistory() {
    return {
      recentEvents: [
        {
          type: 'client_connected',
          timestamp: new Date().toISOString(),
          data: { message: 'Cliente conectado' },
        },
        {
          type: 'room_created',
          timestamp: new Date().toISOString(),
          data: { message: 'Sala creada' },
        },
      ],
      totalEvents: this.metrics.eventsEmitted,
    };
  }

  async getApiIntegrationStatus() {
    // En lugar de verificar un token (que genera 401 si es inválido),
    // hacemos un ping al root público de DRF para validar conectividad.
    try {
      const res = await fetch('http://127.0.0.1:8000/api_rest/api/v1/')
        .then(r => ({ ok: r.ok, status: r.status }))
        .catch(() => ({ ok: false, status: 0 }));

      return {
        status: res.ok ? 'connected' : 'disconnected',
        lastCheck: new Date().toISOString(),
        httpStatus: res.status,
      };
    } catch (error: any) {
      return {
        status: 'disconnected',
        lastCheck: new Date().toISOString(),
        error: error?.message || 'Unknown error',
      };
    }
  }

  updateMetrics(eventType: string) {
    this.metrics.eventsEmitted++;
    this.metrics.lastUpdated = new Date();

    switch (eventType) {
      case 'client_connected':
        this.metrics.totalConnections++;
        break;
      case 'room_created':
        this.metrics.roomsCreated++;
        break;
    }
  }

  // Método para limpiar métricas periódicamente
  async cleanupMetrics() {
    this.logger.log('🧹 Limpiando métricas del dashboard');
    
    // Limpiar conexiones inactivas
    await this.clientManager.cleanupInactiveConnections();
    
    // Limpiar salas vacías
    await this.roomManager.cleanupEmptyRooms();
    
    // Actualizar métricas
    this.metrics.activeConnections = this.clientManager.getConnectedClientsCount();
    this.metrics.lastUpdated = new Date();
  }

  // Método para obtener estadísticas en tiempo real
  getRealTimeStats() {
    return {
      timestamp: new Date().toISOString(),
      activeConnections: this.clientManager.getConnectedClientsCount(),
      totalRooms: this.roomManager.getAllRooms().length,
      eventsPerMinute: this.calculateEventsPerMinute(),
      systemLoad: this.getSystemLoad(),
    };
  }

  private calculateEventsPerMinute(): number {
    // Implementación simplificada - podrías usar un contador más sofisticado
    return Math.floor(this.metrics.eventsEmitted / (process.uptime() / 60));
  }

  private getSystemLoad(): any {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  }
}
