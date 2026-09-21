from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile

class CustomUserAdmin(UserAdmin):
    list_display = UserAdmin.list_display + ('role', 'department', 'phone_number')
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'department', 'phone_number')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile)
