from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary_storage.storage import MediaCloudinaryStorage
from cloudinary.models import CloudinaryField

class CustomUser(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SEEKER = "SEEKER", "Seeker"
        PROVIDER = "PROVIDER", "Provider"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.SEEKER)
    firebase_uid = models.CharField(max_length=128, unique=True, blank=True, null=True)
    email_notifications = models.BooleanField(default=True, help_text="Enable email notifications for bookings and services")
    
    # Profile image
    profile_image = CloudinaryField('image', folder='juakali/profiles', blank=True, null=True, help_text="User profile image")
    
    # Contact information (for seekers to share with providers)
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="Phone number")
    address = models.TextField(blank=True, null=True, help_text="Address")
    show_contact_info = models.BooleanField(default=False, help_text="Allow providers to see contact info in booking details")

    # We don't need username/password, auth is handled by Firebase.
    # We can use email as the unique identifier.
    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []