# 🚀 WebSocket Server para Django API

Este proyecto implementa un servidor WebSocket robusto en TypeScript que se conecta a tu API REST de Python Django, proporcionando funcionalidades de tiempo real para tu aplicación.

## ✨ Características

- **Dashboard en tiempo real** - Monitoreo de conexiones y eventos
- **Gestión de conexiones** - Manejo avanzado de clientes con roles
- **Sistema de salas/canales** - Organización por tipos de datos
- **Emisión de eventos** - Notificaciones en tiempo real
- **Integración con Django** - Sincronización con API REST
- **Autenticación** - Verificación de tokens con Django
- **Limpieza automática** - Gestión de conexiones inactivas

## 🏗️ Arquitectura

```
src/
├── websocket/
│   ├── websocket.gateway.ts      # Gateway principal de WebSocket
│   ├── client-manager.service.ts # Gestión de clientes
│   ├── room-manager.service.ts   # Gestión de salas
│   └── event-emitter.service.ts  # Emisión de eventos
├── dashboard/
│   ├── dashboard.controller.ts   # API REST para dashboard
│   └── dashboard.service.ts      # Lógica del dashboard
├── services/
│   └── django-api.service.ts     # Integración con Django
├── test-clients/
│   ├── websocket-client.ts        # Cliente de prueba
│   └── test-runner.ts            # Ejecutor de pruebas
└── config/
    └── config.ts                 # Configuración
```

## 🚀 Instalación y Uso

### 1. Instalar dependencias
```bash
cd Backend/TypeScript
npm install
```

### 2. Configurar la API de Django
Asegúrate de que tu API Django esté corriendo en `http://localhost:8000`

### 3. Iniciar el servidor WebSocket
```bash
npm run start:dev
```

El servidor se iniciará en `http://localhost:4000`

### 4. Acceder al Dashboard
Visita `http://localhost:4000/dashboard` para ver el dashboard en tiempo real

### 5. Ejecutar clientes de prueba
```bash
npm run test:clients
```

## 📡 API del Dashboard

### Endpoints disponibles:

- `GET /dashboard` - Datos generales del dashboard
- `GET /dashboard/clients` - Lista de clientes conectados
- `GET /dashboard/rooms` - Lista de salas activas
- `GET /dashboard/events` - Historial de eventos
- `GET /dashboard/api-status` - Estado de conexión con Django
- `GET /dashboard/stats` - Estadísticas en tiempo real
- `POST /dashboard/cleanup` - Limpiar datos inactivos

## 🔌 Eventos WebSocket

### Eventos del Cliente:
- `authenticate` - Autenticación con token
- `join_room` - Unirse a una sala
- `leave_room` - Salir de una sala
- `reservation_created` - Crear reserva
- `reservation_accepted` - Aceptar reserva
- `payment_created` - Crear pago
- `comment_created` - Crear comentario

### Eventos del Servidor:
- `auth_success` - Autenticación exitosa
- `auth_error` - Error de autenticación
- `event` - Evento general
- `room_joined` - Confirmación de unión a sala
- `room_left` - Confirmación de salida de sala

## 🏠 Sistema de Salas

### Tipos de salas automáticas:
- `cliente_{userId}` - Sala personal del cliente
- `proveedor_{userId}` - Sala personal del proveedor
- `all_clientes` - Sala general de clientes
- `all_proveedores` - Sala general de proveedores
- `admin_dashboard` - Sala de administradores

### Salas específicas:
- `service_{serviceId}` - Sala de un servicio específico
- `location_{locationId}` - Sala de una ubicación específica

## 🔐 Autenticación

El sistema utiliza tokens de Django para autenticación:

```typescript
// Ejemplo de autenticación
socket.emit('authenticate', {
  token: 'tu_token_de_django',
  userId: 'usuario_123',
  role: 'cliente' // o 'proveedor' o 'admin'
});
```

## 📊 Monitoreo

### Métricas disponibles:
- Conexiones activas por rol
- Salas creadas y clientes por sala
- Tiempo promedio de conexión
- Eventos emitidos por minuto
- Estado de la API de Django

### Dashboard en tiempo real:
- Actualización automática cada 5 segundos
- Limpieza automática de datos inactivos
- Estadísticas del sistema (memoria, uptime)
- Logs de eventos en tiempo real

## 🧪 Pruebas

### Cliente de prueba incluido:
```typescript
import { createClient } from './test-clients/websocket-client';

const client = createClient('usuario_1', 'cliente', 'token_123');
client.createReservation({
  clienteId: 'usuario_1',
  proveedorId: 'proveedor_1',
  servicioId: 'servicio_1',
  fecha: new Date().toISOString(),
  estado: 'pendiente'
});
```

### Ejecutar pruebas:
```bash
# Ejecutar clientes de prueba
npm run test:clients

# Ejecutar tests unitarios
npm test
```

## 🔧 Configuración

Edita `src/config/config.ts` para personalizar:

```typescript
export const config = {
  websocket: {
    port: 4000,
    cors: { /* configuración CORS */ }
  },
  django: {
    baseUrl: 'http://localhost:8000/api/v1/',
    timeout: 10000
  },
  // ... más configuraciones
};
```

## 🚨 Solución de Problemas

### Error de conexión con Django:
1. Verifica que Django esté corriendo en el puerto 8000
2. Revisa la configuración CORS en Django
3. Verifica que el endpoint `/api/v1/profile/` esté disponible

### Problemas de autenticación:
1. Asegúrate de que el token sea válido
2. Verifica que el usuario exista en Django
3. Revisa los logs del servidor para errores específicos

### Dashboard no carga:
1. Verifica que el servidor esté corriendo en el puerto 4000
2. Revisa la consola del navegador para errores
3. Asegúrate de que el archivo `dashboard.html` esté en la carpeta `public`

## 📝 Logs

El sistema incluye logging detallado:
- Conexiones y desconexiones de clientes
- Eventos emitidos y recibidos
- Errores de autenticación
- Estado de la API de Django
- Métricas del sistema

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**¡Disfruta usando tu WebSocket server! 🚀**