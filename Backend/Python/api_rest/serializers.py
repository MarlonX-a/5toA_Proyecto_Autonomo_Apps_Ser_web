from . import models
from rest_framework import serializers
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.db import transaction
from urllib.parse import urlparse
import os
from datetime import date, datetime


class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Ubicacion
        fields = '__all__'

    def validate(self, data):
        campos = ["direccion", "ciudad", "provincia", "pais"]
        for campo in campos:
            if not data.get(campo) or not (data[campo]).strip():
                raise serializers.ValidationError({campo: "Este campo no puede estar vacío"})
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("El nombre de usuario no puede estar vacio.")
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
            raise serializers.ValidationError("la contraseña debe tener letras y números.")
        return make_password(value)
    
    def validate_rol(self, value):
        roles_permitidos = ["cliente", "proveedor"]
        if value not in roles_permitidos:
            raise serializers.ValidationError(f"El rol debe ser uno de: {roles_permitidos}")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = models.User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user


class ClienteSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    ubicacion = UbicacionSerializer(required=False, allow_null=True)

    class Meta:
        model = models.Cliente
        fields = ['id', 'user', 'telefono', 'ubicacion']

    def validate_usuario(self, value):
        if not value:
            raise serializers.ValidationError("El usuario debe asociarse a un cliente.")
        if value.rol != "cliente":
            raise serializers.ValidationError("El usuario debe tener rol de cliente.")
        if models.Cliente.objects.filter(usuario=value).exists():
            raise serializers.ValidationError("El cliente ya existe")
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


class ProveedorSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    ubicacion = UbicacionSerializer(required=False, allow_null=True)

    class Meta:
        model = models.Proveedor
        fields = ['id', 'user', 'telefono', 'descripcion', 'ubicacion']

    def validate_user(sefl, value):
        if not value:
            raise serializers.ValidationError("El usuario debe asociarse a un proveedor.")
        if value.rol != "proveedor":
            raise serializers.ValidationError("El usuario debe tener rol de proveedor.")
        if models.Proveedor.objects.filter(usuario=value).exists():
            raise serializers.ValidationError("El proveedor ya existe")
        return value
    
    def validate_teléfono(sefl, value):
        if not value:
            raise serializers.ValidationError("El número de teléfono es obligatorio.")
        if len(value) != 10:
            raise serializers.ValidationError("El número de teléfono debe tener 10 digitos.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        rol = self.context.get('rol', 'proveedor')


        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save(rol=rol)

        ubicacion_data = validated_data.pop('ubicacion', None)
        ubicacion = None
        if ubicacion_data:
            ubicacion_serializer = UbicacionSerializer(data=ubicacion_data)
            ubicacion_serializer.is_valid(raise_exception=True)
            ubicacion = ubicacion_serializer.save()

        proveedor = models.Proveedor.objects.create(user=user, ubicacion=ubicacion, **validated_data)
        return proveedor


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Categoria
        fields = '__all__'
    
    def validate_nombre(self, value):
        if not value:
            raise serializers.ValidationError("Este campo es obligatorio")
        if value.isdigit():
            raise serializers.ValidationError("No se permiten números")
        return value
    


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



class ServicioUbicacionSerializer(serializers.ModelSerializer):
    ubicacion = UbicacionSerializer(read_only=True)
    ubicacion_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Ubicacion.objects.all(), source='ubicacion', write_only=True
    )

    servicio = ServicioSerializer(read_only=True)
    servicio_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Servicio.objects.all(), source='servicio', write_only=True
    )

    class Meta:
        model = models.ServicioUbicacion
        fields = '__all__'

    def validation(self, data):
        servicio = data.get('servicio')
        ubicacion = data.get('ubicacion')

        if not servicio or not models.Servicio.objects.filter(id=servicio.id).exists():
            raise serializers.ValidationError({"servicio": "Debe especificar un servicio."})
        if not ubicacion or not models.Ubicacion.objects.filter(id=ubicacion.id).exists():
            raise serializers.ValidationError({"ubicacion": "Debe especificar una ubicación."})
        
        if models.Servicio.objects.filter(servicio=servicio, ubicacion=ubicacion).exists():
            raise serializers.ValidationError("Este servicio ya está asociado a la ubicación indicada")

        if ubicacion.proveedores.filter(id=servicio.proveedor.id).exists() is False:
            raise serializers.ValidationError("La ubicación seleccionada no pertenece al proveedor del servicio.")
        return data


