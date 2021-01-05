from rest_framework import serializers
from django.contrib.auth.models import Group, Permission

from .models import Accounts, Ticket, TicketType, TicketRecord


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'


class AccountsSerializer(serializers.ModelSerializer):
    get_group = serializers.ReadOnlyField()

    class Meta:
        model = Accounts
        # fields = ('id', 'username', 'email', 'chinese_name', 'sex','birthday')
        # fields = '__all__'
        exclude = ('user_permissions',)
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
            instance.save()
        if groups is not None:
            for group in groups:
                instance.groups.add(group)
            instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in list(validated_data.items()):
            if attr == 'password':
                instance.set_password(value)
            elif attr == 'groups':
                instance.groups.clear()
                groups = validated_data.pop('groups', None)
                for i in groups:
                    instance.groups.add(i)
            else:
                setattr(instance, attr, value)
            instance.save()
        return instance