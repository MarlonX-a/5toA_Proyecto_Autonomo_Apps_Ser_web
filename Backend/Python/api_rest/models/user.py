from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = [
        ('cliente', 'Cliente'),
        ('proveedor', 'Proveedor'),
        ('administrador', 'Administrador'),
    ]
    rol = models.CharField(max_length=20, choices=ROLES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_cliente(self):
        return self.rol == 'cliente'

    def is_proveedor(self):
        return self.rol == 'proveedor'