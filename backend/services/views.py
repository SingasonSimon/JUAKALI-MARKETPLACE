from rest_framework import generics, permissions
from .models import Service, Category, Booking
from .serializers import ServiceSerializer, CategorySerializer, BookingSerializer
from .permissions import (
    IsProviderOrReadOnly, 
    IsOwnerOrReadOnly,
    IsSeeker,
    IsBookingOwnerOrProvider  
)

class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns a list of all categories.
    POST: Creates a new category (Admin-only in future, for now any auth user).
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ServiceListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns a list of all services.
    POST: Creates a new service for the logged-in PROVIDER.
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsProviderOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Returns a single service.
    PUT/PATCH: Updates a service (Owner only).
    DELETE: Deletes a service (Owner only).
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsOwnerOrReadOnly]
    

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
        """
        user = self.request.user
        if user.role == 'SEEKER':
            return Booking.objects.filter(seeker=user)
        elif user.role == 'PROVIDER':
            return Booking.objects.filter(service__provider=user)
        return Booking.objects.none() # Admins/etc. see nothing by default

    def perform_create(self, serializer):
        serializer.save(seeker=self.request.user)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE a specific booking.
    - Only the Seeker who made the booking or the Provider
      who owns the service can access it.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsBookingOwnerOrProvider]

    def get_queryset(self):
        """
        Ensure users can only access their own related bookings,
        even in the detail view.
        """
        user = self.request.user
        if user.role == 'SEEKER':
            return Booking.objects.filter(seeker=user)
        elif user.role == 'PROVIDER':
            return Booking.objects.filter(service__provider=user)
        return Booking.objects.none()