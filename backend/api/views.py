from rest_framework.generics import RetrieveUpdateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, Avg
from django.utils import timezone
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import logout as django_logout
from datetime import timedelta
from users.serializers import CustomUserSerializer
from .permissions import IsAdminUser
from .authentication import FirebaseAuthentication
from .utils import log_admin_action, get_client_ip
from .models import AdminActionLog
from users.models import CustomUser
from services.models import Service, Booking, Review, Complaint

class CurrentUserView(RetrieveUpdateAPIView):
    """
    Handles GET and PATCH requests for the currently authenticated user.
    - GET /api/users/me/: Returns the user's details.
    - PATCH /api/users/me/: Updates the user's details (e.g., role, name).
    """
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        Returns the user object based on the authenticated request.
        Our FirebaseAuthentication class already attached the user to request.user.
        """
        return self.request.user

class DjangoAdminSessionView(APIView):
    """
    GET: Check if user is authenticated via Django session (for Django admin users)
    This allows Django admin users to access the frontend admin dashboard.
    Also returns CSRF token for authenticated users.
    """
    permission_classes = []  # No authentication required - we check session
    
    def get(self, request):
        """
        Check if user is authenticated via Django session and is staff/superuser.
        """
        # Debug logging
        print(f"Session check - User authenticated: {request.user.is_authenticated}")
        print(f"Session check - User: {request.user}")
        print(f"Session check - Is staff: {getattr(request.user, 'is_staff', False)}")
        print(f"Session check - Is superuser: {getattr(request.user, 'is_superuser', False)}")
        print(f"Session check - Session key: {request.session.session_key}")
        
        if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
            serializer = CustomUserSerializer(request.user)
            csrf_token = get_token(request)
            return Response({
                'authenticated': True,
                'user': serializer.data,
                'is_django_admin': True,
                'csrf_token': csrf_token
            }, status=status.HTTP_200_OK)
        return Response({
            'authenticated': False,
            'is_django_admin': False,
            'debug': {
                'user_authenticated': request.user.is_authenticated,
                'is_staff': getattr(request.user, 'is_staff', False),
                'is_superuser': getattr(request.user, 'is_superuser', False),
            }
        }, status=status.HTTP_200_OK)

class DjangoAdminLogoutView(APIView):
    """
    POST: Logout Django admin user (destroys session)
    GET: Also handle GET requests for compatibility (redirects or shows message)
    """
    permission_classes = []  # No authentication required - we're logging out
    
    def post(self, request):
        """
        Logout the Django admin user by destroying their session.
        """
        if request.user.is_authenticated:
            django_logout(request)
            return Response({
                'success': True,
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)
        return Response({
            'success': True,
            'message': 'Already logged out'
        }, status=status.HTTP_200_OK)
    
    def get(self, request):
        """
        Handle GET requests (for compatibility) - logout and redirect
        """
        if request.user.is_authenticated:
            django_logout(request)
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)

class AdminUserListView(ListAPIView):
    """
    GET: Returns a list of all users. (Admin only)
    """
    queryset = CustomUser.objects.all().order_by('email')
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]  # Explicitly include SessionAuthentication

class AdminUserActivateView(APIView):
    """
    POST: Activate or deactivate a user (Admin only)
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def post(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        old_status = user.is_active
        user.is_active = not user.is_active
        user.save()
        
        # Log admin action
        action_type = AdminActionLog.ActionType.ACTIVATE if user.is_active else AdminActionLog.ActionType.DEACTIVATE
        log_admin_action(
            admin_user=request.user,
            action_type=action_type,
            resource_type=AdminActionLog.ResourceType.USER,
            resource_id=user.id,
            description=f"User {user.email} {'activated' if user.is_active else 'deactivated'}",
            changes={'before': {'is_active': old_status}, 'after': {'is_active': user.is_active}},
            ip_address=get_client_ip(request)
        )
        
        serializer = CustomUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminUserDetailView(RetrieveUpdateDestroyAPIView):
    """
    GET: Get user details (Admin only)
    PATCH/PUT: Update user (Admin only)
    DELETE: Delete user (Admin only)
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_data = {
            'role': instance.role,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'is_active': instance.is_active
        }
        response = super().update(request, *args, **kwargs)
        
        # Log admin action
        new_data = {
            'role': instance.role,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'is_active': instance.is_active
        }
        log_admin_action(
            admin_user=request.user,
            action_type=AdminActionLog.ActionType.UPDATE,
            resource_type=AdminActionLog.ResourceType.USER,
            resource_id=instance.id,
            description=f"Updated user {instance.email}",
            changes={'before': old_data, 'after': new_data},
            ip_address=get_client_ip(request)
        )
        
        return response
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user_email = instance.email
        
        log_admin_action(
            admin_user=request.user,
            action_type=AdminActionLog.ActionType.DELETE,
            resource_type=AdminActionLog.ResourceType.USER,
            resource_id=instance.id,
            description=f"Deleted user {user_email}",
            ip_address=get_client_ip(request)
        )
        
        return super().destroy(request, *args, **kwargs)

class AdminAnalyticsView(APIView):
    """
    GET: System-wide analytics and statistics (Admin only)
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get(self, request):
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
        
        # Growth trends
        daily_signups = []
        daily_bookings = []
        for i in range(7):
            date = seven_days_ago + timedelta(days=i)
            next_date = date + timedelta(days=1)
            daily_signups.append({
                'date': date.date().isoformat(),
                'count': CustomUser.objects.filter(date_joined__gte=date, date_joined__lt=next_date).count()
            })
            daily_bookings.append({
                'date': date.date().isoformat(),
                'count': Booking.objects.filter(created_at__gte=date, created_at__lt=next_date).count()
            })
        
        return Response({
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
                'avg_rating': round(avg_rating, 2),
                'new_30d': reviews_30d,
            },
            'complaints': {
                'total': total_complaints,
                'by_status': list(complaints_by_status),
                'new_30d': complaints_30d,
            },
            'trends': {
                'daily_signups': daily_signups,
                'daily_bookings': daily_bookings,
            }
        }, status=status.HTTP_200_OK)

