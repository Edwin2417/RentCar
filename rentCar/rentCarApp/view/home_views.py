from django.shortcuts import redirect, render

def home_view(request):
    if not request.session.get('user_id'):
        return redirect('login')  # Redirige al login si no hay sesión

    # Recuperar información del usuario desde la sesión
    user_name = request.session.get('user_name')
    user_role = request.session.get('user_role')

    return render(request, 'home.html', {'user_name': user_name, 'user_role': user_role})
