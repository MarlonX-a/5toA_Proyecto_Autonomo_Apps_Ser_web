from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status, viewsets
from . import serializers
from . import models
from django.shortcuts import get_object_or_404

# Create your views here.

@api_view(['POST'])
def register(request):
    data = request.data
    rol = data.get('rol', '').lower() 

    if rol == 'cliente':
        serializer_class = serializers.ClienteSerializer
    elif rol == 'proveedor':
        serializer_class = serializers.ProveedorSerializer
    else:
        return Response({'error': 'Rol inválido. Debe ser "cliente" o "proveedor".'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = serializer_class(data=data)
    if serializer.is_valid():

        user_data = data.get('user')
        password = user_data.pop('password', None)
        user = models.User.objects.create(**user_data, rol=rol)
        if password:
            user.set_password(password)
            user.save()


        if rol == 'cliente':
            ubicacion_data = data.get('ubicacion', None)
            ubicacion = models.Ubicacion.objects.create(**ubicacion_data) if ubicacion_data else None
            cliente = models.Cliente.objects.create(user=user, telefono=data.get('telefono'), ubicacion=ubicacion)
        else:
            ubicacion_data = data.get('ubicacion', None)
            ubicacion = models.Ubicacion.objects.create(**ubicacion_data) if ubicacion_data else None
            proveedor = models.Proveedor.objects.create(user=user, telefono=data.get('telefono'), descripcion=data.get('descripcion'), ubicacion=ubicacion)

        token = Token.objects.create(user=user)
        return Response({'token': token.key, "user": serializer.data}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login(request):

    user = get_object_or_404(models.User, username=request.data['username'])

    if not user.check_password(request.data['password']):
        return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
    
    token, created = Token.objects.get_or_create(user=user)
    serializer = serializers.UserSerializer(instance=user)
    return Response({"token": token.key, "user": serializer.data}, status=status.HTTP_200_OK)

#Ejemplo de vista protegida
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):

    serializer = serializers.UserSerializer(instance=request.user)

    return Response({"user": serializer.data}, status=status.HTTP_200_OK)



class UbicacionView(viewsets.ModelViewSet):
    serializer_class = serializers.UbicacionSerializer
    queryset = models.Ubicacion.objects.all()


class ClienteView(viewsets.ModelViewSet):
    serializer_class = serializers.ClienteSerializer
    queryset = models.Cliente.objects.all()


class ProveedorView(viewsets.ModelViewSet):
    serializer_class = serializers.ProveedorSerializer
    queryset = models.Proveedor.objects.all()

class ServicioUbicacionView(viewsets.ModelViewSet):
    serializer_class = serializers.ServicioUbicacionSerializer
    queryset = models.ServicioUbicacion.objects.all()

class ServicioView(viewsets.ModelViewSet):
    serializer_class = serializers.ServicioSerializer
    queryset = models.Servicio.objects.all()

class ReservaView(viewsets.ModelViewSet):
    serializer_class = serializers.ReservaSerializer
    queryset = models.Reserva.objects.all()

class PagoView(viewsets.ModelViewSet):
    serializer_class = serializers.PagoSerializer
    queryset = models.Pago.objects.all()

class ComentarioView(viewsets.ModelViewSet):
    serializer_class = serializers.ComentarioSerializer
    queryset = models.Comentario.objects.all()
