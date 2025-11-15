from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .. import serializers
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema


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