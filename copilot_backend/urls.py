from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Bring all your views in neatly at the very top!
from scanner.views import RegisterView, get_scan_history, create_subscription

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- Authentication Doors ---
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --- Dashboard Features ---
    path('api/history/', get_scan_history, name='history'),
    path('api/subscribe/', create_subscription, name='subscribe'),
    
    # --- The AI Scanner Engine ---
    # This tells Django to look inside scanner/urls.py for the 'scan/' path!
    path('api/', include('scanner.urls')), 
]