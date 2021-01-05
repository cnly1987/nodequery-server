from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from servers.viewset import HostsViewSet

from users import auth

from .records import get_host_records, delete_records_by_host
from .get_ip import get_ip_info
from .user import sigup

router = DefaultRouter()
router.register(r'hosts', HostsViewSet)

urlpatterns = [
    path('auth', auth.AuthToken.as_view(), name='authentication'),
    path('api-auth/', include('rest_framework.urls')),
    path('records/<int:host_id>/', get_host_records),
    path('records/delete/<int:host_id>/', delete_records_by_host),
    path('ip', get_ip_info),
    path('user/sigup/', sigup),
    path('', include(router.urls)),
]