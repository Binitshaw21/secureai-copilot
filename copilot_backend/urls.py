from django.contrib import admin
from django.urls import path
from scanner import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # The endpoint React will call to start a scan:
    path('api/scan/start/', views.start_scan, name='start_scan'),
]