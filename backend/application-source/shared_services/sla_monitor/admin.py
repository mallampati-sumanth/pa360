from django.contrib import admin
from .models import SLAConfiguration, SLABreach

admin.site.register(SLAConfiguration)
admin.site.register(SLABreach)
