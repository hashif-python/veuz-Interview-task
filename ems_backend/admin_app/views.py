from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, ProfileSerializer, ProfileUpdateSerializer, ChangePasswordSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    def get_object(self):
        return self.request.user.profile
    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProfileUpdateSerializer
        return ProfileSerializer

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    def get_object(self):
        return self.request.user
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"detail": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password changed successfully."})
