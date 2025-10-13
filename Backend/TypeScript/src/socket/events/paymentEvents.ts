// src/socket/events/paymentEvents.ts
import { emitToRoom } from "./roomManager";

export function emitPaymentCreated(wss: any, payment: any) {
  const room = `proveedor_${payment.proveedorId}`;
  emitToRoom(room, { type: "pago_registrado", data: payment }, wss);
  console.log(`💰 Pago registrado emitido a sala ${room}`);
}
