from rest_framework import serializers
from .models import CustomUser
from django.conf import settings

class CustomUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    
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
            'date_joined',
            'email_notifications',
            'phone_number',
            'address',
            'show_contact_info',
            'profile_image',
        ]
        read_only_fields = ['id', 'email', 'firebase_uid', 'is_active', 'date_joined']
    
    def get_profile_image(self, obj):
        """Return full profile image URL if image exists, otherwise return None."""
        if not obj.profile_image:
            return None
            
        try:
            import os
            from django.conf import settings
            
            # Check if this is a CloudinaryField
            if hasattr(obj.profile_image, 'url'):
                try:
                    # Check if public_id exists and is valid (CloudinaryField requirement)
                    public_id = None
                    if hasattr(obj.profile_image, 'public_id'):
                        public_id = obj.profile_image.public_id
                    
                    # If public_id is empty or None, the image doesn't exist in Cloudinary
                    if not public_id or not str(public_id).strip():
                        return None
                    
                    cloudinary_url = obj.profile_image.url
                    
                    # Validate Cloudinary URL format
                    if cloudinary_url and isinstance(cloudinary_url, str) and cloudinary_url.strip():
                        # Check if it's a valid HTTP/HTTPS URL
                        if cloudinary_url.startswith('http://') or cloudinary_url.startswith('https://'):
                            # Return the Cloudinary URL
                            return cloudinary_url
                        # If it's a relative URL, try to construct absolute URL
                        elif cloudinary_url.startswith('/'):
                            request = self.context.get('request')
                            if request:
                                return request.build_absolute_uri(cloudinary_url)
                            return cloudinary_url
                    
                    # If URL generation failed or returned invalid format, try local fallback
                except (AttributeError, Exception) as e:
                    # Cloudinary URL generation failed, try local fallback
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.debug(f"Cloudinary URL generation failed for user {obj.id}: {str(e)}")
                    # Fall through to local file check
            
            # Check if file exists locally (for images uploaded before Cloudinary was configured)
            image_name = str(obj.profile_image)
            public_id = None
            if hasattr(obj.profile_image, 'public_id'):
                public_id = obj.profile_image.public_id
            if hasattr(obj.profile_image, 'name'):
                image_name = obj.profile_image.name
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
            image_path = str(obj.profile_image)
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
            logger.warning(f"Error getting profile image URL for user {obj.id}: {str(e)}")
            # Return None instead of a broken URL
            return None
        
        # If we can't construct a valid URL, return None to prevent 404 errors
        return None
    
    def to_internal_value(self, data):
        """Handle profile_image field in request data."""
        ret = super().to_internal_value(data)
        request = self.context.get('request')
        if request and hasattr(request, 'FILES') and 'profile_image' in request.FILES:
            ret['_profile_image_file'] = request.FILES['profile_image']
        return ret
    
    def update(self, instance, validated_data):
        """Update user and handle profile image upload."""
        profile_image_file = validated_data.pop('_profile_image_file', None)
        user = super().update(instance, validated_data)
        if profile_image_file is not None:  # Allow clearing by passing null
            user.profile_image = profile_image_file
            user.save()
        return user