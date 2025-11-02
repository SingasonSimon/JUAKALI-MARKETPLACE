from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from django.db.models import Q
from .models import Service, Category, Booking, Review, Complaint
from .serializers import ServiceSerializer, CategorySerializer, BookingSerializer, ReviewSerializer, ComplaintSerializer
from .permissions import (
    IsProviderOrReadOnly,
    IsOwnerOrReadOnly,
    IsSeeker,
    IsBookingOwnerOrProvider,
    IsAdminOrOwnerOrReadOnly,
    IsAdminOrProviderOrReadOnly,
    IsAdminOrReviewOwnerOrReadOnly
)
from api.permissions import IsAdminUser
from api.authentication import FirebaseAuthentication
from core.email_utils import (
    send_booking_confirmation_email,
    send_booking_completed_email,
    send_booking_canceled_email,
    send_new_review_email,
    send_complaint_resolved_email
)

class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns a list of all categories (public access).
    POST: Creates a new category (Provider or Admin only).
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_permissions(self):
        """
        - GET requests are public (AllowAny)
        - POST requests require provider or admin permission
        """
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminOrProviderOrReadOnly()]
        return [permissions.AllowAny()]

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Returns a single category (public access).
    PUT/PATCH: Updates a category (Provider or Admin).
    DELETE: Deletes a category (Provider or Admin).
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_permissions(self):
        """
        - GET requests are public (AllowAny)
        - PUT/PATCH/DELETE require provider or admin permission
        """
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdminOrProviderOrReadOnly()]
        return [permissions.AllowAny()]

class ServiceListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns a list of all services (public access).
    POST: Creates a new service for the logged-in PROVIDER.
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    
    def get_permissions(self):
        """
        - GET requests are public (AllowAny)
        - POST requests require IsProviderOrReadOnly permission
        """
        if self.request.method == 'POST':
            return [IsProviderOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save()

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Returns a single service (public access).
    PUT/PATCH: Updates a service (Owner or Admin).
    DELETE: Deletes a service (Owner or Admin).
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_permissions(self):
        """
        - GET requests are public (AllowAny)
        - PUT/PATCH/DELETE require admin or owner permission
        """
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminOrOwnerOrReadOnly()]
        return [permissions.AllowAny()]
    

class BookingListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns a list of bookings for the current user.
         - Seekers see bookings they made.
         - Providers see bookings for their services.
    POST: Creates a new booking (Seekers only).
    """
    serializer_class = BookingSerializer
    
    def get_permissions(self):
        """
        - POST requests require IsSeeker permission.
        - GET requests just require authentication.
        """
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSeeker()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        This is the core logic:
        - Filter bookings based on the user's role.
        - Admin can see all bookings.
        """
        user = self.request.user
        if user.role == 'ADMIN':
            return Booking.objects.all()
        elif user.role == 'SEEKER':
            return Booking.objects.filter(seeker=user)
        elif user.role == 'PROVIDER':
            return Booking.objects.filter(service__provider=user)
        return Booking.objects.none()

    def perform_create(self, serializer):
        booking = serializer.save(seeker=self.request.user)
        # If booking is created with CONFIRMED status, send confirmation email
        if booking.status == 'CONFIRMED':
            send_booking_confirmation_email(booking)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE a specific booking.
    - Only the Seeker who made the booking or the Provider
      who owns the service can access it, or Admin.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsBookingOwnerOrProvider]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]

    def get_queryset(self):
        """
        Ensure users can only access their own related bookings,
        even in the detail view. Admin can access all bookings.
        """
        user = self.request.user
        if user.role == 'ADMIN' or user.is_staff or user.is_superuser:
            return Booking.objects.all()
        elif user.role == 'SEEKER':
            return Booking.objects.filter(seeker=user)
        elif user.role == 'PROVIDER':
            return Booking.objects.filter(service__provider=user)
        return Booking.objects.none()
    
    def update(self, request, *args, **kwargs):
        """Handle booking updates and send email notifications."""
        instance = self.get_object()
        old_status = instance.status
        
        # Perform the update
        response = super().update(request, *args, **kwargs)
        
        # Refresh instance to get updated status
        instance.refresh_from_db()
        new_status = instance.status
        
        # Send email notifications based on status changes
        if old_status != new_status:
            if new_status == 'CONFIRMED':
                send_booking_confirmation_email(instance)
            elif new_status == 'COMPLETED':
                send_booking_completed_email(instance)
            elif new_status == 'CANCELED':
                # Determine who canceled the booking
                if request.user == instance.seeker:
                    canceled_by = 'SEEKER'
                elif request.user == instance.service.provider:
                    canceled_by = 'PROVIDER'
                else:
                    canceled_by = 'ADMIN'  # Admin canceled
                send_booking_canceled_email(instance, canceled_by)
        
        return response
    
