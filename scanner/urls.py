from django.urls import path
from . import views

urlpatterns = [
    # We changed 'views.scan_url' to 'views.start_scan' to match your views.py!
    path('scan/', views.start_scan, name='scan'),
]