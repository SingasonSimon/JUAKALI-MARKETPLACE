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
]