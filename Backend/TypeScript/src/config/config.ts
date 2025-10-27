export const config = {
  // Configuración del servidor WebSocket
  websocket: {
    port: 4000,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:8000'],
      credentials: true,
    },
  },

  // Configuración de la API de Django
  django: {
    baseUrl: 'http://localhost:8000/api/v1/',
    timeout: 10000,
  },

  // Configuración del dashboard
  dashboard: {
    refreshInterval: 5000, // 5 segundos
    cleanupInterval: 300000, // 5 minutos
  },

  // Configuración de limpieza automática
  cleanup: {
    inactiveClientTimeout: 60, // minutos
    emptyRoomCleanup: true,
    metricsResetInterval: 3600000, // 1 hora
  },

  // Configuración de logging
  logging: {
    level: 'debug',
    enableWebSocketLogs: true,
    enableApiLogs: true,
  },
};
