from rest_framework import generics, permissions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import RegisterSerializer, UserSerializer


class OfficerTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Ensure only Environmental Officers can log in."""

    def validate(self, attrs):
        data = super().validate(attrs)

        if getattr(self.user, 'role', None) != User.Role.OFFICER:
            raise permissions.PermissionDenied('Only Environmental Officers can log in.')

        return data


class OfficerTokenObtainPairView(TokenObtainPairView):
    serializer_class = OfficerTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new Environmental Officer."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    """Return the logged-in user."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