class ProviderServiceListView(generics.ListAPIView):
    """
    GET: Returns a list of services owned by the currently authenticated PROVIDER.
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsProviderOrReadOnly]

    def get_queryset(self):
        """
        Filter services to return only those owned by the current user.
        """
        user = self.request.user
        if user.role == 'PROVIDER':
            return Service.objects.filter(provider=user)
        return Service.objects.none()

class ReviewListCreateView(generics.ListCreateAPIView):
    """
    GET: List reviews for a service (public) or user's reviews (authenticated)
    POST: Create review (seekers only, one per service)
    """
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        """POST requires seeker, GET is public or authenticated."""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSeeker()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        """Filter reviews based on query parameters."""
        queryset = Review.objects.all()
        service_id = self.request.query_params.get('service', None)
        user = self.request.user
        
        if service_id:
            queryset = queryset.filter(service_id=service_id)
        elif user.is_authenticated and user.role == 'SEEKER':
            # Return user's own reviews
            queryset = queryset.filter(seeker=user)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        review = serializer.save(seeker=self.request.user)
        # Send email notification to provider when a new review is posted
        send_new_review_email(review)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Get review details
    PUT/PATCH: Update own review (seeker) or any review (admin)
    DELETE: Delete own review (seeker) or any review (admin)
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAdminOrReviewOwnerOrReadOnly]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_queryset(self):
        """Admin sees all reviews, regular users see all (for GET)."""
        user = self.request.user
        # Admin can see all, others can see all (read-only)
        return Review.objects.all()

class ComplaintListCreateView(generics.ListCreateAPIView):
    """
    GET: List complaints (admin sees all, users see their own)
    POST: Create complaint (authenticated users)
    """
    serializer_class = ComplaintSerializer
    
    def get_permissions(self):
        """GET requires authentication, POST requires authentication."""
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Admin sees all, users see their own."""
        user = self.request.user
        if user.role == 'ADMIN':
            return Complaint.objects.all()
        return Complaint.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Get complaint details
    PUT/PATCH: Update complaint (admin can update status and respond)
    DELETE: Delete complaint (admin only)
    """
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_permissions(self):
        """Admin can update/delete, users can only view their own."""
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Admin sees all, users see their own."""
        user = self.request.user
        if user.role == 'ADMIN':
            return Complaint.objects.all()
        return Complaint.objects.filter(user=user)
    
    def update(self, request, *args, **kwargs):
        """Handle complaint updates, including resolving."""
        instance = self.get_object()
        
        # Get the status before update
        old_status = instance.status
        
        # Perform the update with request context
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=kwargs.get('partial', False),
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Refresh instance to get updated data
        instance.refresh_from_db()
        
        # Set resolved_at if status is changed to RESOLVED
        if old_status != 'RESOLVED' and instance.status == 'RESOLVED':
            from django.utils import timezone
            instance.resolved_at = timezone.now()
            instance.save()
            # Send email notification when complaint is resolved
            send_complaint_resolved_email(instance)
        # Clear resolved_at if status is changed away from RESOLVED
        elif old_status == 'RESOLVED' and instance.status != 'RESOLVED':
            instance.resolved_at = None
            instance.save()
        
        # Return updated response
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)