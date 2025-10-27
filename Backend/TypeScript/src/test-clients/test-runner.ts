import { createTestClients, createClient } from './websocket-client';

console.log('🚀 Iniciando pruebas del WebSocket...');

// Crear clientes de prueba
const clients = createTestClients();

console.log(`✅ ${clients.length} clientes creados`);

// Crear un cliente adicional para pruebas manuales
const testClient = createClient('test_user', 'cliente', 'test_token');

// Ejemplo de uso manual después de 10 segundos
setTimeout(() => {
  console.log('📝 Ejecutando pruebas manuales...');
  
  // Crear una reserva manual
  testClient.createReservation({
    clienteId: 'test_user',
    proveedorId: 'proveedor_1',
    servicioId: 'servicio_1',
    fecha: new Date().toISOString(),
    estado: 'pendiente',
  });

  // Unirse a una sala específica
  testClient.joinRoom('test_room');

  // Crear un comentario
  setTimeout(() => {
    testClient.createComment({
      clienteId: 'test_user',
      proveedorId: 'proveedor_1',
      servicioId: 'servicio_1',
      texto: 'Este es un comentario de prueba',
    });
  }, 5000);

}, 10000);

// Manejar cierre del proceso
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando todas las conexiones...');
    clients.forEach((client: any) => client.disconnect());
  testClient.disconnect();
  process.exit(0);
});

console.log('💡 Presiona Ctrl+C para cerrar todas las conexiones');
console.log('📊 Visita http://localhost:4000/dashboard para ver el dashboard');
