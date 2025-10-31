from django.urls import path
from . import views

urlpatterns = [
    # /api/categories/
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),

    # /api/services/
    path('services/', views.ServiceListCreateView.as_view(), name='service-list-create'),

    # /api/services/<pk>/
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    
    # /api/bookings/
    path('bookings/', views.BookingListCreateView.as_view(), name='booking-list-create'),
    
    # /api/bookings/<pk>/
    path('bookings/<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
]