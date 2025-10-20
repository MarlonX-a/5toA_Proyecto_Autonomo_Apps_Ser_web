import { Injectable, Logger } from '@nestjs/common';
import { AuthenticatedSocket } from './websocket.gateway';

export interface ClientData {
  socketId: string;
  userId: string;
  role: 'cliente' | 'proveedor' | 'admin';
  socket: AuthenticatedSocket;
  connectedAt: Date;
  lastActivity: Date;
  rooms: Set<string>;
}

@Injectable()
export class ClientManagerService {
  private readonly logger = new Logger(ClientManagerService.name);
  private clients: Map<string, ClientData> = new Map(); // userId -> ClientData
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId

  async addClient(clientData: ClientData): Promise<void> {
    const { userId, socketId } = clientData;
    
    // Remover cliente anterior si existe
    await this.removeClient(userId);
    
    this.clients.set(userId, clientData);
    this.socketToUser.set(socketId, userId);
    
    this.logger.log(`👤 Cliente registrado: ${userId} (${clientData.role})`);
  }

  async removeClient(userId: string): Promise<void> {
    const client = this.clients.get(userId);
    if (client) {
      this.clients.delete(userId);
      this.socketToUser.delete(client.socketId);
      this.logger.log(`👤 Cliente removido: ${userId}`);
    }
  }

  async removeClientBySocketId(socketId: string): Promise<void> {
    const userId = this.socketToUser.get(socketId);
    if (userId) {
      await this.removeClient(userId);
    }
  }

  getClientByUserId(userId: string): ClientData | undefined {
    return this.clients.get(userId);
  }

  getClientBySocketId(socketId: string): ClientData | undefined {
    const userId = this.socketToUser.get(socketId);
    return userId ? this.clients.get(userId) : undefined;
  }

  getAllClients(): ClientData[] {
    return Array.from(this.clients.values());
  }

  getClientsByRole(role: 'cliente' | 'proveedor' | 'admin'): ClientData[] {
    return this.getAllClients().filter(client => client.role === role);
  }

  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  getClientsCountByRole(): { cliente: number; proveedor: number; admin: number } {
    const clients = this.getAllClients();
    return {
      cliente: clients.filter(c => c.role === 'cliente').length,
      proveedor: clients.filter(c => c.role === 'proveedor').length,
      admin: clients.filter(c => c.role === 'admin').length,
    };
  }

  async updateLastActivity(userId: string): Promise<void> {
    const client = this.clients.get(userId);
    if (client) {
      client.lastActivity = new Date();
    }
  }

  getInactiveClients(minutes: number = 30): ClientData[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.getAllClients().filter(client => client.lastActivity < cutoff);
  }

  getClientStats() {
    const clients = this.getAllClients();
    const now = new Date();
    
    return {
      total: clients.length,
      byRole: this.getClientsCountByRole(),
      averageConnectionTime: clients.length > 0 
        ? clients.reduce((sum, client) => sum + (now.getTime() - client.connectedAt.getTime()), 0) / clients.length / 1000 / 60
        : 0,
      inactiveClients: this.getInactiveClients().length,
    };
  }

  // Método para limpiar conexiones inactivas
  async cleanupInactiveConnections(): Promise<void> {
    const inactiveClients = this.getInactiveClients(60); // 1 hora
    
    for (const client of inactiveClients) {
      this.logger.log(`🧹 Limpiando cliente inactivo: ${client.userId}`);
      await this.removeClient(client.userId);
      
      // Cerrar conexión del socket
      if (client.socket && client.socket.connected) {
        client.socket.disconnect(true);
      }
    }
  }
}
