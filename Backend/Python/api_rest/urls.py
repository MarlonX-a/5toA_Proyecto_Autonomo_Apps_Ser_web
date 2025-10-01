from django.urls import re_path, include, path
from rest_framework import routers
from . import views

routers = routers.DefaultRouter()
routers.register(r'cliente', views.ClienteView, 'cliente')
routers.register(r'proveedor', views.ProveedorView, 'proveedor')
routers.register(r'servicioUbicacion', views.ServicioUbicacionView, 'servicio-Ubicacion')
routers.register(r'ubicacion', views.UbicacionView, 'ubicacion')
routers.register(r'servicio', views.ServicioView, 'servicio')
routers.register(r'reserva', views.ReservaView, 'reserva')
routers.register(r'pago', views.PagoView, 'pago')
routers.register(r'comentario', views.ComentarioView, 'comentario')


urlpatterns = [
    re_path('login/', views.login),
    re_path('register/', views.register),
    re_path('profile/', views.profile),
    path('api/v1/', include(routers.urls)),
 ]