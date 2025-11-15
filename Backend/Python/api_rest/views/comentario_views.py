from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import viewsets
from .. import models, serializers


class ComentarioView(viewsets.ModelViewSet):
    serializer_class = serializers.ComentarioSerializer
    queryset = models.Comentario.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        servicio_id = self.request.query_params.get("servicio_id")
        if servicio_id:
            queryset = queryset.filter(servicio_id=servicio_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "cliente"):
            serializer.save(cliente=user.cliente)
        else:
            serializer.save()