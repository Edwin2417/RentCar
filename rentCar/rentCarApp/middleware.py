# middleware.py
from django.utils.deprecation import MiddlewareMixin

class UserSessionMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Si hay información de usuario en la sesión, hacerla accesible en las plantillas
        if request.session.get('user_name'):
            request.user_name = request.session.get('user_name')
            request.user_role = request.session.get('user_role')
        else:
            request.user_name = None
            request.user_role = None
