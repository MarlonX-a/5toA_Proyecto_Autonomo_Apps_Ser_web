// src/testProveedor.ts
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:4000");

ws.on("open", () => {
  console.log("🟢 Proveedor conectado al servidor WebSocket");

  // 1️⃣ Registrar ID del proveedor
  ws.send("proveedor_1");
});

// 2️⃣ Escuchar eventos del servidor
ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("📩 Notificación recibida por proveedor:", msg);

  // 3️⃣ Si la notificación es una reserva, aceptar después de unos segundos
  if (msg.tipo === "reserva_creada") {
    setTimeout(() => {
      const respuesta = {
        tipo: "reserva_aceptada",
        reservaId: msg.reservaId,
        clienteId: "cliente_1",
        mensaje: "Reserva aceptada por proveedor_1",
      };
      ws.send(JSON.stringify(respuesta));
      console.log("✅ Proveedor aceptó la reserva:", respuesta);
    }, 2000);
  }
});
