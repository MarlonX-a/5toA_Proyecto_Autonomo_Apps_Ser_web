// src/socket/clientManager.ts
import WebSocket from "ws";

export type Role = "cliente" | "proveedor" | "admin";

export interface ClientData {
  socket: WebSocket;
  socketId: string; // id generado por server (puede ser simple)
  userId: string;   // id de usuario (cliente_1 / proveedor_1)
  role: Role;
  rooms: Set<string>;
}

const clientsBySocketId: Map<string, ClientData> = new Map();
const socketIdByUserId: Map<string, string> = new Map(); // userId -> socketId (última conexión)

let nextSocketId = 1;

// Crear/registrar cliente
export function addClient(socket: WebSocket, userId: string, role: Role) {
  const socketId = `s_${nextSocketId++}`;
  const client: ClientData = { socket, socketId, userId, role, rooms: new Set() };
  clientsBySocketId.set(socketId, client);
  socketIdByUserId.set(userId, socketId);
  return client;
}

// Obtener clientData por socketId
export function getClientBySocketId(socketId: string) {
  return clientsBySocketId.get(socketId);
}

// Buscar por userId
export function getClientByUserId(userId: string) {
  const sid = socketIdByUserId.get(userId);
  if (!sid) return undefined;
  return clientsBySocketId.get(sid);
}

// Remover cliente cuando se desconecta
export function removeClientBySocketId(socketId: string) {
  const client = clientsBySocketId.get(socketId);
  if (!client) return;
  clientsBySocketId.delete(socketId);
  // si el mapeo userId -> socketId coincide, lo limpiamos
  const mapped = socketIdByUserId.get(client.userId);
  if (mapped === socketId) socketIdByUserId.delete(client.userId);
}

// Enumerar clientes (debug)
export function listClients() {
  return Array.from(clientsBySocketId.values()).map(c => ({
    socketId: c.socketId,
    userId: c.userId,
    role: c.role,
    rooms: Array.from(c.rooms),
  }));
}
