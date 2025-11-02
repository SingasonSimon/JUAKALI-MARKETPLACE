from rest_framework import serializers
from .models import Category, Service, Booking, Review, Complaint
from users.serializers import CustomUserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug']  # Slug is auto-generated from name
    
    def create(self, validated_data):
        """Auto-generate slug from name if not provided."""
        from django.utils.text import slugify
        name = validated_data.get('name')
        validated_data['slug'] = slugify(name)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Auto-generate slug from name if name is updated."""
        from django.utils.text import slugify
        if 'name' in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)

class ServiceSerializer(serializers.ModelSerializer):
    provider = serializers.HiddenField(default=serializers.CurrentUserDefault())
    provider_details = CustomUserSerializer(source='provider', read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    category_details = CategorySerializer(source='category', read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

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
            'average_rating',
            'review_count',
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
        Only validate on create, not on update.
        """
        # Only validate on create (when instance is None)
        if self.instance is None:
            service = data.get('service')
            # Get request from context (Django REST Framework way)
            request = self.context.get('request')
            seeker = data.get('seeker') or (request.user if request else None)

            if service and seeker and service.provider == seeker:
                raise serializers.ValidationError("You cannot book your own service.")
            
        return data

    def validate_seeker(self, value):
        """
        Check that the user creating the booking is a SEEKER.
        Only validate on create, not on update.
        """
        # Only validate on create (when instance is None)
        if self.instance is None and value.role != 'SEEKER':
            raise serializers.ValidationError("Only users with the 'SEEKER' role can create bookings.")
        return value

class ReviewSerializer(serializers.ModelSerializer):
    seeker = serializers.HiddenField(default=serializers.CurrentUserDefault())
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all())
    seeker_details = CustomUserSerializer(source='seeker', read_only=True)
    service_details = ServiceSerializer(source='service', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'service',
            'service_details',
            'seeker',
            'seeker_details',
            'rating',
            'comment',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_rating(self, value):
        """Ensure rating is between 1 and 5."""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def validate(self, data):
        """Ensure seeker is creating the review and one review per service."""
        request = self.context.get('request')
        seeker = data.get('seeker') or (request.user if request else None)
        service = data.get('service')
        
        if self.instance is None:  # Creating new review
            if seeker and seeker.role != 'SEEKER':
                raise serializers.ValidationError("Only seekers can create reviews.")
            
            if service and seeker:
                # Check if review already exists
                if Review.objects.filter(service=service, seeker=seeker).exists():
                    raise serializers.ValidationError("You have already reviewed this service.")
        
        return data

class ComplaintSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all(), required=False, allow_null=True)
    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all(), required=False, allow_null=True)
    user_details = CustomUserSerializer(source='user', read_only=True)
    service_details = ServiceSerializer(source='service', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'user',
            'user_details',
            'service',
            'service_details',
            'booking',
            'complaint_type',
            'description',
            'status',
            'admin_response',
            'created_at',
            'resolved_at',
        ]
        read_only_fields = ['resolved_at', 'created_at']
    
    def validate_status(self, value):
        """Allow admin to update status, but restrict regular users."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            # Only admins can update status
            if user.role != 'ADMIN' and not (user.is_staff or user.is_superuser):
                raise serializers.ValidationError("Only admins can update complaint status.")
        return value
    
    def validate_admin_response(self, value):
        """Allow admin to update admin_response, but restrict regular users."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            # Only admins can update admin_response
            if user.role != 'ADMIN' and not (user.is_staff or user.is_superuser):
                raise serializers.ValidationError("Only admins can add admin responses.")
        return value