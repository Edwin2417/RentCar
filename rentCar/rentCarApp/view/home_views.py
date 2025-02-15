from django.shortcuts import redirect, render
from rentCarApp.decorators import login_required_custom 

@login_required_custom
def home_view(request):
    if not request.session.get('user_id'):
        return redirect('login') 
    
    user_name = request.user_name
    user_role = request.user_role

    return render(request, 'home.html', {'user_name': user_name, 'user_role': user_role})
