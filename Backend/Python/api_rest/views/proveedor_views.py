from rest_framework import viewsets
from api_rest.authentication import JWTAuthentication
from .. import serializers, models
from ..permissions import DashboardReadOnly

class ProveedorView(viewsets.ModelViewSet):
    serializer_class = serializers.ProveedorSerializer
    queryset = models.Proveedor.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [DashboardReadOnly]