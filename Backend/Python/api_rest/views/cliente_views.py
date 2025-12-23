from rest_framework import viewsets
from api_rest.authentication import JWTAuthentication
from rest_framework.authentication import TokenAuthentication
from .. import serializers, models
from ..permissions import DashboardReadOnly

class ClienteView(viewsets.ModelViewSet):
    serializer_class = serializers.ClienteSerializer
    queryset = models.Cliente.objects.all()
    authentication_classes = [JWTAuthentication, TokenAuthentication]
    permission_classes = [DashboardReadOnly]