from rest_framework import serializers
from .models import Hosts


class HostsSerializer(serializers.ModelSerializer):

    notice_email = serializers.ReadOnlyField()
    class Meta:
        model = Hosts
        fields = '__all__'