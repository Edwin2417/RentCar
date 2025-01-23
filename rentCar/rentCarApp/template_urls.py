from django.urls import path
from rentCarApp.view.auth_views import login_view
from rentCarApp.view.home_views import home_view

urlpatterns = [
    path('', login_view, name='login'),  # Página de inicio (login)
    path('home/', home_view, name='home'),  # Página principal después de login
]
