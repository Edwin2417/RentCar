from django.shortcuts import render, redirect
from django.contrib import messages
from django.utils.timezone import now
import requests

API_URL = 'http://127.0.0.1:8000/api/usuario/'  # URL de la API de usuarios

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        if not username:
            messages.error(request, 'El campo de usuario no puede estar vacío.')
        elif not password:
            messages.error(request, 'El campo de contraseña no puede estar vacío.')
        else:
            try:
                response = requests.get(API_URL)
                if response.status_code == 200:
                    users = response.json()
                    user = next((u for u in users if u['nombre_usuario'] == username), None)
                    if user and user['contrasena'] == password:
                        request.session['user_id'] = user['identificador']
                        request.session['user_name'] = user['nombre_usuario']
                        request.session['user_role'] = user['rol']
                        request.session.set_expiry(60 * 60 * 24 * 7)  # Sesión expira en 7 días
                        # Redirigir al loading
                        return redirect('loading')
                    elif user:
                        messages.error(request, 'Contraseña incorrecta.')
                    else:
                        messages.error(request, 'Usuario no encontrado.')
                else:
                    messages.error(request, 'Error al comunicarse con la API.')
            except Exception as e:
                messages.error(request, f'Ocurrió un error: {str(e)}')

    return render(request, 'login.html')


def loading_view(request):
    return render(request, 'loading.html')


def logout_view(request):
    request.session.flush()
    messages.success(request, 'Sesión cerrada con éxito.')
    return redirect('login')
