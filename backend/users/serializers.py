from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 
            'email', 
            'firebase_uid', 
            'role', 
            'first_name', 
            'last_name',
            'is_active',
        ]
        read_only_fields = ['id', 'email', 'firebase_uid', 'is_active']