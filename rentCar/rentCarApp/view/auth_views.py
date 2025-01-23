import requests
from django.shortcuts import render, redirect
from django.contrib import messages

API_URL = 'http://127.0.0.1:8000/api/usuario/'  # URL de la API de usuarios

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Validar campos vacíos
        if not username:
            messages.error(request, 'El campo de usuario no puede estar vacío.')
        elif not password:
            messages.error(request, 'El campo de contraseña no puede estar vacío.')
        else:
            try:
                # Hacer una petición a la API para obtener los usuarios
                response = requests.get(API_URL)
                if response.status_code == 200:
                    users = response.json()
                    
                    # Buscar el usuario en la respuesta de la API
                    user = next((u for u in users if u['nombre_usuario'] == username), None)
                    if user:
                        if user['contrasena'] == password:  # Validar contraseña (no encriptada)
                            # Guardar información del usuario en la sesión
                            request.session['user_id'] = user['identificador']
                            request.session['user_name'] = user['nombre_usuario']
                            request.session['user_role'] = user['rol']

                            # Redirigir al home si las credenciales son correctas
                            return redirect('home')
                        else:
                            messages.error(request, 'Contraseña incorrecta.')
                    else:
                        messages.error(request, 'Usuario no encontrado.')
                else:
                    messages.error(request, 'Error al comunicarse con la API. Inténtalo más tarde.')
            except Exception as e:
                messages.error(request, f'Ocurrió un error: {str(e)}')

    return render(request, 'login.html')
