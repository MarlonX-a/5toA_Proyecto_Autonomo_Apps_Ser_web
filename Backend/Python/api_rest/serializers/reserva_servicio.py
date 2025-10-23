from rest_framework import serializers
from .. import models
from .reserva import ReservaSerializer
from .servicio import ServicioSerializer



class ReservaServicioSerializer(serializers.ModelSerializer):
    reserva = ReservaSerializer(read_only=True)
    reserva_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Reserva.objects.all(), source='reserva', write_only=True
    )

    servicio = ServicioSerializer(read_only=True)
    servicio_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Servicio.objects.all(), source='servicio', write_only=True
    )

    class Meta:
        model = models.ReservaServicio
        fields = '__all__'

        def validate_reserva(self, value):
            if not value or not models.Reserva.objects.filter(id=value.id).exists():
                raise serializers.ValidationError("La reserva especificada no existe.")
            return value

        def validate_servicio(self, value):
            if not value or not models.Servicio.objects.filter(id=value.id).exists():
                raise serializers.ValidationError("El servicio especificado no existe.")
            if not value.disponible:
                raise serializers.ValidationError("El servicio no está disponible actualmente.")
            return value
        
        def validate_cantidad(self, value):
            if value <= 0:
                raise serializers.ValidationError("La cantidad debe ser mayor que 0.")
            return value
        
        def validate_precio_unitario(self, value):
            if value <= 0:
                raise serializers.ValidationError("El precio unitario debe ser positivo.")
            return value
        
        def validate(self, data):
            reserva = data.get('reserva')
            servicio = data.get('servicio')
            cantidad = data.get('cantidad')
            precio_unitario = data.get('precio_unitario')

            if models.ReservaServicio.objects.filter(reserva = reserva, servicio= servicio).exists():
                raise serializers.ValidationError("El servicio no pertenece al mismo proveedor asociado a la reserva.")
            
            if hasattr(reserva, 'servicio') and servicio.proveedor != reserva.servicio.proveedor:
                raise serializers.ValidationError("El servicio no pertenece al mismo proveedor asociado a la reserva.")
            
            total_calculado = cantidad * precio_unitario
            if total_calculado <= 0:
                raise serializers.ValidationError("El total calculado debe ser mayor a cero.")
            
            return data