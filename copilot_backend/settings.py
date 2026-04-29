"""
Django settings for copilot_backend project.
"""

import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-^3r9*9c#cafi#n*&-gh=vqg$3h%5$2lj0i1l#q2g^_e)fn2=j@'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'scanner',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'copilot_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'copilot_backend.wsgi.application'


# --- DATABASE CONFIGURATION (Hardcoded to bypass Vercel glitch) ---
DATABASES = {
    'default': dj_database_url.parse(
        "postgresql://neondb_owner:npg_3zRFTspAxah6@ep-billowing-paper-am1v4fug-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
        conn_max_age=600
    )
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://secureai-copilot-8pvc.vercel.app",
    "https://secureai-copilot-dlp4.vercel.app" 
]

# Authentication Configuration
AUTH_USER_MODEL = 'scanner.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60), 
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),    
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --- RAZORPAY SETTINGS (Hardcoded to bypass Vercel glitch) ---
RAZORPAY_KEY_ID = 'rzp_test_SjDvirFREAQxKp'
RAZORPAY_KEY_SECRET = 'lH7a8Nqw4EHJnYRVC4fnNLf6'