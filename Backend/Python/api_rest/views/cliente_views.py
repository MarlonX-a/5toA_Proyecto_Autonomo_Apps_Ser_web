from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from .. import serializers, models
from ..permissions import DashboardReadOnly

class ClienteView(viewsets.ModelViewSet):
    serializer_class = serializers.ClienteSerializer
    queryset = models.Cliente.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [DashboardReadOnly]