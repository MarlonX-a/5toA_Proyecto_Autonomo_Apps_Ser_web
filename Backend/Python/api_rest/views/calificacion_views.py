from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import viewsets
from .. import models, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from ..permissions import DashboardReadOnly



class CalificacionView(viewsets.ModelViewSet):
    serializer_class = serializers.CalificacionSerializer
    queryset = models.Calificacion.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [DashboardReadOnly]


    def perform_create(self, serializer):
        cliente = self.request.user.cliente  
        serializer.save(cliente=cliente)

    # Endpoint extra opcional para obtener calificaciones por servicio
    @action(detail=False, methods=['get'], url_path='servicio/(?P<servicio_id>[^/.]+)')
    def por_servicio(self, request, servicio_id=None):
        calificaciones = self.queryset.filter(servicio_id=servicio_id)
        serializer = self.get_serializer(calificaciones, many=True)
        return Response(serializer.data)