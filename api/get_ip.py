import requests
from django.http import JsonResponse, HttpResponse

def get_ip_info(request):
    ip = request.GET.get('ip', None)
    if not ip:
        return JsonResponse({'msg':'ip needed'})
    headers = {
        "User-Agent":  "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
    }
    url = 'http://ip-api.com/json/{ip}?lang=zh-CN'.format(ip=ip)
    try:
        r = requests.get(url, headers=headers)
        return HttpResponse(r.text)
    except Exception as e:
        return JsonResponse({'msg':'ok'})