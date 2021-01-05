from datetime import datetime
import json

from django.db import models
from django.contrib.auth.models import User, Group, AbstractUser, Permission
from django.contrib.sessions.models import Session
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.forms.models import model_to_dict


class Accounts(AbstractUser):
    phone = models.CharField(max_length=20, null=True, blank=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    email = models.CharField(max_length=100, unique=True)
    tel = models.CharField(max_length=100, null=True, blank=True)
    qq = models.CharField(max_length=100, null=True, blank=True)
    wechat = models.CharField(max_length=100, null=True, blank=True)
    company = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    level = models.IntegerField(default=0)


    def __str__(self):
        return self.username

   

    @property
    def get_group(self):
        group_name = self.groups.all()
        groups = [i.name for i in group_name]
        return groups

    @property
    def list_permissions(self):
        permissions = list(self.get_all_permissions())
        return permissions

    @property
    def get_token(self):
        token = Token.objects.get(user_id=self.id)
        return 'Token ' + token.key

    @property
    def to_dict(self):
        return model_to_dict(self, exclude=['password'])


    def refreshToken(self):
        Token.objects.get(user_id=self.id).delete()
        token = Token.objects.create(user=self)
        return  token.key


    class Meta:
        default_permissions = ()


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)




class VerifyCode(models.Model):
    """
    短信验证码
    """
    code = models.CharField(max_length=10, verbose_name="验证码")
    mobile = models.CharField(max_length=11, verbose_name="电话")
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")
    status = models.BooleanField(default=True)

    class Meta:
        default_permissions = ()

    def __str__(self):
        return self.code









