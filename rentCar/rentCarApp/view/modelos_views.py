from django.shortcuts import render
from django.http import JsonResponse
from rentCarApp.models import Modelo
from rentCarApp.serializers import ModeloSerializer

def modelosView(request):

    modelos = Modelo.objects.all()

    serializer = ModeloSerializer(modelos, many=True)

    return render(request, 'modelos.html', {'modelos': serializer.data})
