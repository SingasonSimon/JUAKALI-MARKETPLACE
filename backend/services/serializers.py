from rest_framework import serializers
from .models import Category, Service, Booking
from users.serializers import CustomUserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ServiceSerializer(serializers.ModelSerializer):
    provider = serializers.HiddenField(default=serializers.CurrentUserDefault())
    provider_details = CustomUserSerializer(source='provider', read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 
            'title', 
            'description', 
            'price',
            'provider',
            'provider_details',
            'category',
            'category_details',
            'created_at',
        ]
        
    def validate_provider(self, value):
        """
        Check that the user creating the service is a PROVIDER.
        """
        if value.role != 'PROVIDER':
            raise serializers.ValidationError("Only users with the 'PROVIDER' role can create services.")
        return value
    
class BookingSerializer(serializers.ModelSerializer):
    seeker = serializers.HiddenField(default=serializers.CurrentUserDefault())
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all())
    
    # Read-only fields for detail
    service_details = ServiceSerializer(source='service', read_only=True)
    seeker_details = CustomUserSerializer(source='seeker', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'service',
            'seeker',
            'status',
            'booking_date',
            'service_details',
            'seeker_details',
            'created_at',
        ]
        
    def validate(self, data):
        """
        Check that a Provider cannot book their own service.
        """
        # On create, 'service' is in data. On update, it might not be.
        service = data.get('service') or self.instance.service
        seeker = data.get('seeker') or self.request.user

        if service.provider == seeker:
            raise serializers.ValidationError("You cannot book your own service.")
            
        return data

    def validate_seeker(self, value):
        """
        Check that the user creating the booking is a SEEKER.
        """
        if value.role != 'SEEKER':
            raise serializers.ValidationError("Only users with the 'SEEKER' role can create bookings.")
        return value