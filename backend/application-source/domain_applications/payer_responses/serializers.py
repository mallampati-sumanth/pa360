from rest_framework import serializers
from .models import PayerResponse

class PayerResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayerResponse
        fields = '__all__'
