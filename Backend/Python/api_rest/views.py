from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status, viewsets
from . import serializers, models
from django.shortcuts import get_object_or_404
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema

# Create your views here.
@extend_schema(
    request=serializers.UserSerializer,  # ejemplo genérico
    responses={201: serializers.UserSerializer}
)
class RegisterView(GenericAPIView):
    serializer_class = serializers.UserSerializer

    def post(self, request):
        data = request.data
        rol = data.get('rol', '').lower()

        if rol == "cliente":
            serializer_class = serializers.ClienteSerializer
        elif rol == "proveedor":
            serializer_class = serializers.ProveedorSerializer
        else:
            return Response(
                {"error": "Rol inválido. Solo se acepta 'cliente' o 'proveedor'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = serializer_class(data=data, context={'rol': rol})
        if serializer.is_valid():
            instance = serializer.save()
            token = Token.objects.create(user=instance.user)
            return Response(
                {"token": token.key, "user": serializer.data}, 
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@extend_schema(
    request=serializers.UserSerializer,
    responses={200: serializers.UserSerializer}
)
class LoginView(GenericAPIView):
    serializer_class = serializers.UserSerializer

    def post(self, request):
        user = get_object_or_404(models.User, username=request.data.get('username'))

        if not user.check_password(request.data.get('password')):
            return Response({"error": "Credenciales inválidadas"}, status=status.HTTP_400_BAD_REQUEST)
        token, created = Token.objects.get_or_create(user=user)
        serializers = self.serializer_class(instance=user)
        return Response({"token": token.key, "user": serializers.data}, status=status.HTTP_200_OK)


@extend_schema(
    responses={200: serializers.UserSerializer}
    )
class ProfileView(GenericAPIView):
    serializers_class = serializers.UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializers = self.serializers_class(instance=request.user)
        return Response({"user": serializers.data}, status=status.HTTP_200_OK)



class UbicacionView(viewsets.ModelViewSet):
    serializer_class = serializers.UbicacionSerializer
    queryset = models.Ubicacion.objects.all()


class ClienteView(viewsets.ModelViewSet):
    serializer_class = serializers.ClienteSerializer
    queryset = models.Cliente.objects.all()


class ProveedorView(viewsets.ModelViewSet):
    serializer_class = serializers.ProveedorSerializer
    queryset = models.Proveedor.objects.all()

class CategoriaView(viewsets.ModelViewSet):
    serializer_class = serializers.CategoriaSerializer
    queryset = models.Categoria.objects.all()

class ServicioView(viewsets.ModelViewSet):
    serializer_class = serializers.ServicioSerializer
    queryset = models.Servicio.objects.all()

class ServicioUbicacionView(viewsets.ModelViewSet):
    serializer_class = serializers.ServicioUbicacionSerializer
    queryset = models.ServicioUbicacion.objects.all()

class FotoServicioView(viewsets.ModelViewSet):
    serializer_class = serializers.FotoServicio
    queryset = models.FotoServicio.objects.all()

class ReservaView(viewsets.ModelViewSet):
    serializer_class = serializers.ReservaSerializer
    queryset = models.Reserva.objects.all()

class ReservaServicioView(viewsets.ModelViewSet):
    serializer_class = serializers.ReservaServicioSerializer
    queryset = models.ReservaServicio.objects.all()

class PagoView(viewsets.ModelViewSet):
    serializer_class = serializers.PagoSerializer
    queryset = models.Pago.objects.all()

class ComentarioView(viewsets.ModelViewSet):
    serializer_class = serializers.ComentarioSerializer
    queryset = models.Comentario.objects.all()

class CalificacionView(viewsets.ModelViewSet):
    serializer_class = serializers.CalificacionSerializer
    queryset = models.Calificacion.objects.all()