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


class ServicioUbicacionSerializer(serializers.ModelSerializer):
    ubicacion = UbicacionSerializer()
    class Meta:
        model = models.ServicioUbicacion
        fields = ['id', 'ubicacion']

class ServicioSerializer(serializers.ModelSerializer):
    proveedor = ProveedorSerializer(read_only=True)
    ubicaciones = UbicacionSerializer(many=True, read_only=True)

    class Meta:
        model = models.Servicio
        fields = ['id', 'proveedor','nombre_servicio', 'descripcion', 'categoria', 'duracion', 'ubicaciones']

class ReservaSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    servicio = ServicioSerializer(read_only=True)
    class Meta:
        model = models.Reserva
        fields = ['id', 'cliente', 'servicio', 'fecha', 'estado']

class PagoSerializer(serializers.ModelSerializer):
    reserva = ReservaSerializer(read_only=True)
    class Meta:
        model = models.Pago
        fields = ['id', 'reserva', 'monto', 'metodo_pago', 'estado']

class ComentarioSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    servicio = ServicioSerializer(read_only=True)

    class Meta:
        model = models.Comentario
        fields = ['id', 'cliente', 'servicio', 'fecha']
