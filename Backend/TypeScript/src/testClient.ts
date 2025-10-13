// src/testClient.ts
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:4000");

ws.on("open", () => {
  console.log("🟢 Cliente conectado al servidor WebSocket");

  // 1️⃣ Registrar ID del cliente
  ws.send("cliente_1");

  // 2️⃣ Simular creación de una reserva
  setTimeout(() => {
    const reserva = {
      tipo: "reserva_creada",
      reservaId: "res_001",
      proveedorId: "proveedor_1",
      mensaje: "Nueva reserva creada por cliente_1",
    };
    ws.send(JSON.stringify(reserva));
    console.log("📦 Cliente envió reserva:", reserva);
  }, 2000);
});

// 3️⃣ Escuchar notificaciones
ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("📩 Notificación recibida por cliente:", msg);
});
