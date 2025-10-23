from rest_framework import serializers
from .. import models
from .cliente import ClienteSerializer
from .servicio import ServicioSerializer

class CalificacionSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Cliente.objects.all(), source='cliente', write_only=True
    )

    servicio = ServicioSerializer(read_only=True)
    servicio_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Servicio.objects.all(), source='servicio', write_only=True
    )

    class Meta:
        model = models.Calificacion
        fields = '__all__'

        def validate_cliente(self, value):
            if not value or models.Cliente.objects.filter(id=value.id).exists():
                raise serializers.ValidationError("El cliente no existe")
            return value
        
        def validate_servicio(self, value):
            if  not value or models.Servicio.objects.filter(id=value.id).exists():
                raise serializers.ValidationError("El servicio no existe.")
            return value
        
        def validate_puntuacion(self, value):
            if value > 5 or value < 1:
                raise serializers.ValidationError("La puntuación debe ser entre 1 y 5.")
            return value
        
        def validate(self, data):
            cliente = data.get('cliente')
            servicio = data.get('servicio')

            if models.Calificacion.objects.filter(cliente=cliente, servicio=servicio).exists():
                raise serializers.ValidationError("El cliente ya ha calificado este servicio.")
            
            return data
        
        def create(self, validate_data):
            calificacion = super().create(validate_data)
            servicio = calificacion.servicio

            total = sum(c.puntuacion for c in servicio.calificaciones.all())
            count = servicio.calificaciones.count()
            servicio.rating_promedio = round(total/ count , 2)
            servicio.save()
            
            return calificacion
        
        def update(self, instace, validate_data):
            instace = super().update(instace, validate_data)
            servicio = instace.servicio

            total = sum(c.puntiacion for c in servicio.calificaciones.all())
            count = servicio.calificaciones.count()
            servicio.rating_promedio = round (total / count, 2)
            servicio.save()

            return isinstance