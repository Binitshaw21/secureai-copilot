from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # This tells the Django admin panel to show your custom fields!
    fieldsets = UserAdmin.fieldsets + (
        ('Security & Roles', {'fields': ('role', 'is_email_verified', 'is_2fa_enabled')}),
        ('Billing', {'fields': ('subscription_plan',)}),
        ('OTP Verification', {'fields': ('otp_code', 'otp_created_at')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
