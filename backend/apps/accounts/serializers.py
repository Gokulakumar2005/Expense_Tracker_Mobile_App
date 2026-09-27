from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password confirmation."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        style={'input_type': 'password'},
        help_text="Password must be at least 6 characters long."
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Repeat password for confirmation."
    )

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password', 'confirm_password', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized_email

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login returning JWT tokens and user profile."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        refresh = RefreshToken.for_user(user)

        return {
            'user': user,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for retrieving and updating user profile."""

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']

    def validate_first_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("First name cannot be blank.")
        return value.strip()

    def validate_last_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Last name cannot be blank.")
        return value.strip()