class AdminReportsView(APIView):
    """
    GET: Detailed reports (Admin only)
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get(self, request):
        report_type = request.query_params.get('type', 'activity')
        
        if report_type == 'user_activity':
            # User activity report
            active_users_last_30d = CustomUser.objects.filter(
                is_active=True,
                date_joined__gte=timezone.now() - timedelta(days=30)
            ).values('id', 'email', 'first_name', 'last_name', 'role', 'date_joined')
            
            return Response({
                'type': 'user_activity',
                'data': list(active_users_last_30d)
            })
        
        elif report_type == 'service_performance':
            # Service performance report
            services_with_stats = Service.objects.annotate(
                booking_count=Count('bookings'),
                review_count=Count('reviews'),
                avg_rating=Avg('reviews__rating')
            ).values(
                'id', 'title', 'provider__email', 'category__name',
                'price', 'booking_count', 'review_count', 'avg_rating'
            )
            
            return Response({
                'type': 'service_performance',
                'data': list(services_with_stats)
            })
        
        elif report_type == 'booking_analytics':
            # Booking analytics
            bookings_by_date = Booking.objects.extra(
                select={'date': 'DATE(created_at)'}
            ).values('date').annotate(
                count=Count('id'),
                confirmed=Count('id', filter=Q(status='CONFIRMED')),
                completed=Count('id', filter=Q(status='COMPLETED')),
                canceled=Count('id', filter=Q(status='CANCELED'))
            ).order_by('-date')[:30]
            
            return Response({
                'type': 'booking_analytics',
                'data': list(bookings_by_date)
            })
        
        return Response({'error': 'Invalid report type'}, status=status.HTTP_400_BAD_REQUEST)

class AdminActionLogView(ListAPIView):
    """
    GET: List admin action logs (Admin only)
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_queryset(self):
        queryset = AdminActionLog.objects.select_related('admin_user').all()
        
        # Filter by resource type if provided
        resource_type = self.request.query_params.get('resource_type', None)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        # Filter by admin user if provided
        admin_id = self.request.query_params.get('admin_id', None)
        if admin_id:
            queryset = queryset.filter(admin_user_id=admin_id)
        
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_serializer_class(self):
        from rest_framework import serializers
        
        class AdminActionLogSerializer(serializers.ModelSerializer):
            admin_user_email = serializers.EmailField(source='admin_user.email', read_only=True)
            
            class Meta:
                model = AdminActionLog
                fields = [
                    'id', 'admin_user_email', 'action_type', 'resource_type',
                    'resource_id', 'description', 'changes', 'ip_address', 'created_at'
                ]
        
        return AdminActionLogSerializer