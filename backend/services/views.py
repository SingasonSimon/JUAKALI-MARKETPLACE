from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Service, Category, Booking, Review, Complaint, Payment
from .serializers import ServiceSerializer, CategorySerializer, BookingSerializer, ReviewSerializer, ComplaintSerializer, PaymentSerializer
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
    send_booking_admin_approved_email,
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
        # Booking is created with PENDING_ADMIN_APPROVAL status by default
        # Admin will need to approve it before provider can confirm


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
        user = request.user
        
        # Validate status transitions based on user role
        new_status = request.data.get('status')
        if new_status:
            # Admin can approve bookings
            if new_status == 'ADMIN_APPROVED' and user.role != 'ADMIN':
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only admins can approve bookings.")
            
            # Provider can only confirm ADMIN_APPROVED bookings
            if new_status == 'CONFIRMED':
                if user.role == 'PROVIDER' and old_status != 'ADMIN_APPROVED':
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("Booking must be approved by admin before provider can confirm.")
                if user.role != 'PROVIDER' and user.role != 'ADMIN':
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("Only providers can confirm bookings.")
        
        # Perform the update
        response = super().update(request, *args, **kwargs)
        
        # Refresh instance to get updated status
        instance.refresh_from_db()
        new_status = instance.status
        
        # Send email notifications based on status changes
        if old_status != new_status:
            if new_status == 'ADMIN_APPROVED':
                # Notify provider that booking is approved and ready for confirmation
                send_booking_admin_approved_email(instance)
            elif new_status == 'CONFIRMED':
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


