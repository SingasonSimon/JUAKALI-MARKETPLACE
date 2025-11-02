from django.contrib import admin
from .models import AdminActionLog

@admin.register(AdminActionLog)
class AdminActionLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'admin_user', 'action_type', 'resource_type', 'resource_id', 'created_at']
    list_filter = ['action_type', 'resource_type', 'created_at']
    search_fields = ['admin_user__email', 'description']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
