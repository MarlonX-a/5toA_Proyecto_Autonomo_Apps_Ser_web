# 📚 GUÍA COMPLETA: EXPLICACIÓN DETALLADA DE TYPESCRIPT

Esta guía te explica **paso a paso y archivo por archivo** la carpeta TypeScript del Backend. Aquí aprenderás qué hace CADA componente y por qué existe.

---

## 🎯 PROPÓSITO GENERAL DEL PROYECTO TYPESCRIPT

Tu servidor TypeScript es un **servidor WebSocket en tiempo real** que actúa como intermediario entre:
- **Frontend** (React en puerto 5173)
- **Backend Python/Django** (puerto 8000)
- **Backend Go/GraphQL** (puerto con sus APIs)

**Función principal**: Notificar cambios en TIEMPO REAL a todos los usuarios conectados.

```
┌─────────────┐
│   FRONTEND  │  (React - puerto 5173)
│  (5173)     │
└──────┬──────┘
       │ WebSocket
       ▼
┌──────────────────────────┐
│  TYPESCRIPT WEBSOCKET    │  ◄── TÚ ESTÁS AQUÍ
│  (TypeScript - 4000)     │
└──────┬───────────────────┘
       │ HTTP REST
       ├────────────┬──────────────┐
       ▼            ▼              ▼
    Django      GraphQL         Otras APIs
    (8000)      (Golang)
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
Backend/TypeScript/
├── src/                          ← Código fuente
│   ├── main.ts                   ← PUNTO DE ENTRADA
│   ├── app.module.ts             ← Configuración de NestJS
│   ├── websocket/                ← LÓGICA DE CONEXIONES
│   │   ├── websocket.gateway.ts              (Punto de entrada de WebSocket)
│   │   ├── client-manager.service.ts        (Gestión de clientes)
│   │   ├── room-manager.service.ts          (Gestión de salas)
│   │   └── event-emitter.service.ts         (Envío de eventos)
│   ├── dashboard/                ← PANEL DE CONTROL
│   │   ├── dashboard.controller.ts          (API REST del dashboard)
│   │   └── dashboard.service.ts             (Lógica del dashboard)
│   ├── services/                 ← SERVICIOS
│   │   └── django-api.service.ts            (Conexión con Django)
│   └── config/                   ← CONFIGURACIÓN
│       └── config.ts                        (Parámetros globales)
├── public/                       ← Archivos estáticos
│   └── dashboard.html            (Página web del dashboard)
├── package.json                  ← Dependencias del proyecto
├── tsconfig.json                 ← Configuración de TypeScript
└── README.md                     ← Documentación original

```

---

# 📄 EXPLICACIÓN ARCHIVO POR ARCHIVO

## 1️⃣ `main.ts` - PUNTO DE ENTRADA ⭐

**¿Qué es?** El archivo que se ejecuta cuando inicias el servidor.

**Ubicación:** `Backend/TypeScript/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import cors from 'cors';
import { join } from 'path';

async function bootstrap() {
  // 1. Crear aplicación NestJS
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 2. Configurar CORS (quién puede conectarse)
  app.use(cors({
    origin: [
      'http://localhost:3000',      // Frontend (React)
      'http://localhost:8000',      // Django API
      'http://localhost:5173',      // Vite dev server
      'http://127.0.0.1:5173',      // Vite dev server alternativo
    ],
    credentials: true,             // Permitir cookies
  }));

  // 3. Servir archivos estáticos (dashboard.html)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 4. Configurar adaptador WebSocket con Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // 5. Iniciar servidor en puerto 4000
  await app.listen(4000);
  console.log('🚀 Servidor WebSocket corriendo en puerto 4000');
  console.log('📡 Dashboard disponible en http://localhost:4000/dashboard.html');
  console.log('🔌 WebSocket disponible en ws://localhost:4000');
}

// Ejecutar función bootstrap
bootstrap();
```

**Qué hace paso a paso:**

