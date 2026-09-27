from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer
)

class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Registers a new user and returns JWT tokens + user profile.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for immediate authentication after registration
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'User registered successfully',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticates user and returns JWT access & refresh tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = data['user']
        tokens = data['tokens']

        return Response({
            'message': 'Login successful',
            'tokens': tokens,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/auth/profile/
    PUT /api/auth/profile/
    PATCH /api/auth/profile/
    Retrieves or updates the authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user
