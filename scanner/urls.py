from django.urls import path
from . import views

urlpatterns = [
    # This catches the exact "/api/scan/" request from your React frontend!
    path('scan/', views.scan_url, name='scan'),
]