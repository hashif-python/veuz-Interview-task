from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True)   # 👈 add this

    class Meta:
        model = User
        fields = ["username", "email", "password", "name"]

    def create(self, validated_data):
        name = validated_data.pop("name", "")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        Profile.objects.create(user=user, full_name=name)   # 👈 save to profile
        return user



class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    class Meta:
        model = Profile
        fields = ["full_name", "email", "phone", "avatar"]

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["full_name", "phone", "avatar"]

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    def validate_new_password(self, value):
        validate_password(value)
        return value
