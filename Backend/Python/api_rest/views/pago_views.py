from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework import viewsets
from .. import models, serializers
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from fastapi import logger

class PagoView(viewsets.ModelViewSet):
    serializer_class = serializers.PagoSerializer
    queryset = models.Pago.objects.all()
    authentication_classes = [TokenAuthentication]
    
    def get_permissions(self):
        """
        Permitir lectura (GET) sin autenticación para que el dashboard pueda obtener pagos.
        Mantener autenticación para crear, actualizar y eliminar.
        """
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        pago = serializer.save()

        reserva = pago.reserva
        try:
            if getattr(pago, 'estado', None) == 'pagado':
                reserva.estado = 'confirmada'
                reserva.save()
        except Exception:
            logger.exception('Error sincronizando estado de reserva tras creación de pago')

    @action(detail=True, methods=['post'], url_path='mark_pagado')
    def mark_pagado(self, request, pk=None):
        """Endpoint de testing: marcar un pago como 'pagado'.

        Útil para desarrollo/manual testing: actualiza el estado del Pago,
        pone la fecha si no existe y sincroniza la Reserva padre a 'confirmada'.
        También emite un evento al WebSocket para notificar el cambio.
        """
        pago = get_object_or_404(models.Pago, pk=pk)

        # Permiso básico: el cliente dueño de la reserva o staff puede marcarlo.
        user = request.user
        if hasattr(user, 'cliente'):
            if pago.reserva.cliente.user.id != user.id and not user.is_staff:
                raise PermissionDenied("No tienes permiso para marcar este pago como pagado.")

        # Marcar como pagado
        pago.estado = 'pagado'
        if not pago.fecha_pago:
            from django.utils import timezone
            pago.fecha_pago = timezone.now()
        pago.save()

        # Actualizar reserva
        try:
            reserva = pago.reserva
            reserva.estado = 'confirmada'
            reserva.save()
        except Exception:
            logger.exception('Error actualizando reserva tras marcar pago como pagado')

        # Notificar WebSocket (llama a la función del módulo signals)
        try:
            from ..signals import notify_websocket

            data = {
                'id': pago.id,
                'reserva_id': pago.reserva.id,
                'monto': str(pago.monto),
                'metodo': pago.metodo_pago,
                'fecha': str(pago.fecha_pago),
                'estado': pago.estado,
            }
            if hasattr(pago.reserva, 'cliente'):
                data['cliente_id'] = pago.reserva.cliente.id
            servicios = models.ReservaServicio.objects.filter(reserva=pago.reserva)
            if servicios.exists():
                data['proveedor_id'] = servicios.first().servicio.proveedor.id

            notify_websocket('payment_updated', data)
        except Exception:
            logger.exception('No se pudo notificar WebSocket tras marcar pago')

        serializer = self.get_serializer(pago)
        return Response(serializer.data, status=status.HTTP_200_OK)