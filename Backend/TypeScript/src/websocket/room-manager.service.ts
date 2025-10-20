import { Injectable, Logger } from '@nestjs/common';
import { ClientManagerService } from './client-manager.service';

export interface Room {
  name: string;
  clients: Set<string>; // userIds
  createdAt: Date;
  lastActivity: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class RoomManagerService {
  private readonly logger = new Logger(RoomManagerService.name);
  private rooms: Map<string, Room> = new Map();

  constructor(private readonly clientManager: ClientManagerService) {}

  async createRoom(roomName: string, metadata?: Record<string, any>): Promise<Room> {
    const room: Room = {
      name: roomName,
      clients: new Set(),
      createdAt: new Date(),
      lastActivity: new Date(),
      metadata: metadata || {},
    };

    this.rooms.set(roomName, room);
    this.logger.log(`🏠 Sala creada: ${roomName}`);
    return room;
  }

  async joinRoom(userId: string, roomName: string): Promise<void> {
    let room = this.rooms.get(roomName);
    
    if (!room) {
      room = await this.createRoom(roomName);
    }

    room.clients.add(userId);
    room.lastActivity = new Date();

    // Actualizar información del cliente
    const client = this.clientManager.getClientByUserId(userId);
    if (client) {
      client.rooms.add(roomName);
    }

    this.logger.log(`🔔 ${userId} se unió a la sala: ${roomName}`);
  }

  async leaveRoom(userId: string, roomName: string): Promise<void> {
    const room = this.rooms.get(roomName);
    if (!room) return;

    room.clients.delete(userId);
    room.lastActivity = new Date();

    // Actualizar información del cliente
    const client = this.clientManager.getClientByUserId(userId);
    if (client) {
      client.rooms.delete(roomName);
    }

    this.logger.log(`❌ ${userId} salió de la sala: ${roomName}`);

    // Eliminar sala si está vacía
    if (room.clients.size === 0) {
      this.rooms.delete(roomName);
      this.logger.log(`🗑️ Sala eliminada (vacía): ${roomName}`);
    }
  }

  async leaveAllRooms(userId: string): Promise<void> {
    const client = this.clientManager.getClientByUserId(userId);
    if (!client) return;

    const roomsToLeave = Array.from(client.rooms);
    
    for (const roomName of roomsToLeave) {
      await this.leaveRoom(userId, roomName);
    }
  }

  getRoom(roomName: string): Room | undefined {
    return this.rooms.get(roomName);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomsByUser(userId: string): string[] {
    const client = this.clientManager.getClientByUserId(userId);
    return client ? Array.from(client.rooms) : [];
  }

  getRoomClients(roomName: string): string[] {
    const room = this.rooms.get(roomName);
    return room ? Array.from(room.clients) : [];
  }

  getRoomStats() {
    const rooms = this.getAllRooms();
    const now = new Date();

    return {
      total: rooms.length,
      totalClients: rooms.reduce((sum, room) => sum + room.clients.size, 0),
      averageClientsPerRoom: rooms.length > 0 
        ? rooms.reduce((sum, room) => sum + room.clients.size, 0) / rooms.length 
        : 0,
      mostActiveRooms: rooms
        .sort((a, b) => b.clients.size - a.clients.size)
        .slice(0, 5)
        .map(room => ({
          name: room.name,
          clients: room.clients.size,
          lastActivity: room.lastActivity,
        })),
    };
  }

  // Métodos para tipos específicos de salas
  async joinUserRoom(userId: string, role: 'cliente' | 'proveedor' | 'admin'): Promise<void> {
    await this.joinRoom(userId, `${role}_${userId}`);
  }

  async joinRoleRoom(userId: string, role: 'cliente' | 'proveedor' | 'admin'): Promise<void> {
    await this.joinRoom(userId, `all_${role}s`);
  }

  async joinServiceRoom(userId: string, serviceId: string): Promise<void> {
    await this.joinRoom(userId, `service_${serviceId}`);
  }

  async joinLocationRoom(userId: string, locationId: string): Promise<void> {
    await this.joinRoom(userId, `location_${locationId}`);
  }

  // Método para limpiar salas vacías
  async cleanupEmptyRooms(): Promise<void> {
    const emptyRooms = this.getAllRooms().filter(room => room.clients.size === 0);
    
    for (const room of emptyRooms) {
      this.rooms.delete(room.name);
      this.logger.log(`🧹 Sala vacía eliminada: ${room.name}`);
    }
  }

  // Método para obtener estadísticas detalladas de una sala
  getRoomDetails(roomName: string) {
    const room = this.rooms.get(roomName);
    if (!room) return null;

    const clients = this.getRoomClients(roomName);
    const clientDetails = clients.map(userId => {
      const client = this.clientManager.getClientByUserId(userId);
      return client ? {
        userId: client.userId,
        role: client.role,
        connectedAt: client.connectedAt,
        lastActivity: client.lastActivity,
      } : null;
    }).filter(Boolean);

    return {
      name: room.name,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      clientsCount: room.clients.size,
      clients: clientDetails,
      metadata: room.metadata,
    };
  }
}
