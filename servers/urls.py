from django.urls import path, include

from .views import detail, lists
urlpatterns = [
    path('lists/', lists),
    path('detail/<int:host_id>/', detail),
 
]   
