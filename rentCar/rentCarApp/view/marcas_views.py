from django.shortcuts import render
from django.core.paginator import Paginator
from rentCarApp.models import Marca, Estado
from rentCarApp.serializers import MarcaSerializer, EstadoSerializer
from rentCarApp.decorators import login_required_custom, admin_required  

@login_required_custom
@admin_required
def marcasView(request):
    marcas_list = Marca.objects.all().order_by('identificador')
    paginator = Paginator(marcas_list, 5)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    serializer = MarcaSerializer(page_obj, many=True)

    estados = Estado.objects.all().order_by('descripcion')  
    estados_serializer = EstadoSerializer(estados, many=True)  

    return render(request, 'marcas/marcas.html', {
        'marcas': serializer.data,
        'page_obj': page_obj,
        'estados': estados_serializer.data
    })
