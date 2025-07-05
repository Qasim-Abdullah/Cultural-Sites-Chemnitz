"""
Django settings for backend project.
"""

import os
from pathlib import Path
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# GDAL/GeoDjango Configuration for local development only
# This section will be skipped in production (Render)
if os.name == 'nt':  # Windows only
    osgeo_bin = r'C:\OSGeo4W\bin'

    # Add DLL directory for Python 3.8+ (required for Windows)
    if Path(osgeo_bin).exists():
        os.add_dll_directory(osgeo_bin)
        
        # Set GDAL library paths (using gdal311.dll - the newer version available)
        GDAL_LIBRARY_PATH = os.path.join(osgeo_bin, 'gdal311.dll')
        GEOS_LIBRARY_PATH = os.path.join(osgeo_bin, 'geos_c.dll')
        
        # Set required environment variables for GDAL
        osgeo_root = r'C:\OSGeo4W'
        os.environ['GDAL_DATA'] = os.path.join(osgeo_root, 'share', 'gdal')
        os.environ['PROJ_LIB'] = os.path.join(osgeo_root, 'share', 'proj')
        os.environ['PATH'] = osgeo_bin + ';' + os.environ.get('PATH', '')
        
        print(f"✅ Using GDAL from: {GDAL_LIBRARY_PATH}")
    else:
        print("❌ OSGeo4W not found at expected location")
        print("Make sure OSGeo4W is installed at C:\\OSGeo4W")

# Environment variables configuration
# Use environment variables for production settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-x@cz#$ef=$_^)1uz0jv+tyb^xpexun9115m=vpdxt1gt11ah&l')

# DEBUG should be False in production
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

# Allow all hosts in production, but you should restrict this for security
ALLOWED_HOSTS = ['*'] if not DEBUG else []

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework_simplejwt',
    'rest_framework',
    'corsheaders',
    'cultural_sites',
    'rest_framework_gis',
    'django.contrib.gis',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Added for static files in production
    "corsheaders.middleware.CorsMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS configuration - update for production
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    # Add your production frontend URL here when you deploy it
    # "https://your-frontend-domain.com",
]

CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'cultural_sites.authentication.CookiesJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

ROOT_URLCONF = 'backend.urls'

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

WSGI_APPLICATION = 'backend.wsgi.application'

# Database configuration
# First try to use individual environment variables (for Render)
# If not available, fall back to DATABASE_URL
if all(key in os.environ for key in ['DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_HOST']):
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': os.environ.get('DATABASE_NAME'),
            'USER': os.environ.get('DATABASE_USER'),
            'PASSWORD': os.environ.get('DATABASE_PASSWORD'),
            'HOST': os.environ.get('DATABASE_HOST'),
            'PORT': os.environ.get('DATABASE_PORT', '5432'),
        }
    }
else:
    # Fallback to DATABASE_URL (for local development or other deployments)
    DATABASES = {
        'default': dj_database_url.config(
            default='postgresql://localhost/cultural_sites_db',
            conn_max_age=600,
            ssl_require=not DEBUG
        )
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
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

# Static files configuration for production
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Static files storage configuration for production
if not DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'