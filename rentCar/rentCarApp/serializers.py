from rest_framework import serializers
from rentCarApp.models import (
    Estado,
    Rol,
    Usuario,
    Empleado,
    Cliente,
    Vehiculo,
    TipoVehiculo,
    Marca,
    Modelo,
    TipoCombustible,
    Inspeccion,
    RentaDevolucion,
)

# Serializer para Estado
class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = '__all__'


# Serializer para Rol
class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'


# Serializer para Usuario
class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all())  
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = Usuario
        fields = '__all__'


# Serializer para Empleado
class EmpleadoSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all()) 
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())  

    class Meta:
        model = Empleado
        fields = '__all__'


# Serializer para Cliente
class ClienteSerializer(serializers.ModelSerializer):
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = Cliente
        fields = '__all__'


# Serializer para TipoVehiculo
class TipoVehiculoSerializer(serializers.ModelSerializer):
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = TipoVehiculo
        fields = '__all__'


# Serializer para Marca
class MarcaSerializer(serializers.ModelSerializer):
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = Marca
        fields = '__all__'


# Serializer para Modelo
class ModeloSerializer(serializers.ModelSerializer):
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = Modelo
        fields = '__all__'


# Serializer para TipoCombustible
class TipoCombustibleSerializer(serializers.ModelSerializer):
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = TipoCombustible
        fields = '__all__'


# Serializer para Vehiculo
class VehiculoSerializer(serializers.ModelSerializer):
    tipo_vehiculo = serializers.PrimaryKeyRelatedField(queryset=TipoVehiculo.objects.all())
    marca = serializers.PrimaryKeyRelatedField(queryset=Marca.objects.all())
    modelo = serializers.PrimaryKeyRelatedField(queryset=Modelo.objects.all())
    tipo_combustible = serializers.PrimaryKeyRelatedField(queryset=TipoCombustible.objects.all())
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = Vehiculo
        fields = '__all__'


# Serializer para Inspeccion
class InspeccionSerializer(serializers.ModelSerializer):
    vehiculo = serializers.PrimaryKeyRelatedField(queryset=Vehiculo.objects.all())
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    empleado_inspeccion = serializers.PrimaryKeyRelatedField(queryset=Empleado.objects.all())
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = Inspeccion
        fields = '__all__'


# Serializer para RentaDevolucion
class RentaDevolucionSerializer(serializers.ModelSerializer):
    vehiculo = serializers.PrimaryKeyRelatedField(queryset=Vehiculo.objects.all())
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    empleado = serializers.PrimaryKeyRelatedField(queryset=Empleado.objects.all())
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())

    class Meta:
        model = RentaDevolucion
        fields = '__all__'
