from django.shortcuts import render
from django.core.paginator import Paginator
from rentCarApp.models import Cliente, Estado
from rentCarApp.serializers import ClienteSerializer, EstadoSerializer
from rentCarApp.decorators import login_required_custom, admin_required  

@login_required_custom
@admin_required
def clienteView(request):
    cliente_list = Cliente.objects.all().order_by('identificador')
    paginator = Paginator(cliente_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    clientes_serializer = ClienteSerializer(page_obj, many=True)
    
    estados = Estado.objects.all().order_by('descripcion')
    estados_serializer = EstadoSerializer(estados, many=True)
    
    context = {
        'clientes': clientes_serializer.data,
        'estados': estados_serializer.data,
        'page_obj': page_obj
    }
    
    return render(request, 'cliente/cliente.html', context)
