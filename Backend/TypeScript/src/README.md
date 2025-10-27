🧩 Proyecto WebSocket — Simulación de Reservas en Tiempo Real
📘 Descripción general

Este proyecto implementa un sistema de notificaciones en tiempo real con WebSocket, que simula la interacción entre clientes y proveedores en un flujo de reservas.

Cada usuario se conecta al servidor WebSocket con su ID único, y las notificaciones son enviadas solo al usuario correspondiente.
El flujo completo incluye creación de reserva, notificación al proveedor y aceptación de la reserva, notificando únicamente al cliente que la creó.

⚙️ Flujo simulado

Cliente se conecta y se registra (cliente_1).

Proveedor se conecta y se registra (proveedor_1).

El cliente crea una reserva → el servidor notifica al proveedor.

El proveedor acepta la reserva → el servidor notifica al cliente.

Ambos reciben sus notificaciones en tiempo real sin interferir con otros usuarios.

🧪 Archivos principales
Archivo	Descripción
src/server.ts	Servidor WebSocket que gestiona conexiones y eventos.
src/testClient.ts	Simula un cliente que crea una reserva.
src/testProveedor.ts	Simula un proveedor que acepta la reserva.
🚀 Pasos para ejecutar la simulación

Instala dependencias:

npm install ws


Inicia el servidor WebSocket:

npx ts-node src/server.ts


En otra terminal, inicia el proveedor:

npx ts-node src/testProveedor.ts


En una tercera terminal, inicia el cliente:

npx ts-node src/testClient.ts

✅ Resultado esperado

El cliente envía una reserva.

El proveedor recibe la notificación de reserva.

El proveedor acepta la reserva.

El cliente recibe la notificación de aceptación.

💬 Todas las notificaciones son dirigidas individualmente:
ningún usuario ajeno recibe mensajes que no le corresponden.

🧠 Tecnologías utilizadas

Node.js

TypeScript

WebSocket (ws)