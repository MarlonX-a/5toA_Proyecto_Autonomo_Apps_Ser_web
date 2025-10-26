from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from decimal import Decimal

class User(AbstractUser):
    ROLES = [
        ('cliente', 'Cliente'),
        ('proveedor', 'Proveedor'),
    ]
    rol = models.CharField(max_length=20, choices=ROLES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_cliente(self):
        return self.rol == 'cliente'

    def is_proveedor(self):
        return self.rol == 'proveedor'


class Ubicacion(models.Model):
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100)
    pais = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.direccion}, {self.ciudad}, {self.provincia}, {self.pais}"


class Cliente(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cliente")
    telefono = models.CharField(max_length=50)
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True, related_name="clientes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}"


class Proveedor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="proveedor")
    telefono = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True, related_name="proveedores")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}"


class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre


class Servicio(models.Model):
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name="servicios")
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name="servicios")
    nombre_servicio = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    duracion = models.DurationField(blank=True, null=True)
    rating_promedio = models.FloatField(default=0)
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    ubicaciones = models.ManyToManyField(Ubicacion, through='ServicioUbicacion', related_name="servicios")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre_servicio


class ServicioUbicacion(models.Model):
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, related_name="servicio_ubicaciones")
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.CASCADE, related_name="servicio_ubicaciones")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('servicio', 'ubicacion')


class FotoServicio(models.Model):
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, related_name="fotos")
    url_foto = models.URLField(max_length=300)
    descripcion = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Foto de {self.servicio.nombre_servicio}"


class Reserva(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
    ]
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="reservas")
    fecha = models.DateField()
    hora = models.TimeField()
    estado = models.CharField(max_length=50, choices=ESTADOS)
    total_estimado = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reserva {self.id} - {self.cliente}"


class ReservaServicio(models.Model):
    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name="detalles")
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, related_name="detalles_reserva")
    fecha_servicio = models.DateField(default=timezone.now)
    hora_servicio = models.TimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.cantidad} x {self.servicio.nombre_servicio}"


class Pago(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('rechazado', 'Rechazado'),
    ]
    METODOS = [
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('transferencia', 'Transferencia'),
    ]
    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name="pagos")
    metodo_pago = models.CharField(max_length=50, choices=METODOS)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=50, choices=ESTADOS)
    referencia = models.CharField(max_length=100, blank=True, null=True)
    fecha_pago = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pago {self.id} - {self.estado}"


class Calificacion(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="calificaciones")
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, related_name="calificaciones")
    fecha = models.DateTimeField(auto_now_add=True)
    puntuacion = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['cliente', 'servicio'], name='unique_calificacion')
        ]

    def save(self, *args, **kwargs):
        if not 1 <= self.puntuacion <= 5:
            raise ValueError("La puntuación debe estar entre 1 y 5")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.servicio.nombre_servicio} - {self.puntuacion}/5"


class Comentario(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="comentarios")
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, related_name="comentarios")
    titulo = models.CharField(max_length=200)
    texto = models.TextField()
    respuesta = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titulo} - {self.cliente.user.username}"
