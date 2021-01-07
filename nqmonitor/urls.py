"""nqmonitor URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
 
from users.auth import AuthToken, login, logout, sigup
from api.get_data import main as agent_api


def index(request):
    return render(request, 'index.html')


@login_required
def dashboard(request):
    return render(request, 'hosts/list.html')

urlpatterns = [
    path('', index),
    path('login/', login),
    path('logout/', logout),
    path('sigup/', sigup),
    path('dashboard/', dashboard),
    path('auth', AuthToken.as_view(), name='authentication'),
    path('admin/', admin.site.urls),
    path('hosts/', include('servers.urls')),
    path('api/agent.json', agent_api),
    path('api/v1/', include('api.router')),
]   

urlpatterns += staticfiles_urlpatterns()