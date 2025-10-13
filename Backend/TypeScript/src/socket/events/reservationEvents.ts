// src/socket/events/reservationEvents.ts
import { emitToRoom } from "./roomManager";

// 🧾 Emitir evento cuando se crea una reserva
export function emitReservationCreated(wss: any, reservation: any) {
  const room = `proveedor_${reservation.proveedorId}`;
  emitToRoom(room, { type: "reserva_creada", data: reservation }, wss);
  console.log(`📢 Reserva creada emitida a sala ${room}`);
}
