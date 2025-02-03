from django.shortcuts import render
from django.http import JsonResponse
from rentCarApp.models import TipoCombustible, Estado
from django.core.paginator import Paginator
from rentCarApp.serializers import TipoCombustibleSerializer,EstadoSerializer

def tipoCombustibleView(request):

    tipoCombustibles_list = TipoCombustible.objects.all().order_by('identificador')
    paginator = Paginator(tipoCombustibles_list, 5) 

    page_number = request.GET.get('page')  
    page_obj = paginator.get_page(page_number)  
    
    serializer = TipoCombustibleSerializer(page_obj, many=True)
    
    estados = Estado.objects.all().order_by('descripcion')  # Obtener los estados
    estados_serializer = EstadoSerializer(estados, many=True)  # Serializarlos

    return render(request, 'tipoCombustible/tipoCombustible.html', {
        'tipoCombustibles': serializer.data,
        'page_obj': page_obj,
        'estados': estados_serializer.data  # Pasar estados a la plantilla
    })
