from django.shortcuts import render
from django.core.paginator import Paginator
from rentCarApp.models import Vehiculo, TipoVehiculo, Marca, Modelo, TipoCombustible, Estado
from rentCarApp.serializers import VehiculoSerializer, TipoVehiculoSerializer, MarcaSerializer, ModeloSerializer, TipoCombustibleSerializer, EstadoSerializer
from rentCarApp.decorators import login_required_custom, admin_required  

@login_required_custom
@admin_required
def vehiculoView(request):
    vehiculo_list = Vehiculo.objects.all()
    paginator = Paginator(vehiculo_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    vehiculos_serializer = VehiculoSerializer(page_obj, many=True)
    
    tipos_vehiculo = TipoVehiculo.objects.filter(estado__descripcion="Activo").order_by('descripcion')
    tipos_vehiculo_serializer = TipoVehiculoSerializer(tipos_vehiculo, many=True)
    
    marcas = Marca.objects.filter(estado__descripcion="Activo").order_by('descripcion')
    marcas_serializer = MarcaSerializer(marcas, many=True)
    
    modelos = Modelo.objects.filter(estado__descripcion="Activo").order_by('descripcion')
    modelos_serializer = ModeloSerializer(modelos, many=True)
    
    tipos_combustible = TipoCombustible.objects.filter(estado__descripcion="Activo").order_by('descripcion')
    tipos_combustible_serializer = TipoCombustibleSerializer(tipos_combustible, many=True)

    estados = Estado.objects.all().order_by('descripcion')
    estados_serializer = EstadoSerializer(estados, many=True)
    
    context = {
        'vehiculos': vehiculos_serializer.data,
        'tipos_vehiculo': tipos_vehiculo_serializer.data,
        'marcas': marcas_serializer.data,
        'modelos': modelos_serializer.data,
        'tipos_combustible': tipos_combustible_serializer.data,
        'estados': estados_serializer.data,
        'page_obj': page_obj
    }
    
    return render(request, 'vehiculo/vehiculo.html', context)
