// src/server.ts
import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 4000 });
console.log("🚀 Servidor WebSocket corriendo en ws://localhost:4000");

const clientesConectados = new Map<string, WebSocket>();

wss.on("connection", (ws) => {
  console.log("🟢 Cliente conectado");

  // 1️⃣ Recibir el primer mensaje como ID
  ws.once("message", (data) => {
    const usuarioId = data.toString();
    clientesConectados.set(usuarioId, ws);
    console.log(`📍 Usuario registrado: ${usuarioId}`);

    // 2️⃣ Escuchar siguientes mensajes (eventos)
    ws.on("message", (info) => {
      try {
        const evento = JSON.parse(info.toString());

        // Cliente crea una reserva → notificar al proveedor
        if (evento.tipo === "reserva_creada") {
          const proveedor = clientesConectados.get(evento.proveedorId);
          if (proveedor) {
            proveedor.send(JSON.stringify(evento));
          }
        }

        // Proveedor acepta → notificar al cliente
        if (evento.tipo === "reserva_aceptada") {
          const cliente = clientesConectados.get(evento.clienteId);
          if (cliente) {
            cliente.send(JSON.stringify(evento));
          }
        }
      } catch (err) {
        console.error("Error procesando mensaje:", err);
      }
    });
  });

  ws.on("close", () => {
    for (const [id, socket] of clientesConectados.entries()) {
      if (socket === ws) clientesConectados.delete(id);
    }
  });
});
