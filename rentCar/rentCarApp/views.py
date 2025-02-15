from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
import re
from django.utils.dateparse import parse_date
from datetime import datetime

from rentCarApp.models import (
    Marca, Estado, Vehiculo, RentaDevolucion, Rol, Usuario, Empleado, Cliente,
    TipoVehiculo, Modelo, TipoCombustible, Inspeccion
)
from rentCarApp.serializers import (
    MarcaSerializer, EstadoSerializer, VehiculoSerializer, RentaDevolucionSerializer,
    RolSerializer, UsuarioSerializer, EmpleadoSerializer, ClienteSerializer,
    TipoVehiculoSerializer, ModeloSerializer, TipoCombustibleSerializer, InspeccionSerializer
)

@csrf_exempt
def genericApi(request, model, serializer, id=None):
    if request.method == 'GET':

        if id:
            try:
                obj = model.objects.get(pk=id)
                obj_serializer = serializer(obj)
                return JsonResponse(obj_serializer.data, safe=False)
            except model.DoesNotExist:
                return JsonResponse({"error": "Objeto no encontrado"}, status=404)
            
        objects = model.objects.all()
        objects_serializer = serializer(objects, many=True)
        return JsonResponse(objects_serializer.data, safe=False)

    elif request.method == 'POST':
        data = JSONParser().parse(request)

        objects_serializer = serializer(data=data)
        if objects_serializer.is_valid():
            objects_serializer.save()
            return JsonResponse({"message": "¡Agregado Exitosamente!", "data": objects_serializer.data}, status=201)
        return JsonResponse({"error": "Error al agregar.", "details": objects_serializer.errors}, status=400)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        id = int(id) if id else None  

        try:
            obj = model.objects.get(pk=id)
        except model.DoesNotExist:
            return JsonResponse({"error": "Objeto no encontrado"}, status=404)

        objects_serializer = serializer(obj, data=data, partial=True) 
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

    for field in required_fields:
        if not data.get(field):
            errores[field] = [f"El campo {field} es obligatorio."]

    if Vehiculo.objects.filter(no_chasis=data.get("no_chasis")).exclude(identificador=id).exists():
        errores["no_chasis"] = ["Este número de chasis ya está registrado."]
    if Vehiculo.objects.filter(no_motor=data.get("no_motor")).exclude(identificador=id).exists():
        errores["no_motor"] = ["Este número de motor ya está registrado."]
    if Vehiculo.objects.filter(no_placa=data.get("no_placa")).exclude(identificador=id).exists():
        errores["no_placa"] = ["Este número de placa ya está registrado."]

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

        data, errores = validar_datos(data, id if is_update else None)
        if errores:
            return JsonResponse({"success": False, "errors": errores}, status=400)
        
        if is_update:
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

    if Usuario.objects.filter(nombre_usuario=data.get("nombre_usuario")).exclude(identificador=id).exists():
        errores["nombre_usuario"] = ["Este nombre de usuario ya está registrado."]

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

        data, errores = validar_usuario_datos(data, id if is_update else None)
        if errores:
            return JsonResponse({"success": False, "errors": errores}, status=400)

        if is_update:
            usuario.nombre_usuario = data["nombre_usuario"]
            usuario.contrasena = data["contrasena"]
            usuario.rol = data["rol"]
            usuario.estado = data["estado"]
            usuario.save()
            return JsonResponse({"success": True, "message": "Usuario actualizado exitosamente."}, status=200)

        usuario = Usuario.objects.create(
            nombre_usuario=data["nombre_usuario"],
            contrasena=data["contrasena"],
            rol=data["rol"],
            estado=data["estado"]
        )
        return JsonResponse({"success": True, "message": "Usuario creado exitosamente.", "id": usuario.identificador}, status=201)

    return genericApi(request, Usuario, UsuarioSerializer, id)

