from django.contrib import admin
from .models import AuthorizationDocument

@admin.register(AuthorizationDocument)
class AuthorizationDocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'document_type', 'extraction_status', 'uploaded_at')
    list_filter = ('document_type', 'extraction_status')
