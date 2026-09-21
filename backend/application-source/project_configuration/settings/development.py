from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

CORS_ALLOW_ALL_ORIGINS = True

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

if env('PA360_DATABASE', default='sqlite').lower() == 'sqlite':
	MIDDLEWARE = MIDDLEWARE + ['project_configuration.middleware.LocalDemoUserMiddleware']
	REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = ('rest_framework.permissions.AllowAny',)
