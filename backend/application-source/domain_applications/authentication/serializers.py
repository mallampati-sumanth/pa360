from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer as BaseTokenRefreshSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import UserProfile
        model = UserProfile
        fields = ['extra_attributes']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'department', 'phone_number', 'profile']

class LoginSerializer(TokenObtainPairSerializer):
    username = serializers.CharField(required=False, write_only=True)
    email = serializers.EmailField(required=False, write_only=True)

    def to_internal_value(self, data):
        data = data.copy()
        if not data.get('username') and data.get('email'):
            user = User.objects.filter(email__iexact=data['email']).first()
            data['username'] = user.username if user else data['email']
        return super().to_internal_value(data)

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        data['role'] = self.user.role
        return data

class TokenRefreshSerializer(BaseTokenRefreshSerializer):
    pass

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'role', 'department', 'phone_number']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        from .models import UserProfile
        UserProfile.objects.create(user=user)
        return user
