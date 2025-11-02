from .models import AdminActionLog
from django.utils import timezone

def log_admin_action(admin_user, action_type, resource_type, resource_id, description, changes=None, ip_address=None):
    """
    Utility function to log admin actions.
    
    Args:
        admin_user: The admin user performing the action
        action_type: One of AdminActionLog.ActionType choices
        resource_type: One of AdminActionLog.ResourceType choices
        resource_id: ID of the resource being acted upon
        description: Human-readable description of the action
        changes: Optional dict with 'before' and 'after' keys
        ip_address: Optional IP address of the admin user
    """
    AdminActionLog.objects.create(
        admin_user=admin_user,
        action_type=action_type,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        changes=changes or {},
        ip_address=ip_address
    )

def get_client_ip(request):
    """Extract client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

