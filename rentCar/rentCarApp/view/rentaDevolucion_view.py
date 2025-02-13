from datetime import datetime
from django.shortcuts import render
from django.core.paginator import Paginator
from rentCarApp.models import RentaDevolucion, Vehiculo, Cliente, Empleado, Estado
from rentCarApp.serializers import RentaDevolucionSerializer, VehiculoSerializer, ClienteSerializer, EmpleadoSerializer, EstadoSerializer
from rentCarApp.decorators import login_required_custom, admin_required  

@login_required_custom
@admin_required
def renta_devolucion_view(request):
    renta_list = RentaDevolucion.objects.all()
    paginator = Paginator(renta_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    rentas_serializer = RentaDevolucionSerializer(page_obj, many=True)

    for renta in rentas_serializer.data:
        if renta.get("fecha_renta"):
            renta["fecha_renta"] = datetime.strptime(renta["fecha_renta"], "%Y-%m-%d").strftime("%m/%d/%Y")
        if renta.get("fecha_devolucion"):
            renta["fecha_devolucion"] = datetime.strptime(renta["fecha_devolucion"], "%Y-%m-%d").strftime("%m/%d/%Y")

    vehiculos = Vehiculo.objects.filter(estado__descripcion="Activo").order_by('descripcion')
    vehiculos_serializer = VehiculoSerializer(vehiculos, many=True)
    
    clientes = Cliente.objects.filter(estado__descripcion="Activo").order_by('nombre')
    clientes_serializer = ClienteSerializer(clientes, many=True)
    
    empleados = Empleado.objects.filter(estado__descripcion="Activo").order_by('nombre')
    empleados_serializer = EmpleadoSerializer(empleados, many=True)
    
    estados = Estado.objects.all().order_by('descripcion')
    estados_serializer = EstadoSerializer(estados, many=True)
    
    context = {
        'rentas': rentas_serializer.data,
        'vehiculos': vehiculos_serializer.data,
        'clientes': clientes_serializer.data,
        'empleados': empleados_serializer.data,
        'estados': estados_serializer.data,
        'page_obj': page_obj
    }
    
    return render(request, 'renta_devolucion/renta_devolucion.html', context)
