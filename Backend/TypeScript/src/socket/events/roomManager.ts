// src/socket/events/roomManager.ts
import WebSocket from "ws";
import { getClientBySocketId, getClientByUserId } from "../clientManager";

interface Room {
  name: string;
  clients: Set<string>; // socketIds
}
const rooms: Record<string, Room> = {};

// unir cliente a sala
export function joinRoom(socketId: string, roomName: string) {
  if (!rooms[roomName]) rooms[roomName] = { name: roomName, clients: new Set() };
  rooms[roomName].clients.add(socketId);
  // añade la sala al objeto client (si existe)
  const client = getClientBySocketId(socketId);
  if (client) client.rooms.add(roomName);
  console.log(`🔔 Cliente ${socketId} se unió a la sala "${roomName}"`);
}

// salir de sala
export function leaveRoom(socketId: string, roomName: string) {
  const room = rooms[roomName];
  if (!room) return;
  room.clients.delete(socketId);
  const client = getClientBySocketId(socketId);
  if (client) client.rooms.delete(roomName);
  console.log(`❌ Cliente ${socketId} salió de la sala "${roomName}"`);
}

// emitir mensaje a una sala (usa wss.clients para verificar estado)
export function emitToRoom(roomName: string, message: any, wss?: WebSocket.Server) {
  const room = rooms[roomName];
  if (!room) return;
  const payload = JSON.stringify(message);

  // Si tenemos wss, iteramos sus clients y comprobamos socketId en cada client (lo guardamos en `client` map)
  // Suponemos que cada WebSocket tiene una property custom `__socketId` (que el server establecerá).
  if (wss) {
    wss.clients.forEach((ws: any) => {
      const sid = ws.__socketId as string | undefined;
      if (sid && room.clients.has(sid) && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  } else {
    // fallback: intentar enviar vía client map (si se requiere implementar)
    console.warn("emitToRoom llamado sin wss; no se enviará nada.");
  }
}

// listar salas (debug)
export function listRooms() {
  return Object.keys(rooms);
}

export { rooms };
