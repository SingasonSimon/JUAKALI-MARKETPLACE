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
    
    @property
    def average_rating(self):
        """Calculate average rating from reviews."""
        reviews = self.reviews.all()
        if reviews.exists():
            return round(sum(review.rating for review in reviews) / reviews.count(), 2)
        return None
    
    @property
    def review_count(self):
        """Get total number of reviews."""
        return self.reviews.count()
    
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

class Review(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='reviews')
    seeker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'SEEKER'},
        related_name='reviews'
    )
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 rating
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('service', 'seeker')  # One review per seeker per service
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Review by {self.seeker.email} for {self.service.title} - {self.rating} stars"

class Complaint(models.Model):
    class ComplaintType(models.TextChoices):
        SERVICE_ISSUE = "SERVICE_ISSUE", "Service Issue"
        BOOKING_ISSUE = "BOOKING_ISSUE", "Booking Issue"
        USER_BEHAVIOR = "USER_BEHAVIOR", "User Behavior"
        PLATFORM_ISSUE = "PLATFORM_ISSUE", "Platform Issue"
        OTHER = "OTHER", "Other"
    
    class ComplaintStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_REVIEW = "IN_REVIEW", "In Review"
        RESOLVED = "RESOLVED", "Resolved"
        DISMISSED = "DISMISSED", "Dismissed"
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='complaints'
    )
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    complaint_type = models.CharField(max_length=50, choices=ComplaintType.choices)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=ComplaintStatus.choices, default=ComplaintStatus.PENDING)
    admin_response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Complaint by {self.user.email} - {self.complaint_type}"