from rest_framework import serializers
from .. import models
from .user import UserSerializer
from .ubicacion import UbicacionSerializer
from django.db import transaction

class ClienteSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    ubicacion = UbicacionSerializer(required=False, allow_null=True)

    class Meta:
        model = models.Cliente
        fields = ['id', 'user', 'telefono', 'ubicacion']

    def validate_user(self, value):
        if not value:
            raise serializers.ValidationError("El usuario debe asociarse a un cliente.")
        return value
    
    def validate_telefono(self, value):
        if not value:
            raise serializers.ValidationError("El número de teléfono es obligatorio.")
        if len(value) != 10:
            raise serializers.ValidationError("El número de teléfono debe tener 10 dígitos")
        return value

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        rol = self.context.get('rol', 'cliente')

        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save(rol=rol)

        ubicacion_data = validated_data.pop('ubicacion', None)
        ubicacion = None
        if ubicacion_data:
            ubicacion_serializer = UbicacionSerializer(data=ubicacion_data)
            ubicacion_serializer.is_valid(raise_exception=True)
            ubicacion = ubicacion_serializer.save()

        cliente = models.Cliente.objects.create(user=user, ubicacion=ubicacion, **validated_data)
        return cliente

    @transaction.atomic
    def update(self, instance, validated_data):
        # Actualizar user
        user_data = validated_data.pop('user', None)
        if user_data:
            password = user_data.pop('password', None)
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            if password:
                instance.user.set_password(password)
            instance.user.save()

        # Actualizar ubicacion
        ubicacion_data = validated_data.pop('ubicacion', None)
        if ubicacion_data:
            if instance.ubicacion:
                ubicacion_serializer = UbicacionSerializer(instance.ubicacion, data=ubicacion_data)
                ubicacion_serializer.is_valid(raise_exception=True)
                ubicacion_serializer.save()
            else:
                ubicacion_serializer = UbicacionSerializer(data=ubicacion_data)
                ubicacion_serializer.is_valid(raise_exception=True)
                instance.ubicacion = ubicacion_serializer.save()

        # Actualizar campos del cliente
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
