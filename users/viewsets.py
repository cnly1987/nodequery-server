
from rest_framework import status, generics, viewsets
import django_filters.rest_framework
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django_filters import Filter, DateRangeFilter, DateFilter, FilterSet
import rest_framework_filters as filters
from .serializers import AccountsSerializer, GroupSerializer, PermissionSerializer
from django.contrib.auth.models import Group, Permission

from .models import Accounts


class AccountFilter(filters.FilterSet):

    username = filters.CharFilter(field_name='username', lookup_expr="icontains")
    level = filters.CharFilter(field_name='level', lookup_expr="icontains")
    # q = filters.CharFilter(field_name='cus_coding', lookup_expr="icontains" )

    class Meta:
        model = Accounts
        fields = ['is_active']

class AccountsViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAdminUser]

    queryset = Accounts.objects.all()
    serializer_class = AccountsSerializer
    # filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    # filter_fields = ('username', 'level','is_active')
    filter_class = AccountFilter

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    # filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filter_fields = ('name',)

class PermissionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    # filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filter_fields = ('name',)