1. **`NestFactory.create(AppModule)`** - Crea la aplicación NestJS
2. **`app.use(cors(...))`** - Permite que otros puertos se conecten (CORS)
3. **`app.useStaticAssets(...)`** - Sirve archivos HTML/CSS/JS desde la carpeta `public`
4. **`app.useWebSocketAdapter(...)`** - Configura Socket.IO para WebSocket
5. **`app.listen(4000)`** - Inicia el servidor en puerto 4000

**En resumen:**
- ✅ Abre puerto 4000
- ✅ Habilita WebSocket
- ✅ Permite conexiones desde diferentes puertos (CORS)
- ✅ Sirve la página del dashboard

---

## 2️⃣ `app.module.ts` - CONFIGURACIÓN DE NESTJS

**¿Qué es?** El archivo que declara todos los servicios y controladores que usa la aplicación.

**Ubicación:** `Backend/TypeScript/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { DashboardController, DashboardWebController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ClientManagerService } from './websocket/client-manager.service';
import { EventEmitterService } from './websocket/event-emitter.service';
import { RoomManagerService } from './websocket/room-manager.service';
import { DjangoApiService } from './services/django-api.service';

@Module({
  imports: [],  // Otros módulos (vacío por ahora)
  
  controllers: [DashboardController, DashboardWebController],  // APIs REST
  
  providers: [
    WebsocketGateway,           // Punto de entrada WebSocket
    DashboardService,           // Lógica del dashboard
    ClientManagerService,       // Gestión de clientes
    EventEmitterService,        // Envío de eventos
    RoomManagerService,         // Gestión de salas
    DjangoApiService,          // Comunicación con Django
  ],
})
export class AppModule {}
```

**Qué hace:**

| Componente | Función |
|-----------|---------|
| `WebsocketGateway` | Recibe y maneja conexiones WebSocket |
| `ClientManagerService` | Guarda quién está conectado |
| `EventEmitterService` | Envía mensajes a clientes |
| `RoomManagerService` | Organiza clientes en salas |
| `DashboardService` | Proporciona estadísticas |
| `DashboardController` | APIs REST para obtener datos |
| `DjangoApiService` | Se comunica con Django |

**Analogía:** Es como el registro de una empresa donde declara todos sus departamentos.

---

## 3️⃣ `config/config.ts` - CONFIGURACIÓN GLOBAL

**¿Qué es?** Un archivo con los parámetros que puedes cambiar fácilmente.

**Ubicación:** `Backend/TypeScript/src/config/config.ts`

```typescript
export const config = {
  // Puerto donde corre WebSocket
  websocket: {
    port: 4000,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:8000'],
      credentials: true,
    },
  },

  // Configuración de Django
  django: {
    baseUrl: 'http://127.0.0.1:8000/api_rest/api/v1/',  // URL de Django
    timeout: 10000,  // 10 segundos máximo de espera
  },

  // Dashboard
  dashboard: {
    refreshInterval: 5000,      // Actualizar cada 5 segundos
    cleanupInterval: 300000,    // Limpiar cada 5 minutos
  },

  // Limpieza automática
  cleanup: {
    inactiveClientTimeout: 60,      // Eliminar clientes inactivos después de 60 minutos
    emptyRoomCleanup: true,         // Eliminar salas vacías
    metricsResetInterval: 3600000,  // Reiniciar métricas cada hora
  },

  // Logging
  logging: {
    level: 'debug',
    enableWebSocketLogs: true,
    enableApiLogs: true,
  },
};
```

**Cuándo cambiar estos valores:**

- Si Django está en otro servidor: cambiar `baseUrl`
- Si quieres otro puerto: cambiar `port`
- Si hay demasiados clientes inactivos: reducir `inactiveClientTimeout`

---

## 4️⃣ CARPETA `websocket/` - EL CORAZÓN DEL PROYECTO 💓

Esta carpeta contiene la lógica principal de conexiones en tiempo real.

---

### 4.1 `websocket.gateway.ts` - PUNTO DE ENTRADA DE WEBSOCKET ⭐⭐

**¿Qué es?** El componente que recibe conexiones WebSocket y maneja eventos.

**Ubicación:** `Backend/TypeScript/src/websocket/websocket.gateway.ts`

