from rest_framework import viewsets
from .. import serializers, models
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

class ServicioViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ServicioSerializer
    queryset = models.Servicio.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Parámetro opcional: solo mostrar los servicios del proveedor conectado
        solo_mios = self.request.query_params.get("solo_mios")

        if solo_mios == "true" and hasattr(user, "proveedor"):
            queryset = queryset.filter(proveedor=user.proveedor)

        # También puedes filtrar por proveedor_id específico si se pasa
        proveedor_id = self.request.query_params.get("proveedor_id")
        if proveedor_id:
            queryset = queryset.filter(proveedor_id=proveedor_id)

        #Esto ayudará para realizar los filtros dentro de "todos los servicios"
        categoria_id = self.request.query_params.get("categoria_id")
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "proveedor"):
            serializer.save(proveedor=user.proveedor)
        else:
            serializer.save()