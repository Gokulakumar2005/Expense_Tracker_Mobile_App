import os
import re
from pathlib import Path
from datetime import timedelta
import dotenv
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

# Load environment variables (checks backend/.env first, then root .env)
backend_env_path = BASE_DIR / '.env'
root_env_path = ROOT_DIR / '.env'

if backend_env_path.exists():
    dotenv.load_dotenv(backend_env_path)
elif root_env_path.exists():
    dotenv.load_dotenv(root_env_path)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-pockettrack-default-dev-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't', 'yes')

allowed_hosts_env = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,10.0.2.2')
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local apps
    'apps.accounts.apps.AccountsConfig',
    'apps.transactions.apps.TransactionsConfig',
    'apps.budgets.apps.BudgetsConfig',
    'apps.dashboard.apps.DashboardConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database
# Cloud DATABASE_URL takes precedence; falls back to local PostgreSQL parameters
database_url = os.getenv('DATABASE_URL')
if database_url:
    # If the user provides the internal Render hostname without domain on external host,
    # route automatically to the active Render Singapore regional hostname
    if '@dpg-' in database_url and not any(d in database_url for d in ['.render.com', '.com', '.net', '.org', '.io']):
        database_url = re.sub(r'(@dpg-[a-z0-9\-]+)([:/])', r'\1.singapore-postgres.render.com\2', database_url)
        if '?' not in database_url:
            database_url += '?sslmode=require'

    DATABASES = {
        'default': dj_database_url.parse(
            database_url,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True if ('render.com' in database_url or 'sslmode=require' in database_url) else False,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'pockettrack_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 6,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CSRF Trusted Origins for live production environments
csrf_trusted_env = os.getenv('CSRF_TRUSTED_ORIGINS', '')
if csrf_trusted_env:
    CSRF_TRUSTED_ORIGINS = [orig.strip() for orig in csrf_trusted_env.split(',') if orig.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        'https://*.render.com',
        'https://*.onrender.com',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
    ]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Simple JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS configuration
CORS_ALLOW_CREDENTIALS = True
cors_origins_env = os.getenv('CORS_ALLOWED_ORIGINS', '')
if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [orig.strip() for orig in cors_origins_env.split(',') if orig.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:8081',
        'http://127.0.0.1:8081',
        'http://localhost:19000',
        'http://localhost:19006',
    ]

# During development, allow all origins to facilitate Expo / physical devices / emulators
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
