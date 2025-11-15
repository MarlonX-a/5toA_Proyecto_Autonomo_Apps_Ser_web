from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import viewsets
from .. import models, serializers
from fastapi import logger
from rest_framework.exceptions import PermissionDenied

class ReservaServicioView(viewsets.ModelViewSet):
    serializer_class = serializers.ReservaServicioSerializer
    queryset = models.ReservaServicio.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        reserva_id = self.request.query_params.get("reserva_id")
        proveedor_id = self.request.query_params.get("proveedor_id")


        if reserva_id:
            queryset = queryset.filter(reserva_id=reserva_id)

        if proveedor_id:
            # devolver solo los ReservaServicio cuyo servicio pertenece al proveedor
            queryset = queryset.filter(servicio__proveedor_id=proveedor_id)
        
        return queryset

    def perform_update(self, serializer):
        # Si se intenta cambiar el estado de un ReservaServicio, validar que
        # el usuario autenticado sea el proveedor del servicio correspondiente.
        user = self.request.user
        # serializer.instance es la instancia actual antes del update
        instancia = getattr(serializer, 'instance', None) or serializer.instance
        # Datos entrantes (pueden venir en validated_data)
        nuevo_estado = serializer.validated_data.get('estado') if hasattr(serializer, 'validated_data') else None

        if nuevo_estado is not None:
            # comprobar que el usuario es proveedor y dueño del servicio
            if not hasattr(user, 'proveedor'):
                raise PermissionDenied("Solo un proveedor puede cambiar el estado de un servicio reservado.")

            servicio = instancia.servicio if instancia else None
            if not servicio or servicio.proveedor_id != user.proveedor.id:
                raise PermissionDenied("No tienes permiso para cambiar el estado de este servicio.")

        updated = serializer.save()

        # Después de actualizar el estado de un ReservaServicio, ajustar el estado
        # de la Reserva padre según reglas simples:
        # - Si al menos un ReservaServicio queda 'confirmada' -> Reserva.estado = 'confirmada'
        # - Si todos los ReservaServicio quedan 'rechazada' -> Reserva.estado = 'cancelada'
        try:
            reserva = updated.reserva
            hijos = reserva.detalles.all()
            estados = set(h.estado for h in hijos)

            # Cambio de comportamiento: no marcar la Reserva como 'confirmada'
            # automáticamente cuando un proveedor acepta su servicio. El flujo
            # final de confirmación/pago debe ser realizado por el cliente cuando
            # registre el pago. Conservamos la regla de cancelar la reserva si
            # todos los servicios fueron rechazados.
            if estados and all(s == 'rechazada' for s in estados):
                reserva.estado = 'cancelada'
                reserva.save()
        except Exception:
            # No bloquear la operación por fallos en esta sincronización
            logger.exception('Error actualizando estado de la Reserva tras cambiar ReservaServicio')