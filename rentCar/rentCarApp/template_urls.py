from django.urls import path
from rentCarApp.view.auth_views import login_view, logout_view, loading_view
from rentCarApp.view.home_views import home_view
from rentCarApp.view.marcas_views import marcasView
from rentCarApp.view.modelos_views import modelosView
from rentCarApp.view.tipoVehiculo_views import tipoVehiculoView
from rentCarApp.view.tipoCombustible_views import tipoCombustibleView
from rentCarApp.view.vehiculos_views import vehiculoView
from rentCarApp.view.usuario_views import usuarioView
from rentCarApp.view.cliente_view import clienteView
from rentCarApp.view.empleado_view import empleadoView
from rentCarApp.view.inspeccion_view import inspeccionView

urlpatterns = [
    path('', login_view, name='login'),  
    path('home/', home_view, name='home'),  
    path('logout/', logout_view, name='logout'), 
    path('loading/', loading_view, name='loading'),
    path('marcas/', marcasView, name='marcasView'),
    path('modelos/', modelosView, name='modelosView'),
    path('tipoVehiculo/', tipoVehiculoView, name='tipoVehiculoView'),
    path('tipoCombustible/', tipoCombustibleView, name='tipoCombustibleView'),
    path('vehiculos/', vehiculoView, name='vehiculoView'),
    path('usuarios/', usuarioView, name='usuarioView'),
    path('clientes/', clienteView, name='clienteView'),
    path('empleados/', empleadoView, name='empleadoView'),
    path('inspecciones/', inspeccionView, name='inspeccionView'),
]