**Conceptos clave:**
- **Gateway** = "Puerta de entrada" al sistema WebSocket
- **Socket** = Conexión individual de un cliente
- **Events** = Mensajes que se envían

```typescript
@WebSocketGateway({
  cors: { origin: [...] },  // Permite conexiones de estos orígenes
  namespace: '/',           // Namespace raíz
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;  // El servidor Socket.IO principal

  constructor(
    private readonly clientManager: ClientManagerService,      // Gestionar clientes
    private readonly eventEmitter: EventEmitterService,        // Enviar eventos
    private readonly roomManager: RoomManagerService,          // Gestionar salas
    private readonly djangoApi: DjangoApiService,             // Conectar con Django
  ) {}
```

**¿Qué métodos principales tiene?**

#### A) `handleConnection()` - Cuando se conecta un cliente

```typescript
async handleConnection(client: AuthenticatedSocket) {
  console.log(`Cliente conectado: ${client.id}`);
  
  // Notificar al dashboard que alguien se conectó
  this.eventEmitter.emitToDashboard('client_connected', {
    socketId: client.id,
    timestamp: new Date().toISOString(),
  });
}
```

**¿Cuándo se ejecuta?** Cuando alguien en el Frontend hace:
```javascript
const socket = io('http://localhost:4000');
```

---

#### B) `handleDisconnect()` - Cuando se desconecta un cliente

```typescript
async handleDisconnect(client: AuthenticatedSocket) {
  console.log(`Cliente desconectado: ${client.id}`);
  
  // Eliminar de la lista de clientes
  if (client.isAuthenticated && client.userId) {
    await this.clientManager.removeClient(client.userId);
    await this.roomManager.leaveAllRooms(client.userId);
  }
  
  // Notificar al dashboard
  this.eventEmitter.emitToDashboard('client_disconnected', { ... });
}
```

**¿Cuándo se ejecuta?** Cuando el cliente cierra la página o se desconecta.

---

#### C) `@SubscribeMessage('authenticate')` - Autenticación

```typescript
@SubscribeMessage('authenticate')
async handleAuthentication(
  @MessageBody() data: { token: string; userId: string; role: 'cliente' | 'proveedor' | 'admin' },
  @ConnectedSocket() client: AuthenticatedSocket,
) {
  // 1. Verificar que el token sea válido
  const isValid = await this.djangoApi.verifyToken(data.token);
  
  if (!isValid) {
    client.emit('auth_error', { message: 'Token inválido' });
    return;
  }

  // 2. Registrar cliente como autenticado
  client.userId = data.userId;
  client.userRole = data.role;
  client.isAuthenticated = true;

  // 3. Agregarlo a la lista de clientes
  await this.clientManager.addClient({ ... });

  // 4. Unirlo a salas según su rol
  await this.joinRoleBasedRooms(client);

  // 5. Confirmar al cliente que se autenticó
  client.emit('auth_success', { 
    message: 'Autenticación exitosa',
    userId: data.userId,
    role: data.role,
  });
}
```

**¿Cuándo se ejecuta?** Cuando el Frontend envía:
```javascript
socket.emit('authenticate', {
  token: 'mi_token_de_django',
  userId: 'usuario_123',
  role: 'cliente'
});
```

---

#### D) `@SubscribeMessage('join_room')` - Unirse a una sala

```typescript
@SubscribeMessage('join_room')
async handleJoinRoom(
  @MessageBody() data: { roomName: string },
  @ConnectedSocket() client: AuthenticatedSocket,
) {
  // Solo si está autenticado
  if (!client.isAuthenticated) {
    client.emit('error', { message: 'No autenticado' });
    return;
  }

  // Unir a la sala
  await this.roomManager.joinRoom(client.userId, data.roomName);
  
  // Confirmar al cliente
  client.emit('room_joined', { roomName: data.roomName });
}
```

**¿Cuándo se ejecuta?** Cuando quieres unirte a una sala específica.

---

#### E) Eventos de negocio (reservas, pagos, etc.)

