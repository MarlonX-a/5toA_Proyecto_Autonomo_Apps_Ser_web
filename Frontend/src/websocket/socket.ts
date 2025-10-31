import { io, Socket } from 'socket.io-client';

// Singleton socket instance
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}

export function authenticateSocket(params: { token: string; userId: string; role: 'cliente' | 'proveedor' | 'admin' }): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = getSocket();

    const onSuccess = () => {
      s.off('auth_success', onSuccess);
      s.off('auth_error', onError);
      resolve();
    };
    const onError = (payload: any) => {
      s.off('auth_success', onSuccess);
      s.off('auth_error', onError);
      reject(new Error(payload?.message || 'auth_error'));
    };

    s.once('auth_success', onSuccess);
    s.once('auth_error', onError);
    s.emit('authenticate', params);
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}


