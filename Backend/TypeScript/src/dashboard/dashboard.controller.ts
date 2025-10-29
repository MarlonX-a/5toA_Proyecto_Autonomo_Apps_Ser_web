import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { EventEmitterService } from '../websocket/event-emitter.service';

@Controller('api')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  @Get()
  getDashboard() {
    return this.dashboardService.getDashboardData();
  }

  @Get('clients')
  getClients() {
    return this.dashboardService.getClientDetails();
  }

  @Get('rooms')
  getRooms() {
    return this.dashboardService.getRoomDetails();
  }

  @Get('events')
  getEvents() {
    return this.dashboardService.getEventHistory();
  }

  @Get('api-status')
  getApiStatus() {
    return this.dashboardService.getApiIntegrationStatus();
  }

  @Get('stats')
  getStats() {
    return this.dashboardService.getRealTimeStats();
  }

  @Post('cleanup')
  cleanup() {
    return this.dashboardService.cleanupMetrics();
  }

  @Get('room/:roomName')
  getRoomDetails(@Param('roomName') roomName: string) {
    // Implementar obtención de detalles específicos de una sala
    return {
      roomName,
      message: 'Detalles de sala específica - implementar según necesidades',
    };
  }

  // ========== Endpoint para recibir eventos de Django ==========
  @Post('events/emit')
  @HttpCode(HttpStatus.OK)
  async receiveEventFromDjango(@Body() payload: { type: string; data: any; timestamp: string }) {
    try {
      // Crear evento con la estructura esperada
      const eventData = {
        type: payload.type,
        data: payload.data,
        from: 'django_api',
        timestamp: payload.timestamp || new Date().toISOString(),
      };

      // Determinar a quién enviar la notificación
      const data = payload.data;

      // Si hay proveedor_id, enviar a la sala del proveedor
      if (data.proveedor_id) {
        await this.eventEmitter.emitToRoom(`proveedor_${data.proveedor_id}`, eventData);
      }

      // Si hay cliente_id, enviar a la sala del cliente
      if (data.cliente_id) {
        await this.eventEmitter.emitToRoom(`cliente_${data.cliente_id}`, eventData);
      }

      // Si hay servicio_id, también notificar a todos los clientes conectados
      if (data.servicio_id) {
        await this.eventEmitter.emitToAll(eventData);
      }

      return { success: true, message: 'Evento recibido y emitido correctamente' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Mantener el controlador del dashboard separado
@Controller('dashboard')
export class DashboardWebController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard() {
    return this.dashboardService.getDashboardData();
  }

  @Get('clients')
  getClients() {
    return this.dashboardService.getClientDetails();
  }

  @Get('rooms')
  getRooms() {
    return this.dashboardService.getRoomDetails();
  }

  @Get('events')
  getEvents() {
    return this.dashboardService.getEventHistory();
  }

  @Get('api-status')
  getApiStatus() {
    return this.dashboardService.getApiIntegrationStatus();
  }

  @Get('stats')
  getStats() {
    return this.dashboardService.getRealTimeStats();
  }

  @Post('cleanup')
  cleanup() {
    return this.dashboardService.cleanupMetrics();
  }
}
