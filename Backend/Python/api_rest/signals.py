"""
Django signals para emitir eventos WebSocket Y al Event Bus (n8n).
==================================================================
Pilar 4: n8n - Event Bus

Todos los cambios en modelos críticos emiten:
1. Evento a WebSocket (tiempo real para frontend)
2. Evento a n8n Event Bus (procesamiento externo)
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from . import models
import requests
import json
import logging

logger = logging.getLogger(__name__)

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
            logger.info(f"✅ Evento '{event_type}' enviado a WebSocket: {data.get('id', 'N/A')}")
        else:
            logger.warning(f"⚠️ Error enviando evento WebSocket: {response.status_code}")
    except requests.exceptions.ConnectionError:
        logger.debug(f"WebSocket server no disponible para: {event_type}")
    except Exception as e:
        logger.error(f"❌ Error conectando con WebSocket: {e}")


def notify_event_bus(event_type: str, data: dict):
    """
    Envía evento al Event Bus (n8n) para procesamiento externo.
    Los eventos se procesan de forma asíncrona en n8n.
    """
    try:
        from .services.event_bus import event_bus
        
        # Mapear tipo de evento a método del event_bus
        event_mapping = {
            'reservation_created': lambda d: event_bus.emit_reserva_created(d),
            'reservation_updated': lambda d: event_bus.emit_reserva_updated(d),
            'reservation_deleted': lambda d: event_bus.emit_reserva_cancelled(d),
            'payment_created': lambda d: event_bus.emit_payment_confirmed(d),
            'payment_updated': lambda d: event_bus.emit_payment_confirmed(d),
            'service_created': lambda d: event_bus.emit_servicio_created(d),
            'service_updated': lambda d: event_bus.emit_servicio_updated(d),
            'rating_created': lambda d: event_bus.emit_review_created(d),
            'comment_created': lambda d: event_bus.emit_review_created(d),
        }
        
        if event_type in event_mapping:
            event_mapping[event_type](data)
            logger.debug(f"📤 Evento '{event_type}' enviado a Event Bus")
        else:
            # Para eventos no mapeados, usar business-events genérico
            event_bus._send_to_n8n('business-events', {
                'event_type': event_type,
                'data': data
            }, async_mode=True)
            
    except ImportError:
        logger.debug("Event Bus no disponible (servicio no importado)")
    except Exception as e:
        logger.error(f"❌ Error enviando a Event Bus: {e}")


def serialize_decimal(value):
    """Convierte Decimal a string para serialización JSON."""
    if hasattr(value, '__str__'):
        return str(value)
    return value


# ========== RESERVA ==========
@receiver(post_save, sender=models.Reserva)
def reserva_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea o actualiza una reserva."""
    event_type = 'reservation_created' if created else 'reservation_updated'
    
    data = {
        'id': instance.id,
        'cliente_id': instance.cliente.id,
        'cliente_email': getattr(instance.cliente, 'email', None),
        'estado': instance.estado,
        'total_estimado': serialize_decimal(instance.total_estimado),
        'fecha_creacion': str(instance.created_at),
    }

    # Obtener el proveedor_id si la reserva tiene servicios
    servicios = models.ReservaServicio.objects.filter(reserva=instance)
    if servicios.exists():
        primer_servicio = servicios.first()
        data['proveedor_id'] = primer_servicio.servicio.proveedor.id
        data['servicio_nombre'] = primer_servicio.servicio.nombre_servicio

    # Notificar WebSocket (tiempo real)
    notify_websocket(event_type, data)
    
    # Notificar Event Bus (procesamiento externo)
    notify_event_bus(event_type, data)


@receiver(post_delete, sender=models.Reserva)
def reserva_deleted(sender, instance, **kwargs):
    """Se activa cuando se elimina una reserva."""
    data = {
        'id': instance.id,
        'cliente_id': instance.cliente.id if instance.cliente else None,
        'estado': 'deleted'
    }
    
    notify_websocket('reservation_deleted', data)
    notify_event_bus('reservation_deleted', data)


# ========== PAGO ==========
@receiver(post_save, sender=models.Pago)
def pago_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea o actualiza un pago."""
    event_type = 'payment_created' if created else 'payment_updated'
    
    data = {
        'id': instance.id,
        'reserva_id': instance.reserva.id,
        'monto': serialize_decimal(instance.monto),
        'metodo': instance.metodo_pago,
        'fecha': str(instance.fecha_pago),
        'estado': getattr(instance, 'estado', 'completed'),
    }
    
    # Notificar al cliente y proveedor
    if hasattr(instance.reserva, 'cliente'):
        data['cliente_id'] = instance.reserva.cliente.id
        data['cliente_email'] = getattr(instance.reserva.cliente, 'email', None)
    
    servicios = models.ReservaServicio.objects.filter(reserva=instance.reserva)
    if servicios.exists():
        data['proveedor_id'] = servicios.first().servicio.proveedor.id
    
    # Notificar WebSocket
    notify_websocket(event_type, data)
    
    # Notificar Event Bus - importante para procesamiento de pagos
    notify_event_bus(event_type, data)


# ========== COMENTARIO ==========
@receiver(post_save, sender=models.Comentario)
def comentario_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea un comentario."""
    if created:
        data = {
            'id': instance.id,
            'servicio_id': instance.servicio.id,
            'servicio_nombre': instance.servicio.nombre_servicio,
            'cliente_id': instance.cliente.id,
            'titulo': instance.titulo,
            'texto': instance.texto,
            'type': 'comment'
        }

        # Notificar al proveedor del servicio
        if hasattr(instance.servicio, 'proveedor'):
            data['proveedor_id'] = instance.servicio.proveedor.id

        notify_websocket('comment_created', data)
        notify_event_bus('comment_created', data)


# ========== CALIFICACIÓN ==========
@receiver(post_save, sender=models.Calificacion)
def calificacion_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea una calificación."""
    if created:
        data = {
            'id': instance.id,
            'servicio_id': instance.servicio.id,
            'servicio_nombre': instance.servicio.nombre_servicio,
            'cliente_id': instance.cliente.id,
            'puntuacion': instance.puntuacion,
            'type': 'rating'
        }

        # Notificar al proveedor del servicio
        if hasattr(instance.servicio, 'proveedor'):
            data['proveedor_id'] = instance.servicio.proveedor.id

        notify_websocket('rating_created', data)
        notify_event_bus('rating_created', data)


# ========== SERVICIO ==========
@receiver(post_save, sender=models.Servicio)
def servicio_saved(sender, instance, created, **kwargs):
    """Se activa cuando se crea o actualiza un servicio."""
    event_type = 'service_created' if created else 'service_updated'
    
    data = {
        'id': instance.id,
        'nombre': instance.nombre_servicio,
        'proveedor_id': instance.proveedor.id,
        'precio': serialize_decimal(instance.precio),
        'duracion': str(instance.duracion) if instance.duracion else None,
        'categoria_id': instance.categoria_id if hasattr(instance, 'categoria_id') else None,
    }
    
    notify_websocket(event_type, data)
    notify_event_bus(event_type, data)


@receiver(post_delete, sender=models.Servicio)
def servicio_deleted(sender, instance, **kwargs):
    """Se activa cuando se elimina un servicio."""
    data = {
        'id': instance.id,
        'nombre': instance.nombre_servicio,
        'proveedor_id': instance.proveedor.id if instance.proveedor else None,
    }
    
    notify_websocket('service_deleted', data)
