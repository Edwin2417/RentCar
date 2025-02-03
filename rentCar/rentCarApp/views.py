from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse
from django.core.exceptions import ObjectDoesNotExist

# Importar todos los modelos y serializers necesarios
from rentCarApp.models import (
    Marca, Estado, Vehiculo, RentaDevolucion, Rol, Usuario, Empleado, Cliente,
    TipoVehiculo, Modelo, TipoCombustible, Inspeccion
)
from rentCarApp.serializers import (
    MarcaSerializer, EstadoSerializer, VehiculoSerializer, RentaDevolucionSerializer,
    RolSerializer, UsuarioSerializer, EmpleadoSerializer, ClienteSerializer,
    TipoVehiculoSerializer, ModeloSerializer, TipoCombustibleSerializer, InspeccionSerializer
)

# CRUD genérico para múltiples modelos
@csrf_exempt
def genericApi(request, model, serializer, id=None):
    if request.method == 'GET':
        # Si 'id' se pasa, solo se obtiene un objeto específico
        if id:
            try:
                obj = model.objects.get(pk=id)
                obj_serializer = serializer(obj)
                return JsonResponse(obj_serializer.data, safe=False)
            except model.DoesNotExist:
                return JsonResponse({"error": "Objeto no encontrado"}, status=404)
        # Si no, se obtienen todos los objetos
        objects = model.objects.all()
        objects_serializer = serializer(objects, many=True)
        return JsonResponse(objects_serializer.data, safe=False)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        # Se valida el serializador y se guarda el nuevo objeto
        objects_serializer = serializer(data=data)
        if objects_serializer.is_valid():
            objects_serializer.save()
            return JsonResponse({"message": "¡Agregado Exitosamente!", "data": objects_serializer.data}, status=201)
        return JsonResponse({"error": "Error al agregar.", "details": objects_serializer.errors}, status=400)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        id = int(id) if id else None  # Asegúrate de que id sea un entero

        try:
            obj = model.objects.get(pk=id)
        except model.DoesNotExist:
            return JsonResponse({"error": "Objeto no encontrado"}, status=404)

        # Se actualiza el objeto con los nuevos datos
        objects_serializer = serializer(obj, data=data, partial=True)  # Permite actualizar campos parciales
        if objects_serializer.is_valid():
            objects_serializer.save()
            return JsonResponse({"message": "¡Actualizado Exitosamente!", "data": objects_serializer.data}, status=200)

        return JsonResponse({"error": "Error al actualizar.", "details": objects_serializer.errors}, status=400)


    elif request.method == 'DELETE':
        try:
            obj = model.objects.get(pk=id)
            obj.delete()
            return JsonResponse({"message": "¡Eliminado Exitosamente!"}, status=200)
        except model.DoesNotExist:
            return JsonResponse({"error": "Objeto no encontrado"}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Error inesperado: {str(e)}"}, status=500)


# API específica para Marca
@csrf_exempt
def marcaApi(request, id=0):
    return genericApi(request, Marca, MarcaSerializer, id)


# API específica para Estado
@csrf_exempt
def estadoApi(request, id=0):
    return genericApi(request, Estado, EstadoSerializer, id)


# API específica para Vehiculo

def validar_datos(data, id=None):
    required_fields = ["descripcion", "no_chasis", "no_motor", "no_placa", "tipo_vehiculo", "marca", "modelo", "tipo_combustible", "estado"]
    errores = {}

    # Validación de campos requeridos
    for field in required_fields:
        if not data.get(field):
            errores[field] = [f"El campo {field} es obligatorio."]

    # Validaciones de unicidad (evitar colisión en caso de actualización)
    if Vehiculo.objects.filter(no_chasis=data.get("no_chasis")).exclude(identificador=id).exists():
        errores["no_chasis"] = ["Este número de chasis ya está registrado."]
    if Vehiculo.objects.filter(no_motor=data.get("no_motor")).exclude(identificador=id).exists():
        errores["no_motor"] = ["Este número de motor ya está registrado."]
    if Vehiculo.objects.filter(no_placa=data.get("no_placa")).exclude(identificador=id).exists():
        errores["no_placa"] = ["Este número de placa ya está registrado."]

    # Validación de claves foráneas
    try:
        data["tipo_vehiculo"] = TipoVehiculo.objects.get(pk=data["tipo_vehiculo"])
        data["marca"] = Marca.objects.get(pk=data["marca"])
        data["modelo"] = Modelo.objects.get(pk=data["modelo"])
        data["tipo_combustible"] = TipoCombustible.objects.get(pk=data["tipo_combustible"])
        data["estado"] = Estado.objects.get(pk=data["estado"])
    except ObjectDoesNotExist as e:
        return None, {"error": f"Uno de los valores seleccionados no es válido: {str(e)}"}

    return data, errores

@csrf_exempt
def vehiculoApi(request, id=0):
    if request.method in ['POST', 'PUT']:
        data = JSONParser().parse(request)
        is_update = request.method == 'PUT'
        vehiculo = None
        
        if is_update:
            try:
                vehiculo = Vehiculo.objects.get(pk=id)
            except Vehiculo.DoesNotExist:
                return JsonResponse({"success": False, "error": "Vehículo no encontrado."}, status=404)
        
        # Validar datos
        data, errores = validar_datos(data, id if is_update else None)
        if errores:
            return JsonResponse({"success": False, "errors": errores}, status=400)
        
        if is_update:
            # Actualizar vehículo
            vehiculo.descripcion = data["descripcion"]
            vehiculo.no_chasis = data["no_chasis"]
            vehiculo.no_motor = data["no_motor"]
            vehiculo.no_placa = data["no_placa"]
            vehiculo.tipo_vehiculo = data["tipo_vehiculo"]
            vehiculo.marca = data["marca"]
            vehiculo.modelo = data["modelo"]
            vehiculo.tipo_combustible = data["tipo_combustible"]
            vehiculo.estado = data["estado"]
            vehiculo.save()
            return JsonResponse({"success": True, "message": "Vehículo actualizado exitosamente."}, status=200)
        
        # Crear vehículo
        vehiculo = Vehiculo.objects.create(
            descripcion=data["descripcion"],
            no_chasis=data["no_chasis"],
            no_motor=data["no_motor"],
            no_placa=data["no_placa"],
            tipo_vehiculo=data["tipo_vehiculo"],
            marca=data["marca"],
            modelo=data["modelo"],
            tipo_combustible=data["tipo_combustible"],
            estado=data["estado"]
        )
        return JsonResponse({"success": True, "message": "Vehículo creado exitosamente.", "id": vehiculo.identificador}, status=201)
    
    return genericApi(request, Vehiculo, VehiculoSerializer, id)



# API específica para RentaDevolucion
@csrf_exempt
def rentaDevolucionApi(request, id=0):
    return genericApi(request, RentaDevolucion, RentaDevolucionSerializer, id)


# API específica para Rol
@csrf_exempt
def rolApi(request, id=0):
    return genericApi(request, Rol, RolSerializer, id)


def validar_usuario_datos(data, id=None):
    errores = {}

    # Validar campos requeridos
    if not data.get("nombre_usuario"):
        errores["nombre_usuario"] = ["El campo nombre_usuario es obligatorio."]
    if not data.get("contrasena"):
        errores["contrasena"] = ["El campo contrasena es obligatorio."]
    if not data.get("rol"):
        errores["rol"] = ["El campo rol es obligatorio."]
    if not data.get("estado"):
        errores["estado"] = ["El campo estado es obligatorio."]

    # Validación de unicidad del nombre de usuario
    if Usuario.objects.filter(nombre_usuario=data.get("nombre_usuario")).exclude(identificador=id).exists():
        errores["nombre_usuario"] = ["Este nombre de usuario ya está registrado."]

    # Validación de claves foráneas
    try:
        data["rol"] = Rol.objects.get(pk=data["rol"])
        data["estado"] = Estado.objects.get(pk=data["estado"])
    except ObjectDoesNotExist as e:
        return None, {"error": f"Uno de los valores seleccionados no es válido: {str(e)}"}

    return data, errores

@csrf_exempt
def usuarioApi(request, id=0):
    if request.method in ['POST', 'PUT']:
        data = JSONParser().parse(request)
        is_update = request.method == 'PUT'
        usuario = None
        
        if is_update:
            try:
                usuario = Usuario.objects.get(pk=id)
            except Usuario.DoesNotExist:
                return JsonResponse({"success": False, "error": "Usuario no encontrado."}, status=404)
        
        # Validar datos
        data, errores = validar_usuario_datos(data, id if is_update else None)
        if errores:
            return JsonResponse({"success": False, "errors": errores}, status=400)

        if is_update:
            # Actualizar usuario
            usuario.nombre_usuario = data["nombre_usuario"]
            usuario.contrasena = data["contrasena"]
            usuario.rol = data["rol"]
            usuario.estado = data["estado"]
            usuario.save()
            return JsonResponse({"success": True, "message": "Usuario actualizado exitosamente."}, status=200)

        # Crear usuario
        usuario = Usuario.objects.create(
            nombre_usuario=data["nombre_usuario"],
            contrasena=data["contrasena"],
            rol=data["rol"],
            estado=data["estado"]
        )
        return JsonResponse({"success": True, "message": "Usuario creado exitosamente.", "id": usuario.identificador}, status=201)

    return genericApi(request, Usuario, UsuarioSerializer, id)



# API específica para Empleado
@csrf_exempt
def empleadoApi(request, id=0):
    return genericApi(request, Empleado, EmpleadoSerializer, id)


# API específica para Cliente
@csrf_exempt
def clienteApi(request, id=0):
    return genericApi(request, Cliente, ClienteSerializer, id)


# API específica para TipoVehiculo
@csrf_exempt
def tipoVehiculoApi(request, id=0):
    return genericApi(request, TipoVehiculo, TipoVehiculoSerializer, id)


# API específica para Modelo
@csrf_exempt
def modeloApi(request, id=0):
    return genericApi(request, Modelo, ModeloSerializer, id)


# API específica para TipoCombustible
@csrf_exempt
def tipoCombustibleApi(request, id=0):
    return genericApi(request, TipoCombustible, TipoCombustibleSerializer, id)


# API específica para Inspeccion
@csrf_exempt
def inspeccionApi(request, id=0):
    return genericApi(request, Inspeccion, InspeccionSerializer, id)
