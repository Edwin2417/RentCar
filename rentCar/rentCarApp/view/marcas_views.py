from django.shortcuts import render
from django.http import JsonResponse
from rentCarApp.models import Marca
from rentCarApp.serializers import MarcaSerializer

def marcasView(request):
    # Obtiene todas las marcas de la base de datos
    marcas = Marca.objects.all()
    # Serializa los datos de las marcas
    serializer = MarcaSerializer(marcas, many=True)
    # Renderiza el template 'marcas.html' y pasa los datos como contexto
    return render(request, 'marcas.html', {'marcas': serializer.data})