class FotoServicioSerializer(serializers.ModelSerializer):
    servicio = ServicioSerializer(read_only=True)
    servicio_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Servicio.objects.all(), source='servicio', write_only=True
    )

    class Meta:
        model = models.FotoServicio
        fields = '__all__'

        def validate_servicio(self, value):
            if not value or not models.Servicio.objects.filter(id=value.id).exists():
                raise serializers.ValidationError("El servicio especificado no existe.")
            return value
        
        def validate_url_foto(self, value):
            if not value or not value.strip():
                raise serializers.ValidationError("La URL de la foto no puede estar vacía.")
            parsed_url = urlparse(value)
            if not parsed_url.scheme in ['http', 'https']:
                if not any(value.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif']):
                    raise serializers.ValidationError("La URL debe apuntar a una imagen válida (.jpg, .jpeg, .png, .gif).")
                else:
                    if not os.path.splitext(value)[1].lower() in ['.jpg', '.jpeg', '.png', '.gif']:
                        raise serializers.ValidationError("El archivo local debe ser una imagen válida (.jpg, .jpeg, .png, .gif).")
                    if value.startswith('/') or '..' in value:
                        raise serializers.ValidationError("La ruta local no puede ser absoluta ni salir de la carpeta de medios.")
                    
                    return value
                
        def validate(self, data):
            servicio = data.get('servicio')
            url_foto = data.get('url_foto')

            if models.FotoServicio.objects.filter(servicio=servicio, url_foto=url_foto).exists():
                raise serializers.ValidationError("Esta foto ya esta asociada al servicio.")
            
            max_fotos = 5
            total_fotos = models.FotoServicio.objects.filter(servicio=servicio).count()
            if total_fotos >= max_fotos:
                raise serializers.ValidationError(f"No se pueden agregar más de {max_fotos} fotos a un servicio.")
            
            return data
            

class ReservaSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Cliente.objects.all(), source='cliente', write_only=True
    )

    class Meta:
        model = models.Reserva
        fields = '__all__'

    def validate_cliente(self, value):
        if not value or models.Cliente.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("El cliente no existe.")
        return value
    
    def validate_fecha(self, value):
        if value < date.today():
            raise serializers.ValidationError("No puede hacer reservas de fechas pasadas.")
        return value
    
    def validate_hora(self, value):
        fecha = self.initial_data.get('fecha')
        if fecha:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
            if fecha_obj == date.today() and value <= datetime.now().time():
                raise serializers.ValidationError("La hora de la reserva debe ser futura.")
            
            return value
        
    def validate_estado(self, value):
        estados_valido = ['pendiente', 'confirmada', 'cancelada']
        if value not in estados_valido:
            raise serializers.ValidationError(f"El estado debe ser uno de {estados_valido}.")
        return value
    
    def validate_total_estimado(self, value):
        if value <= 0:
            raise serializers.ValidationError("El total estimado debe ser un valor positivo.")
        return value
    
    def validate(self, data):
        cliente = data.get('cliente')
        fecha = data.get('fecha')
        hora = data.get('hora')

        if models.Reserva.objects.filter(cliente=cliente, fecha = fecha, hora=hora).exists():
            raise serializers.ValidationError("El cliente ya tiene una reserva en esta fecha y hora.")
        return data
    

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
        
class ComentarioSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Cliente.objects.all(), source='cliente', write_only=True
    )

    servicio = ServicioSerializer(read_only=True)
    servicio_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Servicio.objects.all(), source='servicio', write_only=True
    )

    class Meta:
        model = models.Comentario
        fields = '__all__'

    def validate_cliente(self, value):
        if not value or models.Cliente.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("El cliente no existe.")
        return value
    
    def validate_servicio(self, value):
        if not value or models.Servicio.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("El servicio no existe.")
        return value
    
    def validate_calificacion(self, value):
        if value > 5 or value < 1:
            raise serializers.ValidationError("La calificación debe ser entre 1 y 5")
        return value
    
    def validate_texto(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El comentario no puede estar vacio.")
        return value
    
    def validate_fecha(self, value):
        if value > date.today():
            raise serializers.ValidationError("La fecha del comentario no puede ser futura.")
        return value
    


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

