from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api_rest.authentication import JWTAuthentication
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema


@extend_schema(responses={200: dict})
class ProfileView(GenericAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payload = request.jwt_payload

        perfil_data = {
            "id": payload.get("sub"),      # 👈 ID REAL del usuario
            "email": payload.get("email"),
            "rol": payload.get("role"),
        }

        return Response(perfil_data, status=status.HTTP_200_OK)
