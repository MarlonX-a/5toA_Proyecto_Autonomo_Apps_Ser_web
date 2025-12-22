from rest_framework import viewsets
from api_rest.authentication import JWTAuthentication
from .. import serializers, models
from ..permissions import DashboardReadOnly

class ClienteView(viewsets.ModelViewSet):
    serializer_class = serializers.ClienteSerializer
    queryset = models.Cliente.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [DashboardReadOnly]