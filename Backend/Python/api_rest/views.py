from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import PermissionDenied
from rest_framework import status, viewsets
from . import serializers, models
from django.shortcuts import get_object_or_404
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema


# Create your views here.
@extend_schema(
    request=serializers.UserSerializer,  
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
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username y password son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = models.User.objects.get(username=username)
        except models.User.DoesNotExist:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        user_serialized = self.serializer_class(user)

        return Response({"token": token.key, "user": user_serialized.data}, status=status.HTTP_200_OK)


@extend_schema(
    responses={200: serializers.UserSerializer}  
)
class ProfileView(GenericAPIView):
    serializer_class = serializers.UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        perfil_data = {"user": self.serializer_class(instance=user).data}

        if hasattr(user, "cliente"):
            cliente = user.cliente
            perfil_data.update({
                "id": cliente.id,
                "rol": "cliente",
                "telefono": cliente.telefono,
                "ubicacion": serializers.UbicacionSerializer(cliente.ubicacion).data if cliente.ubicacion else None
            })
        elif hasattr(user, "proveedor"):
            proveedor = user.proveedor
            perfil_data.update({
                "id": proveedor.id, 
                "rol": "proveedor",
                "telefono": proveedor.telefono,
                "descripcion": proveedor.descripcion,
                "ubicacion": serializers.UbicacionSerializer(proveedor.ubicacion).data if proveedor.ubicacion else None
            })
        else:
            perfil_data.update({"rol": None})

        return Response(perfil_data, status=status.HTTP_200_OK)



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

class ServicioViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ServicioSerializer
    queryset = models.Servicio.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Parámetro opcional: solo mostrar los servicios del proveedor conectado
        solo_mios = self.request.query_params.get("solo_mios")

        if solo_mios == "true" and hasattr(user, "proveedor"):
            queryset = queryset.filter(proveedor=user.proveedor)

        # También puedes filtrar por proveedor_id específico si se pasa
        proveedor_id = self.request.query_params.get("proveedor_id")
        if proveedor_id:
            queryset = queryset.filter(proveedor_id=proveedor_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "proveedor"):
            serializer.save(proveedor=user.proveedor)
        else:
            serializer.save()



class ServicioUbicacionView(viewsets.ModelViewSet):
    serializer_class = serializers.ServicioUbicacionSerializer
    queryset = models.ServicioUbicacion.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        servicio_id = self.request.query_params.get("servicio_id")

        if servicio_id:
            queryset = queryset.filter(servicio_id=servicio_id)
            
        return queryset
        

class FotoServicioView(viewsets.ModelViewSet):
    serializer_class = serializers.FotoServicioSerializer
    queryset = models.FotoServicio.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        servicio_id = self.request.query_params.get("servicio_id")

        if servicio_id:
            queryset = queryset.filter(servicio_id=servicio_id)
        
        return queryset

class ReservaView(viewsets.ModelViewSet):
    serializer_class = serializers.ReservaSerializer
    queryset = models.Reserva.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        cliente_id = self.request.query_params.get("cliente_id")

        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "cliente"):
            serializer.save(cliente=user.cliente)
        else:
            serializer.save()


class ReservaServicioView(viewsets.ModelViewSet):
    serializer_class = serializers.ReservaServicioSerializer
    queryset = models.ReservaServicio.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        reserva_id = self.request.query_params.get("reserva_id")

        if reserva_id:
            queryset = queryset.filter(reserva_id=reserva_id)
        
        return queryset

class PagoView(viewsets.ModelViewSet):
    serializer_class = serializers.PagoSerializer
    queryset = models.Pago.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        pago = serializer.save()

        reserva = pago.reserva
        reserva.estado = "confirmada"
        reserva.save()

class ComentarioView(viewsets.ModelViewSet):
    serializer_class = serializers.ComentarioSerializer
    queryset = models.Comentario.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        servicio_id = self.request.query_params.get("servicio_id")
        if servicio_id:
            queryset = queryset.filter(servicio_id=servicio_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "cliente"):
            serializer.save(cliente=user.cliente)
        else:
            serializer.save()

class CalificacionView(viewsets.ModelViewSet):
    serializer_class = serializers.CalificacionSerializer
    queryset = models.Calificacion.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


    def perform_create(self, serializer):
        cliente = self.request.user.cliente  
        serializer.save(cliente=cliente)

    # Endpoint extra opcional para obtener calificaciones por servicio
    @action(detail=False, methods=['get'], url_path='servicio/(?P<servicio_id>[^/.]+)')
    def por_servicio(self, request, servicio_id=None):
        calificaciones = self.queryset.filter(servicio_id=servicio_id)
        serializer = self.get_serializer(calificaciones, many=True)
        return Response(serializer.data)