from django.conf import settings
from rest_framework.permissions import BasePermission, SAFE_METHODS


def local_demo_mode():
    return settings.DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3'

class BaseRolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        if local_demo_mode():
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in self.allowed_roles

class IsAuthorizationSpecialist(BaseRolePermission):
    allowed_roles = ['AUTHORIZATION_SPECIALIST']

class IsProvider(BaseRolePermission):
    allowed_roles = ['PROVIDER']

class IsBilling(BaseRolePermission):
    allowed_roles = ['BILLING']

class IsOpsManager(BaseRolePermission):
    allowed_roles = ['OPS_MANAGER']

class IsSpecialistOrManager(BaseRolePermission):
    allowed_roles = ['AUTHORIZATION_SPECIALIST', 'OPS_MANAGER']

class IsSpecialistManagerOrBilling(BaseRolePermission):
    allowed_roles = ['AUTHORIZATION_SPECIALIST', 'OPS_MANAGER', 'BILLING']

class ReadOnlyForProviderAndBilling(BasePermission):
    def has_permission(self, request, view):
        if local_demo_mode():
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in ['AUTHORIZATION_SPECIALIST', 'OPS_MANAGER']:
            return True
        if request.user.role in ['PROVIDER', 'BILLING']:
            return request.method in SAFE_METHODS
        return False
