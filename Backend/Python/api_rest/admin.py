from django.contrib import admin
from .models import (
    Categoria, Cliente, Proveedor, Servicio, Reserva, ReservaServicio,
    Pago, Calificacion, Comentario, Ubicacion, ServicioUbicacion, FotoServicio,
)
from .models.partner import Partner, WebhookSubscription, WebhookDelivery, WebhookEventLog
from .models.payment_transaction import PaymentTransaction


# ============================================================================
# ADMIN PARA MODELOS EXISTENTES
# ============================================================================

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre_categoria', 'descripcion']
    search_fields = ['nombre_categoria']


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'telefono', 'pais', 'created_at']
    search_fields = ['user__username', 'user__email', 'telefono']
    list_filter = ['pais', 'created_at']


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'nombre_empresa', 'ruc', 'telefono', 'verificado']
    search_fields = ['nombre_empresa', 'ruc', 'user__email']
    list_filter = ['verificado', 'created_at']


@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre_servicio', 'proveedor', 'categoria', 'precio', 'created_at']
    search_fields = ['nombre_servicio', 'proveedor__nombre_empresa']
    list_filter = ['categoria', 'created_at']


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ['id', 'cliente', 'fecha', 'hora', 'estado', 'total_estimado', 'created_at']
    search_fields = ['cliente__user__username']
    list_filter = ['estado', 'fecha', 'created_at']


@admin.register(ReservaServicio)
class ReservaServicioAdmin(admin.ModelAdmin):
    list_display = ['id', 'reserva', 'servicio', 'cantidad', 'precio_unitario', 'subtotal']
    search_fields = ['reserva__id', 'servicio__nombre_servicio']


@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ['id', 'reserva', 'monto', 'metodo_pago', 'estado', 'fecha_pago']
    search_fields = ['reserva__id', 'referencia']
    list_filter = ['estado', 'metodo_pago', 'fecha_pago']


@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = ['id', 'servicio', 'cliente', 'puntuacion', 'created_at']
    list_filter = ['puntuacion', 'created_at']


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ['id', 'servicio', 'cliente', 'titulo', 'created_at']
    search_fields = ['titulo', 'texto']


# ============================================================================
# PILAR 2: ADMIN PARA WEBHOOKS B2B
# ============================================================================

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'email_contacto', 'estado', 'total_webhooks_enviados', 'created_at']
    search_fields = ['nombre', 'email_contacto']
    list_filter = ['estado', 'created_at']
    readonly_fields = ['api_key', 'created_at', 'updated_at', 'last_webhook_at']
    
    fieldsets = (
        ('Información del Partner', {
            'fields': ('nombre', 'email_contacto', 'descripcion', 'estado')
        }),
        ('Configuración de Webhook', {
            'fields': ('webhook_url', 'webhook_secret')
        }),
        ('Credenciales (Solo lectura)', {
            'fields': ('api_key',),
            'classes': ('collapse',)
        }),
        ('Estadísticas', {
            'fields': ('last_webhook_at',),
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WebhookSubscription)
class WebhookSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'partner', 'evento', 'activo', 'created_at']
    search_fields = ['partner__nombre', 'evento']
    list_filter = ['evento', 'activo', 'created_at']


@admin.register(WebhookDelivery)
class WebhookDeliveryAdmin(admin.ModelAdmin):
    list_display = ['id', 'partner', 'evento', 'estado', 'status_code', 'intentos', 'created_at']
    search_fields = ['partner__nombre', 'evento', 'event_id']
    list_filter = ['estado', 'evento', 'created_at']
    readonly_fields = ['event_id', 'payload', 'response_body', 'created_at']


@admin.register(WebhookEventLog)
class WebhookEventLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'event_type', 'source', 'processed', 'created_at']
    search_fields = ['event_type', 'event_id']
    list_filter = ['event_type', 'processed', 'source', 'created_at']
    readonly_fields = ['event_id', 'payload', 'created_at']


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'reserva', 'gateway', 'status', 'amount', 'currency', 'created_at']
    search_fields = ['transaction_id', 'external_id', 'reserva__id']
    list_filter = ['gateway', 'status', 'created_at']
    readonly_fields = ['transaction_id', 'external_id', 'created_at', 'updated_at']
