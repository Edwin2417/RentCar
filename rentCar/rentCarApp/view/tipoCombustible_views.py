from django.shortcuts import render
from django.http import JsonResponse
from rentCarApp.models import TipoCombustible
from rentCarApp.serializers import TipoCombustibleSerializer

def tipoCombustibleView(request):

    tipoCombustibles = TipoCombustible.objects.all()

    serializer = TipoCombustibleSerializer(tipoCombustibles, many=True)

    return render(request, 'tipoCombustible.html', {'tipoCombustibles': serializer.data})
