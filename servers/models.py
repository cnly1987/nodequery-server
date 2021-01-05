from django.db import models
from django.forms.models import model_to_dict
# Create your models here.
from users.models import Accounts

class Hosts(models.Model):
    user_id = models.IntegerField(blank=True, null=True)
    code = models.CharField(max_length=180)
    name = models.CharField(max_length=180)
    version = models.CharField(max_length=255, blank=True, null=True)
    uptime = models.FloatField(max_length=255, blank=True, null=True)
    sessions = models.CharField(max_length=255, blank=True, null=True)
    processes = models.CharField(max_length=255, blank=True, null=True)
    processes_array = models.TextField(blank=True, null=True)
    file_handles = models.CharField(max_length=255, blank=True, null=True)
    file_handles_limit = models.CharField(max_length=255, blank=True, null=True)
    os_kernel = models.CharField(max_length=255, blank=True, null=True)
    os_name = models.CharField(max_length=255, blank=True, null=True)
    os_arch = models.CharField(max_length=255, blank=True, null=True)
    cpu_name = models.CharField(max_length=255, blank=True, null=True)
    cpu_cores = models.CharField(max_length=255, blank=True, null=True)
    cpu_freq = models.CharField(max_length=255, blank=True, null=True)
    ram_total = models.FloatField(max_length=255, default=0,  null=True)
    ram_usage = models.FloatField(max_length=255, default=0,  null=True)
    swap_total = models.FloatField(max_length=255, default=0,  null=True)
    swap_usage = models.FloatField(max_length=255, default=0,  null=True)
    disk_array = models.TextField(blank=True, null=True)
    disk_total = models.FloatField(max_length=255, default=0,  null=True)
    disk_usage = models.FloatField(max_length=255, default=0,  null=True)
    connections = models.CharField(max_length=255, blank=True, null=True)
    nic = models.CharField(max_length=255, blank=True, null=True)
    ipv_4 = models.CharField(max_length=255, blank=True, null=True)
    ipv_6 = models.CharField(max_length=255, blank=True, null=True)
    rx = models.FloatField(max_length=255, default=0,  null=True)
    tx = models.FloatField(max_length=255, default=0,  null=True)
    rx_gap =models.FloatField(max_length=255, default=0,  null=True)
    tx_gap = models.FloatField(max_length=255, default=0,  null=True)
    loads = models.CharField(max_length=255, default=0,  null=True)
    load_cpu = models.FloatField(max_length=255, default=0,  blank=True, null=True)
    load_io = models.FloatField(max_length=255, default=0,  blank=True, null=True)
    load_system = models.FloatField(max_length=255, default=0,  blank=True, null=True)
    ping_eu = models.FloatField(max_length=255, default=0,  null=True)
    ping_us = models.FloatField(max_length=255, default=0,  null=True)
    ping_as = models.FloatField(max_length=255, default=0,  null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_notice = models.BooleanField(default=False)
    is_check = models.BooleanField(default=False)
    notice_load = models.IntegerField(default=80)
    notice_ram = models.IntegerField(default=80)
    notice_disk = models.IntegerField(default=80)

    have_notice = models.BooleanField(default=False)
    last_notice_at = models.DateTimeField(null=True)

    @property
    def notice_email(self):
        try:
            user = Accounts.objects.get(id=self.user_id)
            return user.email
        except Exception as e:
            print(e)
            return None

    def to_dict(self):
        host =  model_to_dict(self)
        host['updated_at'] = self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        host['notice_email'] = self.notice_email
        return host
    
    
    class Meta:
        # managed = False
        db_table = 'hosts'
        default_permissions = ()
        ordering = ['-id']
