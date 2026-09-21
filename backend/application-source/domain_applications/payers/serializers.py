from rest_framework import serializers
from .models import Payer

class PayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payer
        fields = '__all__'
