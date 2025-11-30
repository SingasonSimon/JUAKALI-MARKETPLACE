from rest_framework import serializers
from .models import Category, Service, Booking, Review, Complaint, Payment
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
    # Custom field that handles both read (full URL) and write (file upload)
    # For reads, use SerializerMethodField to return full URL
    # For writes, we'll handle it in create/update methods
    image = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 
            'title', 
            'description', 
            'price',
            'image',
            'provider',
            'provider_details',
            'category',
            'category_details',
            'payment_method',
            'average_rating',
            'review_count',
            'created_at',
        ]
    
    def get_image(self, obj):
        """Return full Cloudinary HTTPS URL if image exists, otherwise return None."""
        if not obj.image:
            return None
            
        try:
            import os
            from django.conf import settings
            
            # Check if Cloudinary is configured
            cloudinary_configured = (
                hasattr(settings, 'CLOUDINARY_CLOUD_NAME') and 
                settings.CLOUDINARY_CLOUD_NAME and
                hasattr(settings, 'CLOUDINARY_API_KEY') and 
                settings.CLOUDINARY_API_KEY
            )
            
            # Check if this is a CloudinaryField
            if hasattr(obj.image, 'url') and cloudinary_configured:
                try:
                    # Check if public_id exists and is valid (CloudinaryField requirement)
                    public_id = None
                    if hasattr(obj.image, 'public_id'):
                        public_id = obj.image.public_id
                    
                    # If public_id is empty or None, the image doesn't exist in Cloudinary
                    if not public_id or not str(public_id).strip():
                        return None
                    
                    # Get Cloudinary URL - this should return a full HTTPS URL
                    cloudinary_url = obj.image.url
                    
                    # Validate Cloudinary URL format
                    if cloudinary_url and isinstance(cloudinary_url, str) and cloudinary_url.strip():
                        # Check if it's already a full HTTPS URL (preferred)
                        if cloudinary_url.startswith('https://'):
                            return cloudinary_url
                        # If it's HTTP, convert to HTTPS
                        elif cloudinary_url.startswith('http://'):
                            return cloudinary_url.replace('http://', 'https://', 1)
                        # If it's a relative URL, construct full Cloudinary URL
                        elif cloudinary_url.startswith('/'):
                            # Build full Cloudinary URL
                            cloud_name = settings.CLOUDINARY_CLOUD_NAME
                            return f"https://res.cloudinary.com/{cloud_name}/image/upload{cloudinary_url}"
                        # If it's just a public_id or path, construct full URL
                        else:
                            cloud_name = settings.CLOUDINARY_CLOUD_NAME
                            folder = 'juakali/services'
                            if hasattr(obj.image, 'field') and hasattr(obj.image.field, 'folder'):
                                folder = obj.image.field.folder
                            
                            # Check if public_id already includes the folder path
                            public_id_str = str(public_id)
                            if folder and not public_id_str.startswith(folder):
                                # Folder not in public_id, add it
                                public_id_with_folder = f"{folder}/{public_id_str}"
                            else:
                                # Folder already in public_id or no folder needed
                                public_id_with_folder = public_id_str
                            
                            return f"https://res.cloudinary.com/{cloud_name}/image/upload/v1/{public_id_with_folder}"
                    
                    # If URL generation failed, try to construct manually
                    if public_id:
                        cloud_name = settings.CLOUDINARY_CLOUD_NAME
                        folder = 'juakali/services'
                        if hasattr(obj.image, 'field') and hasattr(obj.image.field, 'folder'):
                            folder = obj.image.field.folder
                        
                        # Check if public_id already includes the folder path
                        public_id_str = str(public_id)
                        if folder and not public_id_str.startswith(folder):
                            public_id_with_folder = f"{folder}/{public_id_str}"
                        else:
                            public_id_with_folder = public_id_str
                        
                        return f"https://res.cloudinary.com/{cloud_name}/image/upload/v1/{public_id_with_folder}"
                    
                except (AttributeError, Exception) as e:
                    # Cloudinary URL generation failed, try manual construction
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.debug(f"Cloudinary URL generation failed for service {obj.id}: {str(e)}")
                    
                    # Try manual URL construction as fallback
                    if cloudinary_configured and hasattr(obj.image, 'public_id'):
                        public_id = obj.image.public_id
                        if public_id:
                            cloud_name = settings.CLOUDINARY_CLOUD_NAME
                            folder = 'juakali/services'
                            
                            # Check if public_id already includes the folder path
                            public_id_str = str(public_id)
                            if folder and not public_id_str.startswith(folder):
                                public_id_with_folder = f"{folder}/{public_id_str}"
                            else:
                                public_id_with_folder = public_id_str
                            
                            return f"https://res.cloudinary.com/{cloud_name}/image/upload/v1/{public_id_with_folder}"
                    
                    # Fall through to local file check only if Cloudinary is not configured
                    if not cloudinary_configured:
                        pass  # Fall through to local check
                    else:
                        return None  # Cloudinary is configured but URL generation failed
            
            # Check if file exists locally (for images uploaded before Cloudinary was configured)
            image_name = str(obj.image)
            public_id = None
            if hasattr(obj.image, 'public_id'):
                public_id = obj.image.public_id
            if hasattr(obj.image, 'name'):
                image_name = obj.image.name
            elif public_id:
                image_name = public_id
            
            # Check if file exists in local media directory
            if image_name and image_name.strip():
                local_path = os.path.join(settings.MEDIA_ROOT, image_name)
                local_path_with_jpg = local_path + '.jpg'
                local_path_with_png = local_path + '.png'
                
                # Determine which local file exists
                actual_local_path = None
                if os.path.exists(local_path):
                    actual_local_path = image_name
                elif os.path.exists(local_path_with_jpg):
                    actual_local_path = image_name + '.jpg'
                elif os.path.exists(local_path_with_png):
                    actual_local_path = image_name + '.png'
                
                if actual_local_path:
                    # Image exists locally, serve from local media URL
                    request = self.context.get('request')
                    if request:
                        media_url = getattr(settings, 'MEDIA_URL', '/media/')
                        if not actual_local_path.startswith('/'):
                            actual_local_path = '/' + actual_local_path
                        return request.build_absolute_uri(media_url.rstrip('/') + actual_local_path)
            
            # Fallback: if it's a string path (local storage), construct full URL
            image_path = str(obj.image)
            if image_path and image_path.strip():
                # If it's already a full URL, return it
                if image_path.startswith('http://') or image_path.startswith('https://'):
                    return image_path
                
                # For local storage, build absolute URI using request
                request = self.context.get('request')
                if request:
                    media_url = getattr(settings, 'MEDIA_URL', '/media/')
                    if not image_path.startswith('/'):
                        image_path = '/' + image_path
                    return request.build_absolute_uri(media_url.rstrip('/') + image_path)
                
        except Exception as e:
            # Log the error but don't break the API response
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error getting image URL for service {obj.id}: {str(e)}")
            # Return None instead of a broken URL
            return None
        
        # If we can't construct a valid URL, return None to prevent 404 errors
        return None
    
    def to_internal_value(self, data):
        """Handle image field in request data."""
        # Store image file separately for create/update
        ret = super().to_internal_value(data)
        # Check request.FILES for image upload
        request = self.context.get('request')
        if request and hasattr(request, 'FILES') and 'image' in request.FILES:
            ret['_image_file'] = request.FILES['image']
        return ret
    
    def create(self, validated_data):
        """Create service and handle image upload."""
        image_file = validated_data.pop('_image_file', None)
        service = super().create(validated_data)
        if image_file:
            service.image = image_file
            service.save()
        return service
    
    def update(self, instance, validated_data):
        """Update service and handle image upload."""
        image_file = validated_data.pop('_image_file', None)
        service = super().update(instance, validated_data)
        if image_file is not None:  # Allow clearing by passing null
            service.image = image_file
            service.save()
        return service
        
    def validate_provider(self, value):
        """
        Check that the user creating the service is a PROVIDER.
        """
        if value.role != 'PROVIDER':
            raise serializers.ValidationError("Only users with the 'PROVIDER' role can create services.")
        return value
    
