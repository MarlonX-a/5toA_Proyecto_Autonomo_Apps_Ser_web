from rest_framework import viewsets
from .. import serializers, models

class CategoriaView(viewsets.ModelViewSet):
    serializer_class = serializers.CategoriaSerializer
    queryset = models.Categoria.objects.all()