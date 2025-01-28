from django.shortcuts import render
from django.http import JsonResponse
from rentCarApp.models import TipoVehiculo
from rentCarApp.serializers import TipoVehiculoSerializer

def tipoVehiculoView(request):

    tipoVehiculos = TipoVehiculo.objects.all()

    serializer = TipoVehiculoSerializer(tipoVehiculos, many=True)

    return render(request, 'tipoVehiculo.html', {'tipoVehiculos': serializer.data})
