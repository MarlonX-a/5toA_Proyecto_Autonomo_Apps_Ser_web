from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from .. import serializers, models
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema


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