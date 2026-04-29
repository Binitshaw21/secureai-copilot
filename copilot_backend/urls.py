from django.contrib import admin
from django.urls import path, include
from scanner.views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- Authentication Doors ---
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'), # SimpleJWT handles this automatically!
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --- Your Scanner Apps ---
    path('api/', include('scanner.urls')), 
]
from scanner.views import get_scan_history

# ... inside your urlpatterns list, add this line:
path('api/history/', get_scan_history),