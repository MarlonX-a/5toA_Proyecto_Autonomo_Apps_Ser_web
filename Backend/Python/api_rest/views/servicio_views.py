from api_rest.authentication import JWTAuthentication
from rest_framework import viewsets
from .. import serializers, models
from ..permissions import DashboardReadOnly
from rest_framework.exceptions import PermissionDenied


class ServicioViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ServicioSerializer
    queryset = models.Servicio.objects.all()

    authentication_classes = [JWTAuthentication]
    permission_classes = [DashboardReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        qp = self.request.query_params

        payload = getattr(self.request, 'jwt_payload', None)
        role = payload.get('role') if payload else None
        user_sub = payload.get('sub') if payload else None

        # 🔐 solo_mios → solo servicios del proveedor autenticado
        solo_mios = qp.get("solo_mios")
        if solo_mios == "true":
            if not payload or role != "proveedor":
                return queryset.none()

            proveedor = models.Proveedor.objects.filter(user_id=user_sub).first()
            if proveedor:
                queryset = queryset.filter(proveedor_id=proveedor.id)
            else:
                queryset = queryset.none()

        # Filtro por proveedor explícito (dashboard / público)
        proveedor_id = qp.get("proveedor_id")
        if proveedor_id:
            queryset = queryset.filter(proveedor_id=proveedor_id)

        # Filtro por categoría
        categoria_id = qp.get("categoria_id")
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)

        return queryset

    def perform_create(self, serializer):
        payload = getattr(self.request, 'jwt_payload', None)

        if not payload or payload.get("role") != "proveedor":
            raise PermissionDenied("Solo un proveedor puede crear servicios.")

        proveedor = models.Proveedor.objects.filter(
            user_id=payload.get("sub")
        ).first()

        if not proveedor:
            raise PermissionDenied("Proveedor no encontrado.")

        serializer.save(proveedor=proveedor)
