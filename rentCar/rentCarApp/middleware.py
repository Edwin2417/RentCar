from django.utils.deprecation import MiddlewareMixin

EXCLUDED_URLS = ['/login/', '/logout/', '/api/']

class UserSessionMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.session.get('user_name'):
            request.user_name = request.session.get('user_name')
            request.user_role = request.session.get('user_role')
        else:
            request.user_name = None
            request.user_role = None
