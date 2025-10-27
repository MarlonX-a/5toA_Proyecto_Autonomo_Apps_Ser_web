import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
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

  @Get('room/:roomName')
  getRoomDetails(@Param('roomName') roomName: string) {
    // Implementar obtención de detalles específicos de una sala
    return {
      roomName,
      message: 'Detalles de sala específica - implementar según necesidades',
    };
  }
}
