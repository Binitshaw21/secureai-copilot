from rest_framework import serializers
from .models import CustomUser, ScanLog, TargetAsset

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class ScanLogSerializer(serializers.ModelSerializer):
        class Meta:
            model = ScanLog
            fields = '__all__'

class TargetAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TargetAsset
        fields = '__all__'

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # This securely encrypts the password before saving!
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    