```typescript
@SubscribeMessage('reservation_created')
async handleReservationCreated(
  @MessageBody() data: any,
  @ConnectedSocket() client: AuthenticatedSocket,
) {
  // Enviar notificación a la sala del proveedor
  const roomName = `proveedor_${data.proveedorId}`;
  await this.eventEmitter.emitToRoom(roomName, {
    type: 'reservation_created',
    data: data,
    from: client.userId,
    timestamp: new Date().toISOString(),
  });
}
```

**Lo mismo para:**
- `reservation_accepted` - Proveedor acepta reserva
- `payment_created` - Nuevo pago
- `comment_created` - Nuevo comentario

---

**Resumen de `websocket.gateway.ts`:**

| Método | ¿Cuándo? | ¿Qué hace? |
|--------|---------|-----------|
| `handleConnection()` | Cliente se conecta | Registra conexión |
| `handleDisconnect()` | Cliente se desconecta | Limpia datos |
| `handleAuthentication()` | `emit('authenticate')` | Verifica token y registra usuario |
| `handleJoinRoom()` | `emit('join_room')` | Agrega usuario a sala |
| `handleLeaveRoom()` | `emit('leave_room')` | Quita usuario de sala |
| `handleReservationCreated()` | Nueva reserva | Notifica al proveedor |
| `handlePaymentCreated()` | Nuevo pago | Notifica al proveedor |

---

### 4.2 `client-manager.service.ts` - GESTIÓN DE CLIENTES

**¿Qué es?** Un servicio que mantiene un registro de quién está conectado.

**Ubicación:** `Backend/TypeScript/src/websocket/client-manager.service.ts`

**Analogía:** Es como la recepción de un hotel que sabe quién entra, cuándo entró, en qué habitación está, etc.

```typescript
export interface ClientData {
  socketId: string;              // ID único de la conexión
  userId: string;                // ID del usuario
  role: 'cliente' | 'proveedor' | 'admin';  // Rol
  socket: AuthenticatedSocket;   // La conexión WebSocket
  connectedAt: Date;             // Cuándo se conectó
  lastActivity: Date;            // Última actividad
  rooms: Set<string>;            // Salas a las que pertenece
}
```

**Métodos principales:**

```typescript
// Agregar un cliente
async addClient(clientData: ClientData): Promise<void>

// Remover un cliente
async removeClient(userId: string): Promise<void>

// Obtener cliente por ID de usuario
getClientByUserId(userId: string): ClientData | undefined

// Obtener todos los clientes
getAllClients(): ClientData[]

// Obtener clientes por rol
getClientsByRole(role: 'cliente' | 'proveedor' | 'admin'): ClientData[]

// Contar clientes conectados
getConnectedClientsCount(): number

// Obtener estadísticas
getClientStats(): {
  total: number;
  byRole: { cliente: number; proveedor: number; admin: number };
  averageConnectionTime: number;
  inactiveClients: number;
}

// Limpiar conexiones inactivas
async cleanupInactiveConnections(): Promise<void>
```

**¿Por qué necesitamos esto?**

- Saber quién está conectado
- No enviar mensajes a alguien que se desconectó
- Obtener estadísticas del dashboard
- Limpiar conexiones muertas

---

### 4.3 `room-manager.service.ts` - GESTIÓN DE SALAS

**¿Qué es?** Un servicio que organiza clientes en "salas" o "canales".

**Ubicación:** `Backend/TypeScript/src/websocket/room-manager.service.ts`

**¿Por qué salas?** Imagina que quieres enviar un mensaje solo a los proveedores. Sin salas tendrías que revisar a cada cliente. Con salas simplemente envías el mensaje a la sala `all_proveedores`.

```typescript
export interface Room {
  name: string;                    // Nombre de la sala
  clients: Set<string>;            // IDs de usuarios en la sala
  createdAt: Date;                 // Cuándo se creó
  lastActivity: Date;              // Última actividad
  metadata?: Record<string, any>;  // Información extra
}
```

**Tipos de salas automáticas:**

