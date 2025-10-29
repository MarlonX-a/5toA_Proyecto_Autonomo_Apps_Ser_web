# Frontend – React + Vite (lo que yo hago para correrlo)

## Qué hace
- Inicia sesión contra la API de Django.
- Almacena el token en localStorage y consume endpoints protegidos.
- (Opcional) Se puede conectar al WebSocket para recibir notificaciones en tiempo real.

## Requisitos
- Node 18+ recomendado

## Arranque
```bash
cd Frontend
npm install
npm run dev
```
- Abrir: `http://localhost:5173`

## Flujo de uso
1) Me registro o hago login → obtengo `token`.
2) El frontend guarda `token` en localStorage.
3) Con ese `token` consumo endpoints (ej: reservas, servicios).
4) (Opcional) Activo el cliente WebSocket para recibir eventos (reservas/pagos/comentarios).

## Activar WebSocket (opcional)
- Crear `src/context/SocketProvider.tsx` con una conexión via `socket.io-client` que:
  - Envíe `authenticate` con `{ token, userId, role }`
  - Escuche `event` y muestre notificaciones del navegador.
- Envolver la app con `<SocketProvider>` en `src/main.tsx`.

Con eso el frontend queda “escuchando” lo que re-emite NestJS cuando Django dispara señales.
