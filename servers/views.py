from django.shortcuts import render
from django.contrib.auth.decorators import login_required
# Create your views here.

from servers.models import Hosts

@login_required
def lists(request):
    return render(request, 'hosts/list.html')

@login_required
def detail(request, host_id):
    host = Hosts.objects.get(id=host_id)
    return render(request, 'hosts/detail.html', {'host':host})