def validar_cedula(cedula):
    """ Verifica si la cédula dominicana es válida según el algoritmo de validación. """
    cedula = cedula.replace("-", "")
    
    if len(cedula) != 11 or not cedula.isdigit():
        return False

    multiplicadores = [1, 2] * 5 + [1]  
    total = 0

    for i in range(11):
        resultado = int(cedula[i]) * multiplicadores[i]
        if resultado >= 10:
            resultado = (resultado // 10) + (resultado % 10)
        total += resultado

    return total % 10 == 0

def validar_empleado_datos(data, id=None):
    errores = {}

    cedula_regex = r'^\d{3}-\d{7}-\d{1}$'

    if not data.get("nombre"):
        errores["nombre"] = ["El campo nombre es obligatorio."]
    
    if not data.get("cedula"):
        errores["cedula"] = ["El campo cédula es obligatorio."]
    elif not re.match(cedula_regex, data["cedula"]):
        errores["cedula"] = ["La cédula debe estar en el formato ###-#######-#."]
    elif not validar_cedula(data["cedula"]):
        errores["cedula"] = ["La cédula ingresada no es válida."]
    
    if not data.get("tanda_labor"):
        errores["tanda_labor"] = ["El campo tanda de labor es obligatorio."]
    
    if not data.get("porciento_comision"):
        errores["porciento_comision"] = ["El campo porcentaje de comisión es obligatorio."]
    else:
        try:
            porciento_comision = float(data["porciento_comision"])
            if porciento_comision < 0:
                errores["porciento_comision"] = ["El porcentaje de comisión no puede ser negativo."]
        except ValueError:
            errores["porciento_comision"] = ["El porcentaje de comisión debe ser un número válido."]
    
    if not data.get("fecha_ingreso"):
        errores["fecha_ingreso"] = ["El campo fecha de ingreso es obligatorio."]
    else:
        fecha_ingreso = parse_date(data["fecha_ingreso"])
        if not fecha_ingreso or fecha_ingreso > datetime.today().date():
            errores["fecha_ingreso"] = ["La fecha de ingreso no puede ser mayor a la fecha actual."]
    
    if not data.get("usuario"):
        errores["usuario"] = ["El campo usuario es obligatorio."]
    
    if not data.get("estado"):
        errores["estado"] = ["El campo estado es obligatorio."]

    if Empleado.objects.filter(cedula=data.get("cedula")).exclude(identificador=id).exists():
        errores["cedula"] = ["Esta cédula ya está registrada."]
    
    return data, errores

@csrf_exempt
def empleadoApi(request, id=0):
    if request.method in ['POST', 'PUT']:
        data = JSONParser().parse(request)
        is_update = request.method == 'PUT'
        empleado = None

        if is_update:
            try:
                empleado = Empleado.objects.get(pk=id)
            except Empleado.DoesNotExist:
                return JsonResponse({"success": False, "error": "Empleado no encontrado."}, status=404)
            
        data, errores = validar_empleado_datos(data, id if is_update else None)
        if errores:
            return JsonResponse({"success": False, "errors": errores}, status=400)
        
        try:
            estado = Estado.objects.get(pk=data["estado"])
        except ObjectDoesNotExist:
            return JsonResponse({"success": False, "error": "El estado seleccionado no es válido."}, status=400)

        if is_update:

            empleado.nombre = data["nombre"]
            empleado.cedula = data["cedula"]
            empleado.tanda_labor = data["tanda_labor"]
            empleado.porciento_comision = data["porciento_comision"]
            empleado.fecha_ingreso = data["fecha_ingreso"]
            empleado.usuario_id = data["usuario"]
            empleado.estado = estado  
            empleado.save()
            return JsonResponse({"success": True, "message": "Empleado actualizado exitosamente."}, status=200)

        empleado = Empleado.objects.create(
            nombre=data["nombre"],
            cedula=data["cedula"],
            tanda_labor=data["tanda_labor"],
            porciento_comision=data["porciento_comision"],
            fecha_ingreso=data["fecha_ingreso"],
            usuario_id=data["usuario"],
            estado=estado  
        )
        return JsonResponse({"success": True, "message": "Empleado creado exitosamente.", "id": empleado.pk}, status=201)

    return genericApi(request, Empleado, EmpleadoSerializer, id)

def validar_cliente_datos(data, id=None):
    errores = {}


    cedula_regex = r'^\d{3}-\d{7}-\d{1}$' 
    tarjeta_regex = r'^\d{4}-\d{4}-\d{4}-\d{4}$' 

    if not data.get("nombre"):
        errores["nombre"] = ["El campo nombre es obligatorio."]
    
    if not data.get("cedula"):
        errores["cedula"] = ["El campo cédula es obligatorio."]
    elif not re.match(cedula_regex, data["cedula"]):  
        errores["cedula"] = ["La cédula debe estar en el formato ###-#######-#."]
    elif not validar_cedula(data["cedula"]):  
        errores["cedula"] = ["La cédula ingresada no es válida."]
    
    if not data.get("no_tarjeta_cr"):
        errores["no_tarjeta_cr"] = ["El campo número de tarjeta de crédito es obligatorio."]
    elif not re.match(tarjeta_regex, data["no_tarjeta_cr"]):  
        errores["no_tarjeta_cr"] = ["El número de tarjeta debe estar en el formato ####-####-####-####."]

    if not data.get("limite_credito"):
        errores["limite_credito"] = ["El campo límite de crédito es obligatorio."]
    else:
        try:
            limite_credito = float(data["limite_credito"])
            if limite_credito < 0:
                errores["limite_credito"] = ["El límite de crédito no puede ser negativo."]
        except ValueError:
            errores["limite_credito"] = ["El límite de crédito debe ser un número válido."]
    
    if not data.get("tipo_persona"):
        errores["tipo_persona"] = ["El campo tipo de persona es obligatorio."]
    
    if not data.get("estado"):
        errores["estado"] = ["El campo estado es obligatorio."]

    if Cliente.objects.filter(cedula=data.get("cedula")).exclude(identificador=id).exists():
        errores["cedula"] = ["Esta cédula ya está registrada."]
    
    if Cliente.objects.filter(no_tarjeta_cr=data.get("no_tarjeta_cr")).exclude(identificador=id).exists():
        errores["no_tarjeta_cr"] = ["Este número de tarjeta ya está registrado."]

    return data, errores


@csrf_exempt
def clienteApi(request, id=0):
    if request.method in ['POST', 'PUT']:
        data = JSONParser().parse(request)
        is_update = request.method == 'PUT'
        cliente = None

        if is_update:
            try:
                cliente = Cliente.objects.get(pk=id)
            except Cliente.DoesNotExist:
                return JsonResponse({"success": False, "error": "Cliente no encontrado."}, status=404)

        data, errores = validar_cliente_datos(data, id if is_update else None)
        if errores:
            return JsonResponse({"success": False, "errors": errores}, status=400)

        try:
            estado = Estado.objects.get(pk=data["estado"])
        except ObjectDoesNotExist:
            return JsonResponse({"success": False, "error": "El estado seleccionado no es válido."}, status=400)

        if is_update:

            cliente.nombre = data["nombre"]
            cliente.cedula = data["cedula"]
            cliente.no_tarjeta_cr = data["no_tarjeta_cr"]
            cliente.limite_credito = data["limite_credito"]
            cliente.tipo_persona = data["tipo_persona"]
            cliente.estado = estado  
            cliente.save()
            return JsonResponse({"success": True, "message": "Cliente actualizado exitosamente."}, status=200)

        cliente = Cliente.objects.create(
            nombre=data["nombre"],
            cedula=data["cedula"],
            no_tarjeta_cr=data["no_tarjeta_cr"],
            limite_credito=data["limite_credito"],
            tipo_persona=data["tipo_persona"],
            estado=estado  
        )
        return JsonResponse({"success": True, "message": "Cliente creado exitosamente.", "id": cliente.pk}, status=201)

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
