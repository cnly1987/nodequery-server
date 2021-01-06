
from rest_framework.decorators import api_view, permission_classes, renderer_classes 
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer

from urllib import parse

from libs.encode import encodeQuery


from servers.models import Hosts
from libs.mg.query import mgdb

import datetime as dts
from datetime import datetime

from servers.tasks import send_notice_email

def host_load_check(host:dict)->bool:
    ram_pt = round(host['ram_usage']/host['ram_total']*100, 2)
    disk_pt = round(host['disk_usage']/host['disk_total']*100, 2)
    sys_pt = host['load_system'] if host['load_system'] <=100 else 100
    res_list = [
        True if ram_pt>=host['notice_ram'] else False,
        True if disk_pt>=host['notice_disk'] else False,
        True if sys_pt>=host['notice_load'] else False,
    ]
    if True in res_list and host["is_notice"]:
        if host["is_notice"]:
            d1 = host['last_notice_at']
            difference = datetime.now() - d1
            diff = round(difference.total_seconds()/3600,2)
            return True if diff >6 else False
        else:
            return True
    return False


def host_save(token, data):
    host = Hosts.objects.filter(code=token)
    host.update(**data)
    return [host[0].to_dict(), host]

def mongo_save(data):
    db = mgdb()
    collection = db['nqmonitor']['records']
    collection.insert(data)
    db.close()

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@renderer_classes([JSONRenderer])
def main(request):
    if request.method == 'POST':
        user = request.user
        res = "http://www.default.com/default.html?"+request.body.decode('utf-8') 
        data = dict(parse.parse_qsl(parse.urlsplit(res).query))
        token = data['token']
        sdata = encodeQuery(data['data'].split(' '))
        sdata['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        # print(token,sdata)
        try:
            # 更新host数据
            hosts = Hosts.objects.filter(code=token)
            hosts.update(**sdata)
            host = hosts[0].to_dict()
            # 保存记录到mongodb
            mdata = sdata.copy()
            mdata['updated_at'] = datetime.now()
            mdata['host_id'] = host['id']
            mongo_save(mdata)
            # 检查
            check = host_load_check(host)
            if check:
                print(host['name'], check)
                hosts.update(is_notice=True, last_notice_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                send_notice_email(host['notice_email'], host)
            return Response(res)
        except Exception as e:
            print(e)
            return Response({'msg':'error'})
    else:
        return Response({'msg':'post only!'})


