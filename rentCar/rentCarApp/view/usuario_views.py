from django.shortcuts import render
from django.core.paginator import Paginator
from rentCarApp.models import Usuario, Rol, Estado
from rentCarApp.serializers import UsuarioSerializer, RolSerializer, EstadoSerializer

def usuarioView(request):
    usuario_list = Usuario.objects.all()
    paginator = Paginator(usuario_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    usuarios_serializer = UsuarioSerializer(page_obj, many=True)
    
    roles = Rol.objects.all().order_by('descripcion')
    roles_serializer = RolSerializer(roles, many=True)
    
    estados = Estado.objects.all().order_by('descripcion')
    estados_serializer = EstadoSerializer(estados, many=True)
    
    context = {
        'usuarios': usuarios_serializer.data,
        'roles': roles_serializer.data,
        'estados': estados_serializer.data,
        'page_obj': page_obj
    }
    
    return render(request, 'usuario/usuario.html', context)