| Nombre | Quién | Uso |
|--------|------|-----|
| `cliente_${userId}` | Un cliente específico | Notificar solo a ese cliente |
| `proveedor_${userId}` | Un proveedor específico | Notificar solo a ese proveedor |
| `all_clientes` | Todos los clientes | Enviar a todo cliente |
| `all_proveedores` | Todos los proveedores | Enviar a todo proveedor |
| `admin_dashboard` | Administradores | Solo admins ven el dashboard |
| `service_${serviceId}` | Sala de un servicio | Notificaciones de ese servicio |
| `location_${locationId}` | Sala de una ubicación | Notificaciones de esa ubicación |

**Métodos principales:**

```typescript
// Crear una sala
async createRoom(roomName: string): Promise<Room>

// Unir usuario a sala
async joinRoom(userId: string, roomName: string): Promise<void>

// Sacar usuario de sala
async leaveRoom(userId: string, roomName: string): Promise<void>

// Sacar de todas las salas
async leaveAllRooms(userId: string): Promise<void>

// Obtener todos los usuarios en una sala
getRoomClients(roomName: string): string[]

// Obtener salas de un usuario
getRoomsByUser(userId: string): string[]

// Estadísticas de salas
getRoomStats(): {
  total: number;
  totalClients: number;
  averageClientsPerRoom: number;
  mostActiveRooms: Array<...>;
}

// Limpiar salas vacías
async cleanupEmptyRooms(): Promise<void>
```

**Ejemplo de uso:**

```typescript
// Usuario se conecta
const userId = "user_123";
const role = "cliente";

// Se agrega automáticamente a estas salas
await roomManager.joinRoom(userId, `cliente_${userId}`);      // Sala personal
await roomManager.joinRoom(userId, 'all_clientes');           // Sala general

// Ahora si envías un evento a 'all_clientes', este usuario lo recibe
```

---

### 4.4 `event-emitter.service.ts` - ENVÍO DE EVENTOS

**¿Qué es?** Un servicio que envía mensajes a clientes en salas.

**Ubicación:** `Backend/TypeScript/src/websocket/event-emitter.service.ts`

**Analogía:** Es como un servicio de correo que reparte cartas (eventos) a casas (salas).

```typescript
export interface EventData {
  type: string;                        // Tipo de evento
  data: any;                           // Datos del evento
  from?: string;                       // De quién viene
  timestamp: string;                   // Cuándo pasó
  metadata?: Record<string, any>;      // Información extra
}
```

**Métodos principales:**

```typescript
// Enviar a una sala
async emitToRoom(roomName: string, eventData: EventData): Promise<void>

// Enviar a un usuario específico
async emitToUser(userId: string, eventData: EventData): Promise<void>

// Enviar a todos de un rol
async emitToRole(role: 'cliente' | 'proveedor' | 'admin', eventData: EventData): Promise<void>

// Enviar a todos
async emitToAll(eventData: EventData): Promise<void>

// Enviar al dashboard (sala admin_dashboard)
async emitToDashboard(eventType: string, data: any): Promise<void>
```

**Eventos específicos de negocio:**

```typescript
// Cuando se crea una reserva
async emitReservationCreated(reservation: any): Promise<void>
  // 1. Notifica al proveedor: proveedor_${reservation.proveedorId}
  // 2. Notifica al dashboard: admin_dashboard

// Cuando se acepta una reserva
async emitReservationAccepted(reservation: any): Promise<void>
  // 1. Notifica al cliente: cliente_${reservation.clienteId}
  // 2. Notifica al dashboard

// Cuando se crea un pago
async emitPaymentCreated(payment: any): Promise<void>
  // 1. Notifica al proveedor: proveedor_${payment.proveedorId}
  // 2. Notifica al dashboard

// Cuando se crea un comentario
async emitCommentCreated(comment: any): Promise<void>
  // 1. Notifica al proveedor: proveedor_${comment.proveedorId}
  // 2. Notifica al dashboard
```

**¿Cuándo se usa?**

Cuando algo importante ocurre en Django o Go, se puede hacer una llamada HTTP a este servidor para que notifique a los usuarios conectados.

---

## 5️⃣ CARPETA `dashboard/` - PANEL DE CONTROL

Esta carpeta contiene la lógica para monitorear todo lo que ocurre en el servidor.

---

### 5.1 `dashboard.controller.ts` - API REST DEL DASHBOARD

