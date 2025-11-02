from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUser(BasePermission):
    """
    Allows access only to admin users (role='ADMIN') or Django staff/superusers.
    """
    def has_permission(self, request, view):
        # Debug logging
        print(f"IsAdminUser check - User: {request.user}")
        print(f"IsAdminUser check - Authenticated: {request.user.is_authenticated if request.user else False}")
        print(f"IsAdminUser check - Is staff: {getattr(request.user, 'is_staff', False) if request.user else False}")
        print(f"IsAdminUser check - Is superuser: {getattr(request.user, 'is_superuser', False) if request.user else False}")
        print(f"IsAdminUser check - Role: {getattr(request.user, 'role', None) if request.user else None}")
        
        if not request.user or not request.user.is_authenticated:
            print("IsAdminUser: User not authenticated")
            return False
        # Allow Django staff/superusers OR users with ADMIN role
        result = request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', None) == 'ADMIN'
        print(f"IsAdminUser: Permission result: {result}")
        return result

class IsAdminOrReadOnly(BasePermission):
    """
    Allows read-only access (GET, HEAD, OPTIONS) to any user.
    Allows write access (POST, PUT, PATCH, DELETE) only to admin users or Django staff/superusers.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        # Allow Django staff/superusers OR users with ADMIN role
        return request.user.is_staff or request.user.is_superuser or request.user.role == 'ADMIN'