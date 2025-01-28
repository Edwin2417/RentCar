from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse

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
            return JsonResponse({"message": "!Agregado Exitosamente!", "data": objects_serializer.data}, status=201)
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
            return JsonResponse({"message": "!Actualizado Exitosamente!", "data": objects_serializer.data}, status=200)

        return JsonResponse({"error": "Error al actualizar.", "details": objects_serializer.errors}, status=400)


    elif request.method == 'DELETE':
        try:
            obj = model.objects.get(pk=id)
            obj.delete()
            return JsonResponse({"message": "!Eliminado Exitosamente!"}, status=200)
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
@csrf_exempt
def vehiculoApi(request, id=0):
    return genericApi(request, Vehiculo, VehiculoSerializer, id)


# API específica para RentaDevolucion
@csrf_exempt
def rentaDevolucionApi(request, id=0):
    return genericApi(request, RentaDevolucion, RentaDevolucionSerializer, id)


# API específica para Rol
@csrf_exempt
def rolApi(request, id=0):
    return genericApi(request, Rol, RolSerializer, id)


# API específica para Usuario
@csrf_exempt
def usuarioApi(request, id=0):
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
