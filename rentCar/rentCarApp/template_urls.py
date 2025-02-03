from django.urls import path
from rentCarApp.view.auth_views import login_view, logout_view, loading_view
from rentCarApp.view.home_views import home_view
from rentCarApp.view.marcas_views import marcasView
from rentCarApp.view.modelos_views import modelosView
from rentCarApp.view.tipoVehiculo_views import tipoVehiculoView
from rentCarApp.view.tipoCombustible_views import tipoCombustibleView
from rentCarApp.view.vehiculos_views import vehiculoView
from rentCarApp.view.usuario_views import usuarioView

urlpatterns = [
    path('', login_view, name='login'),  # Página de inicio de sesión
    path('home/', home_view, name='home'),  # Página principal después del login
    path('logout/', logout_view, name='logout'),  # Cerrar sesión
    path('loading/', loading_view, name='loading'),
    path('marcas/', marcasView, name='marcasView'),
    path('modelos/', modelosView, name='modelosView'),
    path('tipoVehiculo/', tipoVehiculoView, name='tipoVehiculoView'),
    path('tipoCombustible/', tipoCombustibleView, name='tipoCombustibleView'),
    path('vehiculos/', vehiculoView, name='vehiculoView'),
    path('usuarios/', usuarioView, name='usuarioView'),
]
