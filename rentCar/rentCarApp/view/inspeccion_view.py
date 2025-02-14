from datetime import datetime
from django.shortcuts import render
from django.core.paginator import Paginator
from rentCarApp.models import Inspeccion, Vehiculo, Cliente, Empleado, Estado
from rentCarApp.serializers import InspeccionSerializer, VehiculoSerializer, ClienteSerializer, EmpleadoSerializer, EstadoSerializer
from rentCarApp.decorators import login_required_custom, admin_required  

@login_required_custom
def inspeccionView(request):
    inspeccion_list = Inspeccion.objects.all()
    paginator = Paginator(inspeccion_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    inspecciones_serializer = InspeccionSerializer(page_obj, many=True)
    
    # Convertir la fecha de inspección al formato MM/DD/YYYY
    for inspeccion in inspecciones_serializer.data:
        if inspeccion.get("fecha"):
            inspeccion["fecha"] = datetime.strptime(inspeccion["fecha"], "%Y-%m-%d").strftime("%m/%d/%Y")

    vehiculos = Vehiculo.objects.filter(estado__descripcion="Activo").order_by('descripcion')
    vehiculos_serializer = VehiculoSerializer(vehiculos, many=True)
    
    clientes = Cliente.objects.filter(estado__descripcion="Activo").order_by('nombre')
    clientes_serializer = ClienteSerializer(clientes, many=True)
    
    empleados = Empleado.objects.filter(estado__descripcion="Activo").order_by('nombre')
    empleados_serializer = EmpleadoSerializer(empleados, many=True)
    
    estados = Estado.objects.all().order_by('descripcion')
    estados_serializer = EstadoSerializer(estados, many=True)
    
    context = {
        'inspecciones': inspecciones_serializer.data,
        'vehiculos': vehiculos_serializer.data,
        'clientes': clientes_serializer.data,
        'empleados': empleados_serializer.data,
        'estados': estados_serializer.data,
        'page_obj': page_obj
    }
    
    return render(request, 'inspeccion/inspeccion.html', context)