**¿Qué es?** Los endpoints HTTP que devuelven información del servidor.

**Ubicación:** `Backend/TypeScript/src/dashboard/dashboard.controller.ts`

```typescript
@Controller('api')
export class DashboardController {
  // GET /api -> Datos generales
  @Get()
  getDashboard()

  // GET /api/clients -> Lista de clientes conectados
  @Get('clients')
  getClients()

  // GET /api/rooms -> Lista de salas activas
  @Get('rooms')
  getRooms()

  // GET /api/events -> Historial de eventos
  @Get('events')
  getEvents()

  // GET /api/api-status -> Estado de Django
  @Get('api-status')
  getApiStatus()

  // GET /api/stats -> Estadísticas en tiempo real
  @Get('stats')
  getStats()

  // POST /api/cleanup -> Limpiar datos inactivos
  @Post('cleanup')
  cleanup()

  // POST /api/events/emit -> Recibir eventos de Django
  @Post('events/emit')
  async receiveEventFromDjango(@Body() payload: any)
}
```

**¿Por qué dos controladores?**

Hay `DashboardController` y `DashboardWebController`:
- `DashboardController` = `/api/*` (para APIs)
- `DashboardWebController` = `/dashboard/*` (para la página web)

---

### 5.2 `dashboard.service.ts` - LÓGICA DEL DASHBOARD

**¿Qué es?** La lógica que recopila datos del servidor.

**Ubicación:** `Backend/TypeScript/src/dashboard/dashboard.service.ts`

```typescript
@Injectable()
export class DashboardService {
  // Métricas del servidor
  private metrics = {
    totalConnections: 0,      // Conexiones totales
    activeConnections: 0,     // Conexiones activas ahora
    eventsEmitted: 0,         // Eventos enviados
    roomsCreated: 0,          // Salas creadas
    lastUpdated: new Date(),  // Última actualización
  };

  // Métodos principales:

  // Obtener todos los datos del dashboard
  getDashboardData(): {
    metrics: {...},
    clients: {...},
    rooms: {...},
    system: {...}
  }

  // Obtener detalles de cada cliente conectado
  getClientDetails(): Array<{
    userId: string;
    role: string;
    socketId: string;
    connectedAt: Date;
    lastActivity: Date;
    rooms: string[];
    isActive: boolean;
  }>

  // Obtener detalles de cada sala
  getRoomDetails(): Array<{
    name: string;
    clientsCount: number;
    createdAt: Date;
    lastActivity: Date;
    clients: string[];
  }>

  // Estado de la API de Django
  async getApiIntegrationStatus(): Promise<{
    status: 'connected' | 'disconnected';
    lastCheck: Date;
    httpStatus: number;
  }>

  // Estadísticas en tiempo real
  getRealTimeStats(): {
    timestamp: Date;
    activeConnections: number;
    totalRooms: number;
    eventsPerMinute: number;
    systemLoad: {...}
  }

  // Limpiar conexiones inactivas y salas vacías
  async cleanupMetrics(): Promise<void>
}
```

---

## 6️⃣ CARPETA `services/` - CONEXIÓN CON OTROS BACKENDS

---

### 6.1 `django-api.service.ts` - INTEGRACIÓN CON DJANGO

**¿Qué es?** Un servicio que se comunica con tu API REST de Django.

**Ubicación:** `Backend/TypeScript/src/services/django-api.service.ts`

