
import json

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login as auth_login,logout as auth_logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework.authtoken.views import ObtainAuthToken
 
@csrf_exempt
def sigup(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/dashboard/')
    return render(request, 'sigup.html')

@csrf_exempt
def login(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return HttpResponseRedirect('/dashboard/')
        return render(request, 'login.html')
    elif request.method == 'POST':
        username = request.POST.get('username', None)
        password = request.POST.get('password', None)
        user = authenticate(username=username,password=password)
        print(user)
        if user and user is not None:
            try:
                auth_login(request, user)
                return HttpResponseRedirect('/dashboard')
            except Exception as e:
                print(e)
        return render(request, 'login.html')


@login_required
def logout(request):
    auth_logout(request)
    return  HttpResponseRedirect('/login')



class AuthToken(ObtainAuthToken):
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.serializer_class(data=request.data,  context={'request': request})
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'uid': user.pk, 
                'username': user.username,
                'user':user.to_dict
            })
        except Exception as e:
            print(e)
            return Response({'msg':'error'}, status=401)


# @api_view
# def refreshToken(request):
#     if request.method == 'POST':
#         username = request.user.username
#         try:
#             user = Accounts.objects.get(username=username)
#             token = user.refreshToken()
#             return Response({
#                 'token': token.key,
#                 'uuid': user.pk, 
#                 'username': user.username, 
#             })
#         except:
#             return HttpResponse(json.dumps({'msg':'user error'}), status=400, content_type="application/json")
#     else:
#         msg = {'error':'post needed!'}
#         return HttpResponse(json.dumps(msg), status=400, content_type="application/json")

