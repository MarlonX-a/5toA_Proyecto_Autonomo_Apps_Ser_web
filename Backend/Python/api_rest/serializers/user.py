from rest_framework import serializers
from .. import models
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = models.User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password', 'rol']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("El nombre de usuario no puede estar vacío.")
        if models.User.objects.filter(username=value).exists():
            raise serializers.ValidationError("El nombre de usuario ya existe.")
        if ' ' in value:
            raise serializers.ValidationError("El nombre de usuario no puede contener espacios.")
        return value
    
    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("El correo electrónico no tiene un formato válido.")
        if models.User.objects.filter(email=value).exists():
            raise serializers.ValidationError("El correo electrónico ya está registrado.")
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        if value.isdigit() or value.isalpha():
            raise serializers.ValidationError("La contraseña debe tener letras y números.")
        return value  
    
    def validate_rol(self, value):
        roles_permitidos = ["cliente", "proveedor"]
        if value not in roles_permitidos:
            raise serializers.ValidationError(f"El rol debe ser uno de: {roles_permitidos}")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        rol = validated_data.pop('rol', None)
        user = models.User(**validated_data)
        if password:
            user.set_password(password)
        if rol:
            user.rol = rol
        user.save()
        return user
