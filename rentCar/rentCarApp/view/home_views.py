# views.py
from django.shortcuts import redirect, render

def home_view(request):
    if not request.session.get('user_id'):
        return redirect('login')  # Redirige al login si no hay sesión

    # No es necesario recuperar manualmente los valores del usuario
    # ya que el middleware ya los agrega a request.
    user_name = request.user_name
    user_role = request.user_role

    return render(request, 'home.html', {'user_name': user_name, 'user_role': user_role})
