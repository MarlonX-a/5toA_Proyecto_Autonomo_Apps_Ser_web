from . import models
from rest_framework import serializers


class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Ubicacion
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class ClienteSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    ubicacion = UbicacionSerializer(required=False, allow_null=True)

    class Meta:
        model = models.Cliente
        fields = ['id', 'user', 'telefono', 'ubicacion']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        rol = self.context.get('rol', 'cliente')
        password = user_data.pop('password', None)
        user = models.User.objects.create(**user_data, rol=rol)
        if password:
            user.set_password(password)
            user.save()

        ubicacion_data = validated_data.pop('ubicacion', None)
        ubicacion = models.Ubicacion.objects.create(**ubicacion_data) if ubicacion_data else None

        cliente = models.Cliente.objects.create(user=user, ubicacion=ubicacion, **validated_data)
        return cliente

class ProveedorSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    ubicacion = UbicacionSerializer(required=False, allow_null=True)

    class Meta:
        model = models.Proveedor
        fields = ['id', 'user', 'telefono', 'descripcion', 'ubicacion']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        rol = self.context.get('rol', 'proveedor')
        password = user_data.pop('password', None)
        user = models.User.objects.create(**user_data, rol=rol)
        if password:
            user.set_password(password)
            user.save()

        ubicacion_data = validated_data.pop('ubicacion', None)
        ubicacion = models.Ubicacion.objects.create(**ubicacion_data) if ubicacion_data else None

        proveedor = models.Proveedor.objects.create(user=user, ubicacion=ubicacion, **validated_data)
        return proveedor


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Categoria
        fields = '__all__'


class ServicioSerializer(serializers.ModelSerializer):
    proveedor = serializers.PrimaryKeyRelatedField(queryset=models.Proveedor.objects.all())
    categoria = serializers.PrimaryKeyRelatedField(queryset=models.Categoria.objects.all())

    class Meta:
        model = models.Servicio
        fields = '__all__'


class ServicioUbicacionSerializer(serializers.ModelSerializer):
    ubicacion = serializers.PrimaryKeyRelatedField(queryset=models.Ubicacion.objects.all())
    servicio = serializers.PrimaryKeyRelatedField(queryset=models.Servicio.objects.all())
    class Meta:
        model = models.ServicioUbicacion
        fields = '__all__'

class FotoServicio(serializers.ModelSerializer):
    servicio = serializers.PrimaryKeyRelatedField(queryset=models.Servicio.objects.all())
    class Meta:
        model = models.FotoServicio
        fields = '__all__'

class ReservaSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(queryset=models.Cliente.objects.all())
    class Meta:
        model = models.Reserva
        fields = '__all__'

class ReservaServicioSerializer(serializers.ModelSerializer):
    reserva = serializers.PrimaryKeyRelatedField(queryset=models.Reserva.objects.all())
    servicio = serializers.PrimaryKeyRelatedField(queryset=models.Servicio.objects.all())
    class Meta:
        model = models.ReservaServicio
        fields = '__all__'


class PagoSerializer(serializers.ModelSerializer):
    reserva = serializers.PrimaryKeyRelatedField(queryset=models.Reserva.objects.all())
    class Meta:
        model = models.Pago
        fields = '__all__'
        
class ComentarioSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(queryset=models.Cliente.objects.all())
    servicio = serializers.PrimaryKeyRelatedField(queryset=models.Servicio.objects.all())

    class Meta:
        model = models.Comentario
        fields = '__all__'

class CalificacionSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(queryset=models.Cliente.objects.all())
    servicio = serializers.PrimaryKeyRelatedField(queryset=models.Servicio.objects.all())

    class Meta:
        model = models.Calificacion
        fields = '__all__'