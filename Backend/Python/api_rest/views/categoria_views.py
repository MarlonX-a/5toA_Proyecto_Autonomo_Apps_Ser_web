from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from .. import serializers, models
from ..permissions import DashboardReadOnly

class CategoriaView(viewsets.ModelViewSet):
    serializer_class = serializers.CategoriaSerializer
    queryset = models.Categoria.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [DashboardReadOnly]