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
    GET: Returns a list of all categories (public access).
    POST: Creates a new category (Provider only).  # ADMIN FUNCTIONALITY DISABLED
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        """
        - GET requests are public (AllowAny)
        - POST requests require provider permission  # ADMIN FUNCTIONALITY DISABLED
        """
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsProviderOrReadOnly()]
        return [permissions.AllowAny()]

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Returns a single category (public access).
    PUT/PATCH: Updates a category (Provider only).  # ADMIN FUNCTIONALITY DISABLED
    DELETE: Deletes a category (Provider only).  # ADMIN FUNCTIONALITY DISABLED
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        """
        - GET requests are public (AllowAny)
        - PUT/PATCH/DELETE require provider permission  # ADMIN FUNCTIONALITY DISABLED
        """
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsProviderOrReadOnly()]
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
    PUT/PATCH: Updates a service (Owner only).
    DELETE: Deletes a service (Owner only).
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    
    def get_permissions(self):
        """
        - GET requests are public (AllowAny)
        - PUT/PATCH/DELETE require IsOwnerOrReadOnly permission
        """
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsOwnerOrReadOnly()]
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
        """
        user = self.request.user
        if user.role == 'SEEKER':
            return Booking.objects.filter(seeker=user)
        elif user.role == 'PROVIDER':
            return Booking.objects.filter(service__provider=user)
        return Booking.objects.none() # Users with other roles see nothing by default  # ADMIN FUNCTIONALITY DISABLED

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