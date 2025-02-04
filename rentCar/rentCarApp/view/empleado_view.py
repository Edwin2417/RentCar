from django.shortcuts import render
from django.core.paginator import Paginator
from datetime import datetime
from rentCarApp.models import Empleado, Estado, Usuario
from rentCarApp.serializers import EmpleadoSerializer, EstadoSerializer, UsuarioSerializer
from rentCarApp.decorators import login_required_custom, admin_required  

@login_required_custom
@admin_required
def empleadoView(request):
    empleado_list = Empleado.objects.all().order_by('identificador')
    paginator = Paginator(empleado_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    empleados_serializer = EmpleadoSerializer(page_obj, many=True)
    
    # Formatear fecha antes de enviar al template
    for empleado in empleados_serializer.data:
        if empleado.get("fecha_ingreso"):
            empleado["fecha_ingreso"] = datetime.strptime(empleado["fecha_ingreso"], "%Y-%m-%d").strftime("%m/%d/%Y")
    
    usuarios = Usuario.objects.filter(estado__descripcion="Activo").order_by('nombre_usuario')
    usuarios_serializer = UsuarioSerializer(usuarios, many=True)
    
    estados = Estado.objects.all().order_by('descripcion')
    estados_serializer = EstadoSerializer(estados, many=True)
    
    context = {
        'empleados': empleados_serializer.data,
        'usuarios': usuarios_serializer.data,
        'estados': estados_serializer.data,
        'page_obj': page_obj
    }
    
    return render(request, 'empleado/empleado.html', context)