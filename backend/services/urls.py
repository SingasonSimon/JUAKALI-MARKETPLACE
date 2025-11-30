from django.urls import path
from . import views

urlpatterns = [
    # /api/categories/
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    
    # /api/categories/<pk>/
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),

    # /api/services/
    path('services/', views.ServiceListCreateView.as_view(), name='service-list-create'),

    # /api/services/<pk>/
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    
    # /api/bookings/
    path('bookings/', views.BookingListCreateView.as_view(), name='booking-list-create'),
    
    # /api/bookings/<pk>/
    path('bookings/<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    
    # /api/services/my-services/
    path('services/my-services/', views.ProviderServiceListView.as_view(), name='provider-service-list'),
    
    # /api/reviews/
    path('reviews/', views.ReviewListCreateView.as_view(), name='review-list-create'),
    
    # /api/reviews/<pk>/
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    
    # /api/complaints/
    path('complaints/', views.ComplaintListCreateView.as_view(), name='complaint-list-create'),
    
    # /api/complaints/<pk>/
    path('complaints/<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint-detail'),
    
    # /api/payments/
    path('payments/', views.PaymentCreateView.as_view(), name='payment-create'),
    
    # /api/payments/<pk>/
    path('payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    
    # /api/payments/<id>/provider-details/ - Provider sets payment number
    path('payments/<int:payment_id>/provider-details/', views.ProviderPaymentDetailsView.as_view(), name='payment-provider-details'),
    
    # /api/payments/<id>/upload-screenshot/ - Seeker uploads payment screenshot
    path('payments/<int:payment_id>/upload-screenshot/', views.SeekerUploadScreenshotView.as_view(), name='payment-upload-screenshot'),
    
    # /api/payments/<id>/verify/ - Admin verifies payment
    path('payments/<int:payment_id>/verify/', views.AdminVerifyPaymentView.as_view(), name='payment-verify'),
    
    # /api/payments/pending-verification/ - Admin list pending verifications
    path('payments/pending-verification/', views.PendingVerificationListView.as_view(), name='payment-pending-verification'),
    
    # /api/payments/provider/ - Provider list their payments
    path('payments/provider/', views.ProviderPaymentListView.as_view(), name='payment-provider-list'),
    
    # /api/payments/seeker/ - Seeker list their payments
    path('payments/seeker/', views.SeekerPaymentListView.as_view(), name='payment-seeker-list'),
    
    # /api/payments/admin/ - Admin list all payments
    path('payments/admin/', views.AdminPaymentListView.as_view(), name='payment-admin-list'),
    
    # /api/provider/analytics/
    path('provider/analytics/', views.ProviderAnalyticsView.as_view(), name='provider-analytics'),
]