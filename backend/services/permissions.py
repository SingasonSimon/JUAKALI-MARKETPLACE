from rest_framework.permissions import BasePermission, SAFE_METHODS
from api.permissions import IsAdminUser

class IsProviderOrReadOnly(BasePermission):
    """
    Allows read-only access (GET, HEAD, OPTIONS) to any user.
    Allows write access (POST, PUT, PATCH, DELETE) only to users with the 'PROVIDER' role.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        return request.user and request.user.is_authenticated and request.user.role == 'PROVIDER'

class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit or delete it.
    Read-only access is allowed for everyone.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner (provider) of the service
        return obj.provider == request.user
    
class IsSeeker(BasePermission):
    """
    Allows access only to users with the 'SEEKER' role.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'SEEKER'

class IsBookingOwnerOrProvider(BasePermission):
    """
    Allows access only to the Seeker who made the booking or the Provider
    who owns the service being booked, or Admin.
    """
    def has_object_permission(self, request, view, obj):
        # Allow admin access
        if request.user and request.user.is_authenticated and request.user.role == 'ADMIN':
            return True
            
        # Allow if the user is the seeker who made the booking
        if obj.seeker == request.user:
            return True
        
        # Allow if the user is the provider who owns the service
        if obj.service.provider == request.user:
            return True
            
        return False

class IsAdminOrOwnerOrReadOnly(BasePermission):
    """
    Allows read-only access to any user.
    Allows write access to admin users or the owner of the object.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in SAFE_METHODS:
            return True
        
        # Admin can edit/delete any object
        if request.user and request.user.is_authenticated and request.user.role == 'ADMIN':
            return True
            
        # Write permissions are only allowed to the owner (provider) of the service
        return obj.provider == request.user

class IsAdminOrProviderOrReadOnly(BasePermission):
    """
    Allows read-only access to any user.
    Allows write access to admin users or providers.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
            
        return request.user.role in ['ADMIN', 'PROVIDER']

class IsAdminOrReviewOwnerOrReadOnly(BasePermission):
    """
    Allows read-only access to any user.
    Allows write access to admin users or the owner (seeker) of the review.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in SAFE_METHODS:
            return True
        
        # Admin can edit/delete any review
        if request.user and request.user.is_authenticated:
            if request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser:
                return True
            
            # Write permissions are only allowed to the owner (seeker) of the review
            return obj.seeker == request.user
        
        return False