from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser
from services.models import Service, Booking, Review, Complaint

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    # Use email instead of username
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff', 'is_superuser', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff', 'is_superuser', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    # Fields to show in the admin form
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Firebase', {'fields': ('firebase_uid',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser'),
        }),
    )
    
    # Use email as the username field
    readonly_fields = ['date_joined', 'last_login']
    
    # Change the form to use email instead of username
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Remove username field if it exists (it shouldn't, but just in case)
        if 'username' in form.base_fields:
            del form.base_fields['username']
        return form

@staff_member_required
def admin_analytics_view(request):
    """
    Custom Django admin view to display platform analytics.
    Accessible at /admin/analytics/
    """
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)
    
    # User statistics
    total_users = CustomUser.objects.count()
    active_users = CustomUser.objects.filter(is_active=True).count()
    users_by_role = CustomUser.objects.values('role').annotate(count=Count('id'))
    new_users_30d = CustomUser.objects.filter(date_joined__gte=thirty_days_ago).count()
    new_users_7d = CustomUser.objects.filter(date_joined__gte=seven_days_ago).count()
    
    # Service statistics
    total_services = Service.objects.count()
    services_by_category = Service.objects.values('category__name').annotate(count=Count('id'))
    avg_service_price = Service.objects.aggregate(avg_price=Avg('price'))['avg_price'] or 0
    
    # Booking statistics
    total_bookings = Booking.objects.count()
    bookings_by_status = Booking.objects.values('status').annotate(count=Count('id'))
    bookings_30d = Booking.objects.filter(created_at__gte=thirty_days_ago).count()
    bookings_7d = Booking.objects.filter(created_at__gte=seven_days_ago).count()
    
    # Review statistics
    total_reviews = Review.objects.count()
    avg_rating = Review.objects.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    reviews_30d = Review.objects.filter(created_at__gte=thirty_days_ago).count()
    
    # Complaint statistics
    total_complaints = Complaint.objects.count()
    complaints_by_status = Complaint.objects.values('status').annotate(count=Count('id'))
    complaints_30d = Complaint.objects.filter(created_at__gte=thirty_days_ago).count()
    
    # Recent activity
    recent_users = CustomUser.objects.order_by('-date_joined')[:10]
    recent_services = Service.objects.order_by('-created_at')[:10]
    recent_bookings = Booking.objects.order_by('-created_at')[:10]
    
    context = {
        'title': 'Platform Analytics',
        'users': {
            'total': total_users,
            'active': active_users,
            'by_role': list(users_by_role),
            'new_30d': new_users_30d,
            'new_7d': new_users_7d,
        },
        'services': {
            'total': total_services,
            'by_category': list(services_by_category),
            'avg_price': float(avg_service_price),
        },
        'bookings': {
            'total': total_bookings,
            'by_status': list(bookings_by_status),
            'new_30d': bookings_30d,
            'new_7d': bookings_7d,
        },
        'reviews': {
            'total': total_reviews,
            'avg_rating': round(avg_rating, 2) if avg_rating else 0,
            'new_30d': reviews_30d,
        },
        'complaints': {
            'total': total_complaints,
            'by_status': list(complaints_by_status),
            'new_30d': complaints_30d,
        },
        'recent_users': recent_users,
        'recent_services': recent_services,
        'recent_bookings': recent_bookings,
    }
    
    return render(request, 'admin/analytics.html', context)

# Customize admin site headers
admin.site.site_header = "Juakali Marketplace Administration"
admin.site.site_title = "Juakali Admin"
admin.site.index_title = "Welcome to Juakali Marketplace Admin"

# Since CustomUser uses email as USERNAME_FIELD, Django admin should automatically use email
# But we need to ensure the login form works correctly
# The USERNAME_FIELD = 'email' in CustomUser model should handle this automatically