class PaymentSerializer(serializers.ModelSerializer):
    card_number = serializers.CharField(write_only=True, required=False, help_text="Card number (last 4 digits will be stored)")
    payment_screenshot = serializers.SerializerMethodField()
    booking_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'booking',
            'booking_details',
            'amount',
            'payment_method',
            'status',
            'provider_payment_number',
            'payment_screenshot',
            'admin_verified',
            'admin_notes',
            'card_number',
            'card_last4',
            'card_brand',
            'transaction_id',
            'created_at',
            'completed_at',
        ]
        read_only_fields = [
            'id', 
            'created_at', 
            'completed_at', 
            'transaction_id', 
            'card_last4', 
            'card_brand', 
            'status',
            'admin_verified',
            'admin_notes',
            'booking_details'
        ]
    
    def get_payment_screenshot(self, obj):
        """Return full screenshot URL if screenshot exists."""
        if obj.payment_screenshot:
            try:
                if hasattr(obj.payment_screenshot, 'url'):
                    cloudinary_url = obj.payment_screenshot.url
                    if cloudinary_url and isinstance(cloudinary_url, str) and cloudinary_url.strip():
                        if cloudinary_url.startswith('http://') or cloudinary_url.startswith('https://'):
                            return cloudinary_url
                
                # Fallback: return string representation
                image_path = str(obj.payment_screenshot)
                if image_path.startswith('http://') or image_path.startswith('https://'):
                    return image_path
                
                # Build absolute URL for local storage
                request = self.context.get('request')
                if request:
                    from django.conf import settings
                    media_url = getattr(settings, 'MEDIA_URL', '/media/')
                    if not image_path.startswith('/'):
                        image_path = '/' + image_path
                    return request.build_absolute_uri(media_url.rstrip('/') + image_path)
                
                return image_path
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Error getting payment screenshot URL for payment {obj.id}: {str(e)}")
                return None
        return None
    
    def get_booking_details(self, obj):
        """Return booking details."""
        if obj.booking:
            return {
                'id': obj.booking.id,
                'service_title': obj.booking.service.title,
                'booking_date': obj.booking.booking_date,
                'seeker_email': obj.booking.seeker.email,
                'provider_email': obj.booking.service.provider.email,
            }
        return None
    
    def validate(self, data):
        """Validate payment data."""
        booking = data.get('booking')
        if booking and booking.status != 'CONFIRMED':
            raise serializers.ValidationError("Payment can only be processed for confirmed bookings.")
        
        # Set amount from booking service price if not provided
        if not data.get('amount') and booking:
            data['amount'] = booking.service.price
        
        return data
    
    def to_internal_value(self, data):
        """Handle payment_screenshot field in request data."""
        ret = super().to_internal_value(data)
        request = self.context.get('request')
        if request and hasattr(request, 'FILES') and 'payment_screenshot' in request.FILES:
            ret['_payment_screenshot_file'] = request.FILES['payment_screenshot']
        return ret
    
    def create(self, validated_data):
        """Create payment and extract card details from card_number if provided."""
        # Remove card_number from validated_data as it's not a model field
        card_number = validated_data.pop('card_number', None)
        payment_screenshot_file = validated_data.pop('_payment_screenshot_file', None)
        
        # Create the payment instance
        payment = super().create(validated_data)
        
        # Handle screenshot upload
        if payment_screenshot_file:
            payment.payment_screenshot = payment_screenshot_file
            payment.status = 'PENDING_VERIFICATION'
            payment.save()
        
        # Process card_number if provided (legacy support)
        if card_number:
            # Extract last 4 digits
            payment.card_last4 = card_number[-4:] if len(card_number) >= 4 else '0000'
            # Determine card brand from first digit
            first_digit = card_number[0] if card_number else '4'
            if first_digit == '4':
                payment.card_brand = 'Visa'
            elif first_digit == '5':
                payment.card_brand = 'Mastercard'
            elif first_digit == '3':
                payment.card_brand = 'American Express'
            else:
                payment.card_brand = 'Unknown'
            payment.save()
        
        return payment
    
    def update(self, instance, validated_data):
        """Update payment instance."""
        payment_screenshot_file = validated_data.pop('_payment_screenshot_file', None)
        
        # Update payment
        payment = super().update(instance, validated_data)
        
        # Handle screenshot upload on update
        if payment_screenshot_file is not None:
            payment.payment_screenshot = payment_screenshot_file
            if payment.status == 'PENDING':
                payment.status = 'PENDING_VERIFICATION'
            payment.save()
        
        return payment

