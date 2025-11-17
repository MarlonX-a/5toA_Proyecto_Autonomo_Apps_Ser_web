from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from .. import serializers, models
from ..permissions import DashboardReadOnly

class ProveedorView(viewsets.ModelViewSet):
    serializer_class = serializers.ProveedorSerializer
    queryset = models.Proveedor.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [DashboardReadOnly]