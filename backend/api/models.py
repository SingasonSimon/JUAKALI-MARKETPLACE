from django.db import models
from django.conf import settings
import json

class AdminActionLog(models.Model):
    """
    Audit trail for admin actions.
    Logs all administrative actions for transparency and accountability.
    """
    class ActionType(models.TextChoices):
        CREATE = "CREATE", "Create"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"
        ACTIVATE = "ACTIVATE", "Activate"
        DEACTIVATE = "DEACTIVATE", "Deactivate"
        RESPOND = "RESPOND", "Respond"
        RESOLVE = "RESOLVE", "Resolve"
    
    class ResourceType(models.TextChoices):
        USER = "USER", "User"
        SERVICE = "SERVICE", "Service"
        BOOKING = "BOOKING", "Booking"
        CATEGORY = "CATEGORY", "Category"
        COMPLAINT = "COMPLAINT", "Complaint"
        REVIEW = "REVIEW", "Review"
    
    admin_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='admin_actions',
        limit_choices_to={'role': 'ADMIN'}
    )
    action_type = models.CharField(max_length=50, choices=ActionType.choices)
    resource_type = models.CharField(max_length=50, choices=ResourceType.choices)
    resource_id = models.IntegerField()
    description = models.TextField()
    changes = models.JSONField(default=dict, blank=True)  # Store before/after values
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['admin_user', '-created_at']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
    
    def __str__(self):
        return f"{self.action_type} {self.resource_type} #{self.resource_id} by {self.admin_user.email if self.admin_user else 'Unknown'}"

