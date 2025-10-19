from rest_framework import serializers
from .. import models
from .proveedor import ProveedorSerializer
from .categoria import CategoriaSerializer



class ServicioSerializer(serializers.ModelSerializer):
    proveedor = ProveedorSerializer(read_only=True)
    proveedor_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Proveedor.objects.all(), source='proveedor', write_only=True
    )

    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Categoria.objects.all(), source='categoria', write_only=True
    )

    class Meta:
        model = models.Servicio
        fields = '__all__'

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre del servicio no puede estar vació.")
        if len(value) < 5:
            raise serializers.ValidationError("El nombre del servicio debe tener más de 5 caracteres.")
        return value
    
    def validate_duracion(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("La Duración debe ser un número positivo")
        return value
    
    def validate_rating_promedio(sefl, value):
        if value is not None and (value < 0 or value > 5):
            raise serializers.Validationerror("El rating promedio debe estar entre 0 y 5.")
        return value
    
    def validate(self, data):
        proveedor = data.get('proveedor')
        categoria = data.get('categoria')
        nombre = data.get('nombre')

        if not proveedor:
            raise serializers.ValidationError({"proveedor": "Debe especificar un proveedor."})
        if proveedor.rol != "proveedor":
            raise serializers.ValidationError({"proveedor": "El usuario asociado debe tener un rol 'proveedor'."})

        if not categoria:
            raise serializers.ValiationError({"categoria": "Debe especificar una categoria."})
        if not models.Categoria.objects.filter(id = categoria.id).exists():
            raise serializers.ValidationError({"categoria": "La categoría especificada no existe."})
        
        if models.Servicio.objects.filter(proveedor=proveedor, nombre__iexact=nombre).exists():
            raise serializers.ValidationError({"nombre": "Ya existe un servicio con ese nombre pare el mismo proveedor."})
        
        descripcion = data.get('descripcion')
        if descripcion and len(descripcion.strip()) < 10:
            raise serializers.ValidtaionError({"descripcion": "La descripción debe tener minimo 10 caracteres"})
        return data
