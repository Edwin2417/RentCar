from django.urls import re_path
from rentCarApp import views
# from rentCarApp.view import auth_views, home_views

urlpatterns = [
    # re_path('', auth_views.login_view, name='login'),  # Página de inicio (login)
    # re_path('home/', home_views.home_view, name='home'),
    
    # API endpoints for Marca
    re_path(r'^marca/$', views.marcaApi),
    re_path(r'^marca/([0-9]+)$', views.marcaApi),
    # API endpoints for Estado
    re_path(r'^estado/$', views.estadoApi),
    re_path(r'^estado/([0-9]+)$', views.estadoApi),

    # API endpoints for Vehiculo
    re_path(r'^vehiculo/$', views.vehiculoApi),
    re_path(r'^vehiculo/([0-9]+)/$', views.vehiculoApi),

    # API endpoints for RentaDevolucion
    re_path(r'^rentaDevolucion/$', views.rentaDevolucionApi),
    re_path(r'^rentaDevolucion/([0-9]+)$', views.rentaDevolucionApi),

    # API endpoints for Rol
    re_path(r'^rol/$', views.rolApi),
    re_path(r'^rol/([0-9]+)$', views.rolApi),

    # API endpoints for Usuario
    re_path(r'^usuario/$', views.usuarioApi),
    re_path(r'^usuario/([0-9]+)$', views.usuarioApi),

    # API endpoints for Empleado
    re_path(r'^empleado/$', views.empleadoApi),
    re_path(r'^empleado/([0-9]+)$', views.empleadoApi),

    # API endpoints for Cliente
    re_path(r'^cliente/$', views.clienteApi),
    re_path(r'^cliente/([0-9]+)$', views.clienteApi),

    # API endpoints for TipoVehiculo
    re_path(r'^tipoVehiculo/$', views.tipoVehiculoApi),
    re_path(r'^tipoVehiculo/([0-9]+)$', views.tipoVehiculoApi),

    # API endpoints for Modelo
    re_path(r'^modelo/$', views.modeloApi),
    re_path(r'^modelo/([0-9]+)$', views.modeloApi),

    # API endpoints for TipoCombustible
    re_path(r'^tipoCombustible/$', views.tipoCombustibleApi),
    re_path(r'^tipoCombustible/([0-9]+)$', views.tipoCombustibleApi),

    # API endpoints for Inspeccion
    re_path(r'^inspeccion/$', views.inspeccionApi),
    re_path(r'^inspeccion/([0-9]+)$', views.inspeccionApi),
]
