from django.shortcuts import redirect, render
from functools import wraps

def login_required_custom(view_func):
    """Decorador para verificar si el usuario ha iniciado sesión antes de acceder a una vista."""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.session.get('user_id'):  
            return redirect('login') 
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def admin_required(view_func):
    """Decorador que permite el acceso solo a administradores."""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.session.get('user_id'):  
            return redirect('login')  
        
        if request.session.get('user_role') != 1:  
            return render(request, 'no_permisos.html')  
        return view_func(request, *args, **kwargs) 
    return _wrapped_view
