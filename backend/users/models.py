from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SEEKER = "SEEKER", "Seeker"
        PROVIDER = "PROVIDER", "Provider"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.SEEKER)
    firebase_uid = models.CharField(max_length=128, unique=True, blank=True, null=True)
    email_notifications = models.BooleanField(default=True, help_text="Enable email notifications for bookings and services")

    # We don't need username/password, auth is handled by Firebase.
    # We can use email as the unique identifier.
    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []