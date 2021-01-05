from datetime import datetime

from celery.decorators import task
from celery.utils.log import get_task_logger
from libs.mg.query import  mgdb

logger = get_task_logger(__name__)


@task(name="delete_records_by_host_task")
def delete_records_by_host_task(host_id):
    try:
        db = mgdb()
        collection = db['nqmonitor']['records']
        collection.remove({'host_id':host_id})
        return True
    except:
        return False

@task(name="send_resrouce_notice_email")
def send_notice_email(to_email:str, host:dict):
    """发送提醒邮件"""
    subject = "MonitorX Notice: '{name}' has high resource consumption".format(**host)
    message = ""
    sender = settings.DEFAULT_FROM_EMAIL
    receiver = [to_email]
    host['ram_p'] = round(host['ram_usage']/host['ram_total']*100, 2)
    host['disk_p'] = round(host['disk_usage']/host['disk_total']*100, 2)
    host['sys_p'] = host['load_system'] if host['load_system'] <=100 else 100
    html_message = '''
        <p style="font-size:18px; color:"#500050">Hello, It seems one of your servers is consuming a lot of resources.</p>
        <div style="padding-bottom:20px">
            <p style="font-size:18px; color:"#500050">Server:{name}</p>
            <p>Last Update:{updated_at}</p>
        </div>
        <div style="padding-bottom:20px">
            <p>Average:{loads}</p>
            <p>System Load:{sys_p}%</p>
            <p>Ram Usage:{ram_p}%</p>
            <p>Disk Usage:{disk_p}%</p>
        </div>
        <div>
            If you don't want to receive alerts anymore, log into your account and edit the notification settings for your server.<br>
            Feel free to reply to this message if you are experiencing problems with our services.<br>
            Thanks,<br>
            MonitorX
        </div>
    '''.format(**host)
    logger.info("Sent notice email:"+to_email)
    return send_mail(subject, message, sender, receiver, html_message=html_message, fail_silently=False)


@task(name="send_download_notice_email")
def send_notice_email(to_email:str, host:dict):
    """发送提醒邮件"""
    subject = "MonitorX Notice: '{name}' is not responding".format(**host)
    message = ""
    sender = settings.DEFAULT_FROM_EMAIL
    receiver = [to_email]
    host['now'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    html_message = '''
        <p style="font-size:18px; color:"#500050">Hello, It seems one of your servers is not responding anymore.</p>
        <div style="padding-bottom:20px">
            <p style="font-size:18px; color:"#500050">Server:{name}</p>
            <p>Last Update:{updated_at}</p>
            <p>Alert Trigge:{now}</p>
        </div>
        <div>
            If you don't want to receive alerts anymore, log into your account and edit the notification settings for your server.<br>
            Feel free to reply to this message if you are experiencing problems with our services.<br>
            Thanks,<br>
            MonitorX
        </div>
    '''.format(**host)
    logger.info("Sent notice email:"+to_email)
    return send_mail(subject, message, sender, receiver, html_message=html_message, fail_silently=False)