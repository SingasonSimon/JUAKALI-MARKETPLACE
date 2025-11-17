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
        read_only_fields = ['id', 'email', 'firebase_uid', 'is_active', 'date_joined', 'role']
    
    def get_profile_image(self, obj):
        """Return full profile image URL if image exists."""
        if obj.profile_image:
            try:
                # Check if this is a CloudinaryField
                if hasattr(obj.profile_image, 'url'):
                    cloudinary_url = obj.profile_image.url
                    # Check if image exists locally (for images uploaded before Cloudinary was configured)
                    import os
                    
                    # Get the image path/name
                    image_name = str(obj.profile_image)
                    if hasattr(obj.profile_image, 'name'):
                        image_name = obj.profile_image.name
                    elif hasattr(obj.profile_image, 'public_id'):
                        image_name = obj.profile_image.public_id
                    
                    # Check if file exists in local media directory
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
                    
                    # If Cloudinary URL is available and file doesn't exist locally, use Cloudinary
                    if cloudinary_url and (cloudinary_url.startswith('http://') or cloudinary_url.startswith('https://')):
                        return cloudinary_url
                
                # Fallback: if it's a string path (local storage), construct full URL
                image_path = str(obj.profile_image)
                if image_path.startswith('http://') or image_path.startswith('https://'):
                    return image_path
                
                # For local storage, build absolute URI using request
                request = self.context.get('request')
                if request:
                    media_url = getattr(settings, 'MEDIA_URL', '/media/')
                    if not image_path.startswith('/'):
                        image_path = '/' + image_path
                    return request.build_absolute_uri(media_url.rstrip('/') + image_path)
                
                # Last resort: return relative path
                return image_path
            except Exception as e:
                # Final fallback: try to construct URL from string
                image_path = str(obj.profile_image)
                request = self.context.get('request')
                if request and not (image_path.startswith('http://') or image_path.startswith('https://')):
                    media_url = getattr(settings, 'MEDIA_URL', '/media/')
                    if not image_path.startswith('/'):
                        image_path = '/' + image_path
                    return request.build_absolute_uri(media_url.rstrip('/') + image_path)
                return image_path
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