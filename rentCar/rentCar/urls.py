from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutas del API
    path('api/', include('rentCarApp.api_urls')),

    # Rutas para las vistas con templates
    path('', include('rentCarApp.template_urls')),
]
