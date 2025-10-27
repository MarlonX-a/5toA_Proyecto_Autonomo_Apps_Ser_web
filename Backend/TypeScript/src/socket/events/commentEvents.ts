// src/socket/events/commentEvents.ts
import { emitToRoom } from "./roomManager";

export function emitCommentCreated(wss: any, comment: any) {
  const room = `proveedor_${comment.proveedorId}`;
  emitToRoom(room, { type: "comentario_nuevo", data: comment }, wss);
  console.log(`💬 Comentario nuevo emitido a sala ${room}`);
}