```typescript
@Injectable()
export class DjangoApiService {
  private readonly apiClient: AxiosInstance;

  constructor() {
    // Crear cliente HTTP hacia Django
    this.apiClient = axios.create({
      baseURL: 'http://127.0.0.1:8000/api_rest/api/v1/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Verificar que un token de Django sea válido
  async verifyToken(token: string): Promise<boolean>

  // Obtener perfil del usuario
  async getUserProfile(token: string): Promise<any>

  // Obtener reservas
  async getReservations(token: string, params?: any): Promise<any[]>

  // Obtener pagos
  async getPayments(token: string, params?: any): Promise<any[]>

  // Obtener comentarios
  async getComments(token: string, params?: any): Promise<any[]>

  // Obtener servicios
  async getServices(token: string, params?: any): Promise<any[]>

  // Obtener proveedores
  async getProviders(token: string, params?: any): Promise<any[]>

  // Obtener clientes
  async getClients(token: string, params?: any): Promise<any[]>

  // Crear nueva reserva
  async createReservation(token: string, reservationData: any): Promise<any>

  // Actualizar reserva
  async updateReservation(token: string, reservationId: number, reservationData: any): Promise<any>

  // Crear pago
  async createPayment(token: string, paymentData: any): Promise<any>

  // Crear comentario
  async createComment(token: string, commentData: any): Promise<any>

  // Sincronizar evento con Django
  async syncWithDjango(eventType: string, data: any): Promise<void>

  // Obtener estadísticas de la API
  async getApiStats(token: string): Promise<{
    reservations: number;
    payments: number;
    comments: number;
    services: number;
    providers: number;
    clients: number;
  }>
}
```

**¿Cuándo se usa?**

1. **Autenticación**: Verificar que el token del usuario sea válido en Django
2. **Obtener datos**: Si necesitas información de Django
3. **Crear datos**: Si necesitas crear reservas, pagos, etc.
4. **Sincronización**: Mantener sincronizado el sistema

---

## 📊 FLUJO COMPLETO: EJEMPLO PRÁCTICO

Veamos qué ocurre cuando un usuario se conecta y ocurre una reserva:

### **Paso 1: Usuario abre el navegador (Frontend)**

```javascript
// En el navegador (Frontend - React)
const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Conectado a WebSocket');
  
  // Autenticarse
  socket.emit('authenticate', {
    token: 'mi_token_de_django',
    userId: 'user_123',
    role: 'cliente'
  });
});
```

---

### **Paso 2: WebSocket recibe la conexión**

```
Frontend (5173)
    │
    └──→ WebSocket (4000)
```

En el servidor TypeScript:

```typescript
// websocket.gateway.ts
async handleConnection(client: AuthenticatedSocket) {
  console.log(`🔌 Cliente conectado: ${client.id}`);
  
  // Notificar al dashboard
  this.eventEmitter.emitToDashboard('client_connected', {...});
}
```

---

### **Paso 3: Cliente se autentica**

El cliente envía:
```javascript
socket.emit('authenticate', {
  token: 'mi_token',
  userId: 'user_123',
  role: 'cliente'
});
```

El servidor:
```typescript
@SubscribeMessage('authenticate')
async handleAuthentication(...) {
  // 1. Verificar token con Django
  const isValid = await this.djangoApi.verifyToken(data.token);
  
  // 2. Registrar cliente
  await this.clientManager.addClient({
    socketId: client.id,
    userId: 'user_123',
    role: 'cliente',
    ...
  });
  
  // 3. Unir a salas
  await this.roomManager.joinRoom('user_123', 'cliente_user_123');
  await this.roomManager.joinRoom('user_123', 'all_clientes');
  
  // 4. Confirmar al cliente
  client.emit('auth_success', {...});
}
```

Ahora el usuario está en 2 salas:
- `cliente_user_123` (sala personal)
- `all_clientes` (sala general de clientes)

---

### **Paso 4: Un proveedor crea una reserva en Django**

El proveedor usa la app y crea una reserva. Django lo guarda en la BD y hace una llamada HTTP al WebSocket:

```bash
POST http://localhost:4000/api/events/emit
{
  "type": "reservation_created",
  "data": {
    "id": 1,
    "clienteId": "user_123",
    "proveedorId": "provider_456",
    "servicioId": "service_789",
    "estado": "pendiente"
  }
}
```

---

### **Paso 5: WebSocket recibe el evento de Django**

```typescript
// dashboard.controller.ts
@Post('events/emit')
async receiveEventFromDjango(@Body() payload: any) {
  // Crear evento
  const eventData = {
    type: payload.type,
    data: payload.data,
    from: 'django_api',
    timestamp: new Date().toISOString(),
  };

  // Enviar a la sala del cliente
  if (payload.data.clienteId) {
    await this.eventEmitter.emitToRoom(
      `cliente_${payload.data.clienteId}`,  // Sala: cliente_user_123
      eventData
    );
  }

  // También enviar al dashboard
  await this.eventEmitter.emitToDashboard('reservation_created', payload.data);
}
```

