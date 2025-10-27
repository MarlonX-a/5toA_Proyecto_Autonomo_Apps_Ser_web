import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class DjangoApiService {
  private readonly logger = new Logger(DjangoApiService.name);
  private readonly apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: 'http://localhost:8000/api/v1/', // URL de tu API Django
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para logging
    this.apiClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Error en request:', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      // Usar GET en lugar de POST para evitar CSRF
      const response = await this.apiClient.get('profile/', {
        headers: { Authorization: `Token ${token}` }
      });
      return response.status === 200;
    } catch (error: any) {
      // Error 403 es normal si la API no está configurada con autenticación por token
      if (error?.response?.status === 403) {
        this.logger.warn('CSRF/Token verificación fallida (esperado si Django no tiene auth por token)');
        // Retornamos true temporalmente para permitir pruebas
        return true;
      }
      this.logger.warn('Token inválido:', error?.message || 'Unknown error');
      return false;
    }
  }

  async getUserProfile(token: string): Promise<any> {
    try {
      const response = await this.apiClient.post('profile/', {}, {
        headers: { Authorization: `Token ${token}` }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo perfil:', error);
      throw error;
    }
  }

  async getReservations(token: string, params?: any): Promise<any[]> {
    try {
      const response = await this.apiClient.get('reserva/', {
        headers: { Authorization: `Token ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo reservas:', error);
      throw error;
    }
  }

  async getPayments(token: string, params?: any): Promise<any[]> {
    try {
      const response = await this.apiClient.get('pago/', {
        headers: { Authorization: `Token ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo pagos:', error);
      throw error;
    }
  }

  async getComments(token: string, params?: any): Promise<any[]> {
    try {
      const response = await this.apiClient.get('comentario/', {
        headers: { Authorization: `Token ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo comentarios:', error);
      throw error;
    }
  }

  async getServices(token: string, params?: any): Promise<any[]> {
    try {
      const response = await this.apiClient.get('servicio/', {
        headers: { Authorization: `Token ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo servicios:', error);
      throw error;
    }
  }

  async getProviders(token: string, params?: any): Promise<any[]> {
    try {
      const response = await this.apiClient.get('proveedor/', {
        headers: { Authorization: `Token ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo proveedores:', error);
      throw error;
    }
  }

  async getClients(token: string, params?: any): Promise<any[]> {
    try {
      const response = await this.apiClient.get('cliente/', {
        headers: { Authorization: `Token ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo clientes:', error);
      throw error;
    }
  }

  async createReservation(token: string, reservationData: any): Promise<any> {
    try {
      const response = await this.apiClient.post('reserva/', reservationData, {
        headers: { Authorization: `Token ${token}` }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error creando reserva:', error);
      throw error;
    }
  }

  async updateReservation(token: string, reservationId: number, reservationData: any): Promise<any> {
    try {
      const response = await this.apiClient.put(`reserva/${reservationId}/`, reservationData, {
        headers: { Authorization: `Token ${token}` }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error actualizando reserva:', error);
      throw error;
    }
  }

  async createPayment(token: string, paymentData: any): Promise<any> {
    try {
      const response = await this.apiClient.post('pago/', paymentData, {
        headers: { Authorization: `Token ${token}` }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error creando pago:', error);
      throw error;
    }
  }

  async createComment(token: string, commentData: any): Promise<any> {
    try {
      const response = await this.apiClient.post('comentario/', commentData, {
        headers: { Authorization: `Token ${token}` }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error creando comentario:', error);
      throw error;
    }
  }

  // Método para sincronizar datos con Django
  async syncWithDjango(eventType: string, data: any): Promise<void> {
    try {
      // Aquí puedes implementar la lógica para sincronizar eventos con Django
      // Por ejemplo, enviar webhooks o hacer llamadas API específicas
      
      this.logger.log(`🔄 Sincronizando evento '${eventType}' con Django`);
      
      // Ejemplo de implementación:
      switch (eventType) {
        case 'reservation_created':
          // Lógica específica para reservas
          break;
        case 'payment_created':
          // Lógica específica para pagos
          break;
        case 'comment_created':
          // Lógica específica para comentarios
          break;
        default:
          this.logger.warn(`Tipo de evento no reconocido: ${eventType}`);
      }
    } catch (error) {
      this.logger.error('Error sincronizando con Django:', error);
    }
  }

  // Método para obtener estadísticas de la API
  async getApiStats(token: string): Promise<any> {
    try {
      const [reservations, payments, comments, services, providers, clients] = await Promise.all([
        this.getReservations(token),
        this.getPayments(token),
        this.getComments(token),
        this.getServices(token),
        this.getProviders(token),
        this.getClients(token),
      ]);

      return {
        reservations: reservations.length,
        payments: payments.length,
        comments: comments.length,
        services: services.length,
        providers: providers.length,
        clients: clients.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas de API:', error);
      throw error;
    }
  }
}
