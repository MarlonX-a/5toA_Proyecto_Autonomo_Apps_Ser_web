import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { DashboardController, DashboardWebController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ClientManagerService } from './websocket/client-manager.service';
import { EventEmitterService } from './websocket/event-emitter.service';
import { RoomManagerService } from './websocket/room-manager.service';
import { DjangoApiService } from './services/django-api.service';

@Module({
  imports: [],
  controllers: [DashboardController, DashboardWebController],
  providers: [
    WebsocketGateway,
    DashboardService,
    ClientManagerService,
    EventEmitterService,
    RoomManagerService,
    DjangoApiService,
  ],
})
export class AppModule {}
