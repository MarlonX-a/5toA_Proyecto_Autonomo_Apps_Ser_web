from django.urls import re_path, include, path
from rest_framework import routers
from . import views

routers = routers.DefaultRouter()
routers.register(r'ubicacion', views.UbicacionView, 'ubicacion')
routers.register(r'cliente', views.ClienteView, 'cliente')
routers.register(r'proveedor', views.ProveedorView, 'proveedor')
routers.register(r'categoria', views.CategoriaView, 'categoria')
routers.register(r'servicio', views.ServicioView, 'servicio')
routers.register(r'servicioUbicacion', views.ServicioUbicacionView, 'servicio-Ubicacion')
routers.register(r'fotoServicio', views.FotoServicioView, 'foto-servicio')
routers.register(r'reserva', views.ReservaView, 'reserva')
routers.register(r'reservaServicio', views.ReservaServicioView, 'reserva-servicio')
routers.register(r'pago', views.PagoView, 'pago')
routers.register(r'comentario', views.ComentarioView, 'comentario')
routers.register(r'calificacion', views.CalificacionView, 'calificacion')


urlpatterns = [
    re_path('login/', views.LoginView.as_view()),
    re_path('register/', views.RegisterView.as_view()),
    re_path('profile/', views.ProfileView.as_view()),
    path('api/v1/', include(routers.urls)),
 ]