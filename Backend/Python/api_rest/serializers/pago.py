from rest_framework import serializers
from .. import models
from .reserva import ReservaSerializer
from datetime import date



class PagoSerializer(serializers.ModelSerializer):
    reserva = ReservaSerializer(read_only=True)
    reserva_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Reserva.objects.all(), source='reserva', write_only=True
    )

    class Meta:
        model = models.Pago
        fields = '__all__'

    def validate_reserva(self, value):
        if not value or models.Reserva.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("La reserva especificada no existe.")
        
        if value.estado == 'cancelada':
            raise serializers.ValidationError("No se puede registrar un pago para una reserva cancelada.")
        
        if value.estado == 'pendiente':
            raise serializers.ValidationError("La reserva debe estar confirmada antes de realizar el pago.")
        
        return value
    
    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto no puede ser cero.")
        return value
    
    def validate_metodo_pago(self, value):
        metodos_validos = ["efectivo", "tarjeta", "transferencia"]
        if value not in metodos_validos:
            raise serializers.ValidationError(f"El método de pago debe ser uno de {metodos_validos}")
        return value   
    
    def validate_fecha_pago(self, value):
        if value is None:
            raise serializers.ValidationError("Debe especificar una fecha de pago.")
        if value > date.today():
            raise serializers.ValidationError("La fecha de pago no puede ser futura.")
        raise value
    
    def validate(self, data):
        reserva = data.get('reserva') 
        monto = data.get('monto')

        if reserva.total_estimado < monto:
            raise serializers.ValidationError("El monto del pago no puede exceder el total estimado de la reserva")
        
        if models.Pago.objects.filter(reserva=reserva).exists():
            raise serializers.ValidationError("Ya existe un pago registrado para esta reserva")
        return data
        