class PaymentCreateView(generics.CreateAPIView):
    """
    POST: Create a payment for a booking.
    Only works for CONFIRMED bookings.
    Payment starts as PENDING and waits for provider to set payment details.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def perform_create(self, serializer):
        booking_id = self.request.data.get('booking')
        booking = Booking.objects.get(id=booking_id)
        
        # Only allow payment for CONFIRMED bookings
        if booking.status != 'CONFIRMED':
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Payment can only be processed for confirmed bookings.")
        
        # Check if payment already exists
        if hasattr(booking, 'payment'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                'error': 'Payment already exists for this booking.',
                'payment_id': booking.payment.id
            })
        
        # Only seeker can create payment for their booking
        if booking.seeker != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only pay for your own bookings.")
        
        # Get payment method from service or provider's default
        service = booking.service
        provider = service.provider
        
        # Refresh provider from database to ensure we have latest payment details
        provider.refresh_from_db()
        
        # Use service payment_method if set, otherwise use provider's default
        payment_method = service.payment_method or provider.provider_payment_method or 'MOBILE_MONEY'
        
        # Get provider payment number from provider profile
        provider_payment_number = provider.provider_payment_number
        
        # Create payment - starts as PENDING
        payment = serializer.save(booking=booking)
        payment.status = 'PENDING'
        payment.payment_method = payment_method
        
        # Set provider payment details if available
        if provider_payment_number:
            payment.provider_payment_number = provider_payment_number
            payment.provider_payment_method = payment_method
        else:
            # Log warning if provider hasn't set payment details
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Payment created for booking {booking.id} but provider {provider.id} hasn't set payment details in profile")
        
        payment.save()
        
        return payment


class PaymentDetailView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve payment details for a booking.
    PATCH: Update payment (admin only for status changes).
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Payment.objects.all()
        elif user.role == 'SEEKER':
            return Payment.objects.filter(booking__seeker=user)
        elif user.role == 'PROVIDER':
            return Payment.objects.filter(booking__service__provider=user)
        return Payment.objects.none()
    
    def update(self, request, *args, **kwargs):
        """Only allow admin to update payment status."""
        instance = self.get_object()
        user = request.user
        
        # Only admin can update payment status and admin fields
        if 'status' in request.data or 'admin_verified' in request.data or 'admin_notes' in request.data:
            if user.role != 'ADMIN' and not (user.is_staff or user.is_superuser):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only admins can update payment status and verification.")
        
        return super().update(request, *args, **kwargs)


class ProviderPaymentDetailsView(APIView):
    """
    POST/PATCH: Provider sets payment number and method for a booking payment.
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def post(self, request, payment_id):
        """Set provider payment details."""
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Only the provider who owns the service can set payment details
        if payment.booking.service.provider != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the service provider can set payment details.")
        
        # Allow setting details if provider_payment_number is not set yet
        # This allows provider to set payment details for any payment that doesn't have provider details yet
        if payment.provider_payment_number:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Payment details have already been set. Contact admin to update.")
        
        # Get payment details from request
        provider_payment_number = request.data.get('provider_payment_number')
        payment_method = request.data.get('payment_method', 'M_PESA')
        
        if not provider_payment_number:
            return Response(
                {'error': 'provider_payment_number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update payment with provider details
        payment.provider_payment_number = provider_payment_number
        payment.payment_method = payment_method
        payment.save()
        
        serializer = PaymentSerializer(payment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, payment_id):
        """Update provider payment details."""
        return self.post(request, payment_id)


class SeekerUploadScreenshotView(APIView):
    """
    POST: Seeker uploads M-Pesa payment screenshot.
    """
    permission_classes = [permissions.IsAuthenticated, IsSeeker]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def post(self, request, payment_id):
        """Upload payment screenshot."""
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Only the seeker who made the booking can upload screenshot
        if payment.booking.seeker != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only upload screenshots for your own payments.")
        
        # Check if payment has provider details
        if not payment.provider_payment_number:
            return Response(
                {'error': 'Provider payment details not set yet. Please wait for provider to set payment information.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if screenshot is provided
        if 'payment_screenshot' not in request.FILES:
            return Response(
                {'error': 'payment_screenshot file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Upload screenshot
        payment.payment_screenshot = request.FILES['payment_screenshot']
        payment.status = 'PENDING_VERIFICATION'
        payment.save()
        
        serializer = PaymentSerializer(payment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminVerifyPaymentView(APIView):
    """
    POST: Admin verifies payment and marks as completed.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def post(self, request, payment_id):
        """Verify payment and mark as completed."""
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Only allow verification of payments with screenshots
        if not payment.payment_screenshot:
            return Response(
                {'error': 'Payment screenshot is required for verification'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only allow verification of pending verification payments
        if payment.status != 'PENDING_VERIFICATION':
            return Response(
                {'error': f'Payment is not pending verification. Current status: {payment.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get verification action and notes
        action = request.data.get('action', 'approve')  # 'approve' or 'reject'
        admin_notes = request.data.get('admin_notes', '')
        
        if action == 'approve':
            # Mark as verified and completed
            payment.admin_verified = True
            payment.status = 'COMPLETED'
            payment.completed_at = timezone.now()
            if admin_notes:
                payment.admin_notes = admin_notes
            payment.save()
            
            return Response({
                'message': 'Payment verified and marked as completed',
                'payment': PaymentSerializer(payment, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        elif action == 'reject':
            # Reject payment - set back to pending
            payment.admin_verified = False
            payment.status = 'PENDING'
            if admin_notes:
                payment.admin_notes = admin_notes
            payment.save()
            
            return Response({
                'message': 'Payment rejected. Seeker can upload a new screenshot.',
                'payment': PaymentSerializer(payment, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid action. Use "approve" or "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PendingVerificationListView(generics.ListAPIView):
    """
    GET: List all payments pending admin verification.
    Admin only.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_queryset(self):
        """Return payments pending verification."""
        return Payment.objects.filter(status='PENDING_VERIFICATION').order_by('-created_at')


class ProviderPaymentListView(generics.ListAPIView):
    """
    GET: List all payments for services provided by the authenticated provider.
    Provider only.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_queryset(self):
        """Return payments for provider's services."""
        if self.request.user.role != 'PROVIDER':
            return Payment.objects.none()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        queryset = Payment.objects.filter(booking__service__provider=self.request.user)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.select_related('booking', 'booking__service', 'booking__seeker').order_by('-created_at')


class SeekerPaymentListView(generics.ListAPIView):
    """
    GET: List all payments for bookings made by the authenticated seeker.
    Seeker only.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_queryset(self):
        """Return payments for seeker's bookings."""
        if self.request.user.role != 'SEEKER':
            return Payment.objects.none()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        queryset = Payment.objects.filter(booking__seeker=self.request.user)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.select_related('booking', 'booking__service', 'booking__service__provider').order_by('-created_at')


class AdminPaymentListView(generics.ListAPIView):
    """
    GET: List all payments in the system.
    Admin only.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get_queryset(self):
        """Return all payments, optionally filtered by status."""
        status_filter = self.request.query_params.get('status', None)
        queryset = Payment.objects.all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.select_related('booking', 'booking__service', 'booking__service__provider', 'booking__seeker').order_by('-created_at')


class ProviderAnalyticsView(APIView):
    """
    GET: Provider-specific analytics including revenue from their services
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication, SessionAuthentication]
    
    def get(self, request):
        if request.user.role != 'PROVIDER':
            return Response({'error': 'Only providers can access this endpoint'}, status=403)
        
        provider = request.user
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)
        
        # Provider's services
        provider_services = Service.objects.filter(provider=provider)
        total_services = provider_services.count()
        services_by_category = provider_services.values('category__name').annotate(count=Count('id'))
        avg_service_price = provider_services.aggregate(avg_price=Avg('price'))['avg_price'] or 0
        
        # Provider's bookings
        provider_bookings = Booking.objects.filter(service__provider=provider)
        total_bookings = provider_bookings.count()
        bookings_by_status = provider_bookings.values('status').annotate(count=Count('id'))
        bookings_30d = provider_bookings.filter(created_at__gte=thirty_days_ago).count()
        bookings_7d = provider_bookings.filter(created_at__gte=seven_days_ago).count()
        
        # Revenue calculations from completed payments
        completed_payments = Payment.objects.filter(
            booking__service__provider=provider,
            booking__status='COMPLETED',
            status='COMPLETED'
        )
        
        total_revenue = completed_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        # For revenue calculations, use completed_at if available, otherwise use created_at
        revenue_30d = completed_payments.filter(
            Q(completed_at__gte=thirty_days_ago) | Q(completed_at__isnull=True, created_at__gte=thirty_days_ago)
        ).aggregate(total=Sum('amount'))['total'] or 0
        revenue_7d = completed_payments.filter(
            Q(completed_at__gte=seven_days_ago) | Q(completed_at__isnull=True, created_at__gte=seven_days_ago)
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Daily revenue for last 7 days
        daily_revenue = []
        for i in range(7):
            date = seven_days_ago + timedelta(days=i)
            next_date = date + timedelta(days=1)
            # Use completed_at if available, otherwise use created_at
            day_revenue = completed_payments.filter(
                Q(completed_at__gte=date, completed_at__lt=next_date) |
                Q(completed_at__isnull=True, created_at__gte=date, created_at__lt=next_date)
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            daily_revenue.append({
                'date': date.date().isoformat(),
                'revenue': float(day_revenue)
            })
        
        # Daily bookings for last 7 days
        daily_bookings = []
        for i in range(7):
            date = seven_days_ago + timedelta(days=i)
            next_date = date + timedelta(days=1)
            day_bookings = provider_bookings.filter(
                created_at__gte=date,
                created_at__lt=next_date
            ).count()
            
            daily_bookings.append({
                'date': date.date().isoformat(),
                'count': day_bookings
            })
        
        # Reviews for provider's services
        provider_reviews = Review.objects.filter(service__provider=provider)
        total_reviews = provider_reviews.count()
        avg_rating = provider_reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        reviews_30d = provider_reviews.filter(created_at__gte=thirty_days_ago).count()
        
        return Response({
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
            'revenue': {
                'total': float(total_revenue),
                'last_30d': float(revenue_30d),
                'last_7d': float(revenue_7d),
            },
            'reviews': {
                'total': total_reviews,
                'avg_rating': round(avg_rating, 2),
                'new_30d': reviews_30d,
            },
            'trends': {
                'daily_revenue': daily_revenue,
                'daily_bookings': daily_bookings,
            }
        }, status=200)