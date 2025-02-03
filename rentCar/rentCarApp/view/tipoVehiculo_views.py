from django.shortcuts import render
from django.http import JsonResponse
from rentCarApp.models import TipoVehiculo, Estado
from django.core.paginator import Paginator
from rentCarApp.serializers import TipoVehiculoSerializer, EstadoSerializer

def tipoVehiculoView(request):

    tipoVehiculos_list = TipoVehiculo.objects.all()
    paginator = Paginator(tipoVehiculos_list, 5) 
    
    page_number = request.GET.get('page')  
    page_obj = paginator.get_page(page_number)  

    serializer = TipoVehiculoSerializer(page_obj, many=True)
    
    estados = Estado.objects.all().order_by('descripcion')  # Obtener los estados
    estados_serializer = EstadoSerializer(estados, many=True)  # Serializarlos

    return render(request, 'tipoVehiculo/tipoVehiculo.html', {
        'tipoVehiculos': serializer.data,
        'page_obj': page_obj,
        'estados': estados_serializer.data  # Pasar estados a la plantilla
    })



    
