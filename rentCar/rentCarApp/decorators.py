from django.shortcuts import redirect, render
from functools import wraps

def login_required_custom(view_func):
    """Decorador para verificar si el usuario ha iniciado sesión antes de acceder a una vista."""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.session.get('user_id'):  # Verifica si la sesión tiene un usuario autenticado
            return redirect('login')  # Redirige a la página de login si no está autenticado
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def admin_required(view_func):
    """Decorador que permite el acceso solo a administradores."""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.session.get('user_id'):  # Primero verifica si el usuario ha iniciado sesión
            return redirect('login')  # Si no hay sesión, redirige al login
        
        if request.session.get('user_role') != 1:  # Verifica si el usuario es admin
            return render(request, 'no_permisos.html')  # Muestra la página de error

        return view_func(request, *args, **kwargs)  # Si es admin, permite el acceso
    return _wrapped_view
