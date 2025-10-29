# Guía de Integración End-to-End (en mis palabras)

Objetivo: Confirmar que REST, WS y Frontend se comunican “de punta a punta”.

## 1) Preparar todo
- Django corriendo en `:8000`
- NestJS corriendo en `:4000` (dashboard abierto)
- Frontend en `:5173` (logueado)

## 2) Generar un evento real
- Desde el Frontend creo una reserva (o comentario, o pago).
- Django guarda en DB y su `signals.py` envía POST a `http://localhost:4000/api/events/emit`.
- NestJS recibe el payload y emite por WS a:
  - `proveedor_{id}` si hay proveedor
  - `cliente_{id}` si hay cliente
  - `all_clientes` si aplica

## 3) Verificar que llegó
- En el dashboard de NestJS veo el evento y la conexión del cliente.
- Si el frontend tiene SocketProvider activo, veo una notificación del navegador.

## 4) Salas/canales que uso
- `cliente_{userId}`: canal personal del cliente.
- `proveedor_{userId}`: canal personal del proveedor.
- `all_clientes` / `all_proveedores`: broadcast por rol.

Listo. Con esto demuestro que REST → WS → Frontend funciona en tiempo real.
