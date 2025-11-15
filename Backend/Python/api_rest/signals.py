"""
Django signals para emitir eventos WebSocket cuando hay cambios en el modelo.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from . import models
import requests
import json

# URL del servidor WebSocket NestJS
WEBSOCKET_SERVER_URL = 'http://localhost:4000/api/events/emit'


def notify_websocket(event_type: str, data: dict):
    """Envía una notificación al servidor WebSocket de NestJS."""
    try:
        payload = {
            'type': event_type,
            'data': data,
            'timestamp': str(models.timezone.now()),
        }
        response = requests.post(
            WEBSOCKET_SERVER_URL,
            json=payload,
            timeout=2
        )
        if response.status_code == 200:
            print(f"✅ Evento '{event_type}' enviado a WebSocket: {data}")
        else:
            print(f"⚠️ Error enviando evento: {response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando con WebSocket: {e}")


# ========== RESERVA ==========
@receiver(post_save, sender=models.Reserva)
def reserva_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea o actualiza una reserva."""
    event_type = 'reservation_created' if created else 'reservation_updated'
    data = {
        'id': instance.id,
        'cliente_id': instance.cliente.id,
        'estado': instance.estado,
        'total_estimado': str(instance.total_estimado),
        'fecha_creacion': str(instance.created_at),
    }

    # Obtener el proveedor_id si la reserva tiene servicios
    servicios = models.ReservaServicio.objects.filter(reserva=instance)
    if servicios.exists():
        data['proveedor_id'] = servicios.first().servicio.proveedor.id

    notify_websocket(event_type, data)


@receiver(post_delete, sender=models.Reserva)
def reserva_deleted(sender, instance, **kwargs):
    """Se activa cuando se elimina una reserva."""
    notify_websocket('reservation_deleted', {'id': instance.id})


# ========== PAGO ==========
@receiver(post_save, sender=models.Pago)
def pago_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea un pago."""
    if created:
        event_type = 'payment_created'
        data = {
            'id': instance.id,
            'reserva_id': instance.reserva.id,
            'monto': str(instance.monto),
            'metodo': instance.metodo_pago,
            'fecha': str(instance.fecha_pago),
        }
        
        # Notificar al cliente y proveedor
        if hasattr(instance.reserva, 'cliente'):
            data['cliente_id'] = instance.reserva.cliente.id
        
        servicios = models.ReservaServicio.objects.filter(reserva=instance.reserva)
        if servicios.exists():
            data['proveedor_id'] = servicios.first().servicio.proveedor.id
        
        notify_websocket(event_type, data)
    """Se activa cuando se crea o actualiza un pago."""
    event_type = 'payment_created' if created else 'payment_updated'
    data = {
        'id': instance.id,
        'reserva_id': instance.reserva.id,
        'monto': str(instance.monto),
        'metodo': instance.metodo_pago,
        'fecha': str(instance.fecha_pago),
        'estado': instance.estado,  # Incluir estado del pago
    }
    
    # Notificar al cliente y proveedor
    if hasattr(instance.reserva, 'cliente'):
        data['cliente_id'] = instance.reserva.cliente.id
    
    servicios = models.ReservaServicio.objects.filter(reserva=instance.reserva)
    if servicios.exists():
        data['proveedor_id'] = servicios.first().servicio.proveedor.id
    
    notify_websocket(event_type, data)


# ========== COMENTARIO ==========
@receiver(post_save, sender=models.Comentario)
def comentario_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea un comentario."""
    if created:
        data = {
            'id': instance.id,
            'servicio_id': instance.servicio.id,
            'cliente_id': instance.cliente.id,
            'titulo': instance.titulo,
            'texto': instance.texto,
        }

        # Notificar al proveedor del servicio
        if hasattr(instance.servicio, 'proveedor'):
            data['proveedor_id'] = instance.servicio.proveedor.id

        notify_websocket('comment_created', data)


# ========== CALIFICACIÓN ==========
@receiver(post_save, sender=models.Calificacion)
def calificacion_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea una calificación."""
    if created:
        data = {
            'id': instance.id,
            'servicio_id': instance.servicio.id,
            'cliente_id': instance.cliente.id,
            'puntuacion': instance.puntuacion,
        }

        # Notificar al proveedor del servicio
        if hasattr(instance.servicio, 'proveedor'):
            data['proveedor_id'] = instance.servicio.proveedor.id

        notify_websocket('rating_created', data)


# ========== SERVICIO ==========
@receiver(post_save, sender=models.Servicio)
def servicio_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea o actualiza un servicio."""
    event_type = 'service_created' if created else 'service_updated'
    data = {
        'id': instance.id,
        'nombre': instance.nombre_servicio,
        'proveedor_id': instance.proveedor.id,
        'precio': str(instance.precio),
    }
    notify_websocket(event_type, data)
