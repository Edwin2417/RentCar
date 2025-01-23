from django.urls import path
from rentCarApp.view.auth_views import login_view, logout_view
from rentCarApp.view.home_views import home_view

urlpatterns = [
    path('', login_view, name='login'),  # Página de inicio de sesión
    path('home/', home_view, name='home'),  # Página principal después del login
    path('logout/', logout_view, name='logout'),  # Cerrar sesión
]
