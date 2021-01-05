from django.http import Http404
from django.db.models import Q

from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from django_filters.rest_framework import DjangoFilterBackend 
# from rest_framework_filters.backends import  DjangoFilterBackend as rsf_DjangoFilterBackend
# from django_filters import DateRangeFilter,DateFilter,FilterSet
from rest_framework.filters import SearchFilter, OrderingFilter 
from django.db.models import Q

import rest_framework_filters as filters


from .models import Hosts
from .serializers import HostsSerializer


class HostsViewSet(viewsets.ModelViewSet):
	queryset = Hosts.objects.all()
	serializer_class = HostsSerializer
	filter_backends = ( DjangoFilterBackend, SearchFilter, OrderingFilter)
	filter_fields = ['user_id', 'code', 'name']

	def get_queryset(self):
		if self.request.user.is_superuser:
			queryset = Hosts.objects.all()
		else:
			queryset = self.queryset.filter(user_id=self.request.user.id)
		return queryset

	def create(self, request, *args, **kwargs):
		order = request.data.copy()
		# ex_hosts = self.objects.filter(user_id=request.user.id).count()
		# if ex_hosts >= 100 and not request.user.is_superuser:
		# 	return Response({'msg':'最多只能创建100台服务器'}, status=status.HTTP_403_FORBIDDEN, headers=headers)
		#This QueryDict instance is immutable(意思是无法被更改),所以COPY一份，不管通过接口提交人是谁，全部设置为提交TOKEN的用户
		order.update({'user_id': request.user.id })
		serializer = self.get_serializer(data=order)
		serializer.is_valid(raise_exception=True)
		self.perform_create(serializer)
		headers = self.get_success_headers(serializer.data)
		return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

	
