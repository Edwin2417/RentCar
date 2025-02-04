from django.shortcuts import render
from django.http import JsonResponse
from rentCarApp.models import Modelo, Estado    
from django.core.paginator import Paginator
from rentCarApp.serializers import ModeloSerializer,EstadoSerializer
from rentCarApp.decorators import login_required_custom, admin_required  # Importa el decorador

@login_required_custom
@admin_required
def modelosView(request):
    modelos_list = Modelo.objects.all().order_by('identificador') 
    paginator = Paginator(modelos_list, 5)  

    page_number = request.GET.get('page')  
    page_obj = paginator.get_page(page_number) 

    serializer = ModeloSerializer(page_obj, many=True)
    
    estados = Estado.objects.all().order_by('descripcion')  # Obtener los estados
    estados_serializer = EstadoSerializer(estados, many=True)  # Serializarlos

    return render(request, 'modelos/modelos.html', {
        'modelos': serializer.data,
        'page_obj': page_obj,
        'estados': estados_serializer.data  # Pasar estados a la plantilla
    })



    
