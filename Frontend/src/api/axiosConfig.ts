import axios from 'axios';

/**
 * Crea una instancia de axios configurada para acceso a la API
 * GET (lectura): acceso público sin autenticación
 * POST/PUT/PATCH/DELETE: requiere token
 */
export function createApiClient(baseURL: string, authScheme: 'Bearer' | 'Token' | 'None' = 'Bearer') {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Agregar token si existe en localStorage
  instance.interceptors.request.use((config) => {
    if (authScheme === 'None') return config;
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) config.headers = {} as any;
      const headerValue = authScheme === 'Token' ? `Token ${token}` : `Bearer ${token}`;
      config.headers.Authorization = headerValue;
    }
    return config;
  });

  return instance;
}
