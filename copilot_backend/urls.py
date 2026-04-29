from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse # <-- Add this import
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from scanner.views import RegisterView, get_scan_history, create_subscription

# --- A simple health check function ---
def api_root(request):
    return JsonResponse({"status": "SecureAI Copilot Backend is LIVE and completely functional! 🚀"})

urlpatterns = [
    # --- The New Homepage ---
    path('', api_root, name='api_root'), 

    path('admin/', admin.site.urls),
    
    # --- Authentication Doors ---
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --- Dashboard Features ---
    path('api/history/', get_scan_history, name='history'),
    path('api/subscribe/', create_subscription, name='subscribe'),
    
    # --- The AI Scanner Engine ---
    path('api/', include('scanner.urls')), 
]