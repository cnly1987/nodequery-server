
from rest_framework.decorators import api_view,  renderer_classes 
from rest_framework.response import Response
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from django.core.mail import send_mail

from urllib import parse
from bson import ObjectId

from libs.encode import encodeQuery

from servers.models import Hosts
from libs.mg.query import  mgdb

from datetime import datetime, timedelta
import calendar
from servers.tasks import delete_records_by_host_task


def get_range_time():
    now = datetime.now()
    hours_ago = [(datetime.now() - timedelta(hours = 1)), now]
    days_ago = [(datetime.now() - timedelta(hours = 24)), now]
    month_ago  = [(datetime.now() - timedelta(days=calendar.monthrange(datetime.now().year,datetime.now().month)[1])),  now]
    year_ago  = [(datetime.now() - timedelta(days = 365)), now]

    return {
        'hours_ago':hours_ago,
        'month_ago':month_ago,
        'days_ago':days_ago,
        'year_ago':year_ago,
    }

def recordsqeury(host_id):
    time_zone = get_range_time()
    # mdb = mongo_db()
    try:
        db = mgdb()
        collection = db['nqmonitor']['records']
        hours = {
            "where":{'host_id': host_id, "updated_at":{"$gt":time_zone['hours_ago'][0],"$lt":time_zone['hours_ago'][1] } }, 
            "fields":{
                'host_id':1,'rx':1, 'tx':1, 'rx_gap':1, 'tx_gap':1, '_id':0, 'updated_at':1, 'ping_us':1, 'ping_eu':1, 'ping_as':1,
                'ram_usage':1, 'disk_usage':1,'loads':1,'load_cpu':1, 'load_io':1, 'swap_usage':1
            }
        }
        days =[
                { 
                "$match":{
                    "host_id":host_id,
                        "updated_at":{"$gt":time_zone['days_ago'][0],"$lt":time_zone['days_ago'][1] }
                    }
                },
                {
                    "$addFields": {
                        "created_date": { "$dateToParts": { "date": { "$toDate": { "$toLong": "$updated_at" } } } },
                        "system_load":  {"$arrayElemAt":[ { "$split": ["$loads" , " "]}, 1] } 
                    }
                }, 
                { "$group": {
                    "_id": {
                        "customerId": "$host_id",
                        "hour": "$created_date.hour",
                        "day": "$created_date.day",
                        "month": "$created_date.month",
                        "year": "$created_date.year"
                    },
                    "rx_gap": { "$avg": "$rx_gap" },
                        "tx_gap": { "$avg": "$tx_gap" },
                        "rx": { "$avg": "$rx" },
                        "tx": { "$avg": "$tx" },
                        "ram_usage": { "$avg": "$ram_usage" },
                        "swap_usage": { "$avg": "$swap_usage" },
                        "disk_usage": { "$avg": "$disk_usage" },
                        "load_io": { "$avg": "$load_io" },
                        "load_cpu": { "$avg": "$load_cpu" },
                        "ping_eu": { "$avg": "$ping_eu" },
                        "ping_us": { "$avg": "$ping_us" },
                        "ping_as": { "$avg": "$ping_as" },
                        "system_load": {"$avg": {"$toDouble":"$system_load"}   }
                }},
                { "$group": {
                    "_id": {
                        "customerId": "$_id.host_id", 
                    },
                    "hours": { 
                        "$push": { 
                            "day": "$_id.day",
                            "hour": "$_id.hour",
                            "updated_at": { "$concat": [ { "$toString": "$_id.year" } , "-", { "$toString": "$_id.month" }, "-", { "$toString": "$_id.day" }, " ", 
                                        { "$toString": "$_id.hour" }, ":00:00" ] },
                            "rx_gap": "$rx_gap",
                            "tx_gap": "$tx_gap",
                            "rx": "$rx",
                            "tx": "$tx",
                            "ram_usage": "$ram_usage",
                            "swap_usage": "$swap_usage",
                            "disk_usage": "$disk_usage",
                            "load_io": "$load_io",
                            "load_cpu": "$load_cpu",
                            "ping_eu": "$ping_eu",
                            "ping_us": "$ping_us",
                            "ping_as": "$ping_as",
                            "system_load":"$system_load"
                        }
                    }
                }}, 
            ]
        months = [
                    { 
                    "$match":{
                        "host_id":host_id,
                        "updated_at":{"$gt":time_zone['month_ago'][0],"$lt":time_zone['month_ago'][1] }
                        }
                    },
                    {
                        "$addFields": {
                            "created_date": { "$dateToParts": { "date": { "$toDate": { "$toLong": "$updated_at" } } } },
                            "system_load":  {"$arrayElemAt":[ { "$split": ["$loads" , " "]}, 1] } 
                        }
                    }, 
                    { "$group": {
                        "_id": {
                            "customerId": "$host_id", 
                            "day": "$created_date.day",
                            "month": "$created_date.month",
                            "year": "$created_date.year"
                        },
                        "rx_gap": { "$avg":{"$toDouble":"$rx_gap"}  },
                        "tx_gap": { "$avg": "$tx_gap" },
                        "rx": { "$avg": "$rx" },
                        "tx": { "$avg": "$tx" },
                        "ram_usage": { "$avg": "$ram_usage" },
                        "swap_usage": { "$avg": "$swap_usage" },
                        "disk_usage": { "$avg": "$disk_usage" },
                        "load_io": { "$avg": "$load_io" },
                        "load_cpu": { "$avg": "$load_cpu" },
                        "ping_eu": { "$avg": "$ping_eu" },
                        "ping_us": { "$avg": "$ping_us" },
                        "ping_as": { "$avg": "$ping_as" },
                        "system_load": {"$avg": {"$toDouble":"$system_load"}   }
                    }},
                    { "$group": {
                        "_id": {
                            "customerId": "$_id.host_id", 
                        },
                        "months": { 
                            "$push": { 
                                "day": "$_id.day",
                                "month": "$_id.month",
                                "updated_at": { "$concat": [ { "$toString": "$_id.year" } , "-", { "$toString": "$_id.month" }, "-", { "$toString": "$_id.day" } ] },
                                "rx_gap": "$rx_gap",
                                "tx_gap": "$tx_gap",
                                "rx": "$rx",
                                "tx": "$tx",
                                "ram_usage": "$ram_usage",
                                "swap_usage": "$swap_usage",
                                "disk_usage": "$disk_usage",
                                "load_io": "$load_io",
                                "load_cpu": "$load_cpu",
                                "ping_eu": "$ping_eu",
                                "ping_us": "$ping_us",
                                "ping_as": "$ping_as",
                                "system_load": "$system_load",
                            }
                        }
                    }}, 
            ]
        hours_data = collection.find(hours['where'], hours['fields'])
        days_data = list(collection.aggregate(days))
        months_data = list(collection.aggregate(months))
        
        hours_res = []
        for i in hours_data:
            hours_res.append(i)
        
        days_res =  days_data[0]['hours']
        months_res =  months_data[0]['months'] 
        return {
            'hours':{"count":len(hours_res), "results":hours_res},
            'days':{"count":len(days_res), "results":days_res},
            'months':{"count":len(months_res), "results":months_res},
        }
        db.close()
    except:
        return {}
        db.close()

@api_view(['GET', 'POST'])
@renderer_classes([JSONRenderer])
def get_host_records(request, host_id):
    user = request.user
    if user.is_superuser:
        host = Hosts.objects.filter(id=host_id)
    else:
        host = Hosts.objects.filter(id=host_id, user_id=user.id)
    if not host:
        return Response('error :host not found or is not yours!',status=status.HTTP_404_NOT_FOUND)
    try:
        res = recordsqeury(host_id) 
        return Response({'host':host[0].to_dict(), 'records':res})
    except Exception as e:
        print(e)
        return Response('error :please contact admin!',status=status.HTTP_404_NOT_FOUND)



@api_view(['DELETE'])
@renderer_classes([JSONRenderer])
def delete_records_by_host(request, host_id):
    res = delete_records_by_host_task(host_id)
    return Response('delete task is running')


