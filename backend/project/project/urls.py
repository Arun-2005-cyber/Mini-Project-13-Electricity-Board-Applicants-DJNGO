from django.urls import path, include
from django.contrib import admin
from app import views 

urlpatterns = [
    path('admin/', admin.site.urls), 
    path('api/', include('app.urls')), 
    path('', views.index, name='index'),
]