---

### **Paso 6: El cliente recibe la notificación**

El cliente conectado en el navegador:

```javascript
socket.on('event', (data) => {
  if (data.type === 'reservation_created') {
    console.log('¡Nueva reserva!', data.data);
    // Mostrar notificación al usuario
  }
});
```

---

### **Paso 7: Dashboard muestra la notificación**

El dashboard (página web en `http://localhost:4000/dashboard.html`) actualiza automáticamente:
- Número de reservas
- Nuevos eventos
- Clientes conectados
- Estado del sistema

---

## 🚀 CÓMO EJECUTAR TODO

### 1. Instalar dependencias
```bash
cd Backend/TypeScript
npm install
```

### 2. Iniciar el servidor WebSocket
```bash
npm run start:dev
```

Verás:
```
🚀 Servidor WebSocket corriendo en puerto 4000
📡 Dashboard disponible en http://localhost:4000/dashboard.html
🔌 WebSocket disponible en ws://localhost:4000
```

### 3. Abrir el dashboard
Visita en el navegador:
```
http://localhost:4000/dashboard.html
```

### 4. Ver logs en tiempo real
Verás en la consola:
```
🔌 Cliente conectado: socket_id_1234
✅ Cliente autenticado: user_123 (cliente)
🏠 user_123 se unió a la sala: cliente_user_123
📡 Evento 'reservation_created' enviado a 1/1 clientes en sala 'cliente_user_123'
```

---

## 📝 RESUMEN FINAL

| Carpeta/Archivo | ¿Qué hace? | Importancia |
|---|---|---|
| `main.ts` | Inicia el servidor | ⭐⭐⭐ Crítico |
| `app.module.ts` | Registra componentes | ⭐⭐ Importante |
| `config/config.ts` | Parámetros globales | ⭐ Útil |
| `websocket/websocket.gateway.ts` | Recibe conexiones | ⭐⭐⭐ Crítico |
| `websocket/client-manager.service.ts` | Registra clientes | ⭐⭐⭐ Crítico |
| `websocket/room-manager.service.ts` | Organiza salas | ⭐⭐⭐ Crítico |
| `websocket/event-emitter.service.ts` | Envía mensajes | ⭐⭐⭐ Crítico |
| `dashboard/dashboard.controller.ts` | APIs REST | ⭐⭐ Importante |
| `dashboard/dashboard.service.ts` | Lógica dashboard | ⭐⭐ Importante |
| `services/django-api.service.ts` | Conecta con Django | ⭐⭐ Importante |

---

## ❓ PREGUNTAS FRECUENTES

### ¿Qué pasa si Django no está corriendo?
Verás en el dashboard: `status: 'disconnected'`. El WebSocket sigue funcionando, pero no puede verificar tokens.

### ¿Puedo cambiar el puerto 4000?
Sí, en `main.ts` y `config/config.ts` cambia a otro puerto.

### ¿Cómo agrego un nuevo tipo de evento?
1. En `websocket.gateway.ts`, agrega un nuevo `@SubscribeMessage('mi_evento')`
2. En `event-emitter.service.ts`, agrega un método `async emitMiEvento(...)`
3. En el cliente, escucha con `socket.on('event', ...)`

### ¿Qué es Socket.IO?
Es una librería que simplifica WebSocket. Proporciona conexiones bidireccionales y reconexión automática.

### ¿Por qué necesito TypeScript si tengo Python y Go?
TypeScript es ideal para conexiones en tiempo real porque:
- ✅ Basado en Node.js (evento-driven, muy rápido)
- ✅ Socket.IO es más confiable que WebSocket puro
- ✅ Se comunica fácilmente con APIs REST
- ✅ Manejo robusto de errores

---

**¡Listo! Ahora entiendes toda la carpeta TypeScript! 🎉**

Si tienes preguntas sobre algún archivo específico, pregunta y te lo explico con más detalle.
