from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.utils.dateparse import parse_date
from .. import models, serializers
from ..permissions import DashboardReadOnly

class ReservaView(viewsets.ModelViewSet):
    serializer_class = serializers.ReservaSerializer
    queryset = models.Reserva.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [DashboardReadOnly]  # Permite dashboard sin autenticación

    def get_queryset(self):
        queryset = super().get_queryset()

        qp = self.request.query_params

        # Filtro cliente
        cliente_id = qp.get("clienteId") or qp.get("cliente_id")
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)

        # Filtro estado
        estado = qp.get("estado")
        if estado:
            queryset = queryset.filter(estado=estado)

        # Filtro fecha desde
        fecha_desde = qp.get("fechaDesde")
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=parse_date(fecha_desde))

        # Filtro fecha hasta
        fecha_hasta = qp.get("fechaHasta")
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=parse_date(fecha_hasta))

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # PAGINACIÓN MANUAL
        limit = request.query_params.get("limit")
        offset = request.query_params.get("offset")

        if offset:
            queryset = queryset[int(offset):]
        if limit:
            queryset = queryset[:int(limit)]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