class BookingSerializer(serializers.ModelSerializer):
    seeker = serializers.HiddenField(default=serializers.CurrentUserDefault())
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all())
    
    # Read-only fields for detail
    service_details = ServiceSerializer(source='service', read_only=True)
    seeker_details = CustomUserSerializer(source='seeker', read_only=True)
    payment = PaymentSerializer(read_only=True)
    is_paid = serializers.ReadOnlyField()
    
    # Contact info (only visible if seeker has enabled it)
    seeker_contact_info = serializers.SerializerMethodField()

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
            'seeker_contact_info',
            'payment',
            'is_paid',
            'created_at',
        ]
    
    def get_seeker_contact_info(self, obj):
        """Return seeker contact info only if they have enabled it."""
        seeker = obj.seeker
        request = self.context.get('request')
        
        # Only show contact info to providers or admins
        if request and request.user.is_authenticated:
            user = request.user
            if user.role in ['PROVIDER', 'ADMIN'] and seeker.show_contact_info:
                return {
                    'phone_number': seeker.phone_number,
                    'address': seeker.address,
                }
        return None
        
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
    
    def validate(self, data):
        """Validate that the seeker has booked the service before allowing a review."""
        service = data.get('service')
        request = self.context.get('request')
        seeker = data.get('seeker') or (request.user if request else None)
        
        if service and seeker:
            # Check if the seeker has any booking for this service (completed or confirmed)
            has_booking = Booking.objects.filter(
                service=service,
                seeker=seeker,
                status__in=['CONFIRMED', 'COMPLETED']
            ).exists()
            
            if not has_booking:
                raise serializers.ValidationError(
                    "You can only review services that you have booked and that are confirmed or completed."
                )
        
        return data
    
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
    service_details = serializers.SerializerMethodField()
    
    def get_service_details(self, obj):
        """Return service details if service exists, otherwise None."""
        if obj.service:
            return ServiceSerializer(obj.service, context=self.context).data
        return None

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