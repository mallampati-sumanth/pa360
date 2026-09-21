from rest_framework import serializers
from .models import AuthorizationDocument

class AuthorizationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorizationDocument
        fields = '__all__'


class AuthorizationDocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = AuthorizationDocument
        fields = ['authorization_request', 'document_type', 'extracted_text', 'file']

    def create(self, validated_data):
        uploaded_file = validated_data.pop('file', None)
        if uploaded_file:
            validated_data.update({
                'file_name': uploaded_file.name,
                'file_path': f'demo://uploads/{uploaded_file.name}',
                'file_size': uploaded_file.size,
                'mime_type': uploaded_file.content_type or 'application/octet-stream',
                'extracted_text': validated_data.get('extracted_text', '') or uploaded_file.name,
            })
        else:
            validated_data.setdefault('file_name', 'uploaded-clinical-evidence.txt')
            validated_data.setdefault('file_path', 'demo://uploads/uploaded-clinical-evidence.txt')
            validated_data.setdefault('file_size', 0)
            validated_data.setdefault('mime_type', 'text/plain')
        validated_data.setdefault('extraction_status', AuthorizationDocument.ExtractionStatus.COMPLETED)
        return AuthorizationDocument.objects.create(**validated_data)
