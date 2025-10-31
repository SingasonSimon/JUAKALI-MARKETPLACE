from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Service(models.Model):
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'PROVIDER'},
        related_name='services'
    )
    category = models.ForeignKey(Category, related_name='services', on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # image_url = models.URLField(max_length=1024, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
class Booking(models.Model):
    class BookingStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELED = "CANCELED", "Canceled"
        COMPLETED = "COMPLETED", "Completed"

    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    seeker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'SEEKER'}, # Ensures only seekers can book
        related_name='bookings'
    )
    status = models.CharField(
        max_length=50,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING
    )
    booking_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # A seeker can only book the same service for the same time slot once
        unique_together = ('service', 'seeker', 'booking_date')

    def __str__(self):
        return f"Booking for {self.service.title} by {self.seeker.email} on {self.booking_date}"