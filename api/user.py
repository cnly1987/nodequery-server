
from rest_framework.decorators import api_view,  renderer_classes, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from users.models import Accounts
from django.db.models import Q

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def sigup(request):
    data = request.data
    username = data['username'] if data['username'] else None
    password = data['password'] if data['password'] else None
    email = data['email'] if data['email'] else None
    print(username, email, password)
    # return Response({'msg':'ok' })
    if username and email:
        try:
            user_count = Accounts.objects.filter(username=username).count()
            email_count = Accounts.objects.filter(email=email).count()
            if user_count >= 1:
                return Response({'msg':'用户名已经存在.',}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            elif email_count >= 1:
                return Response({'msg':'邮箱已经存在.',}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            user = Accounts(username=username, email=email)
            user.set_password(password)
            user.save()
            return Response({'msg':'ok' })
        except Exception as e:
            print(e)
            return Response({'msg':'error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({'msg':'username  and email required'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
