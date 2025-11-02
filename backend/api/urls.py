from django.urls import path
from . import views

urlpatterns = [
    # /api/users/me/
    path('users/me/', views.CurrentUserView.as_view(), name='current-user'),
    
    # Django admin session check
    path('django-admin/session/', views.DjangoAdminSessionView.as_view(), name='django-admin-session'),
    path('django-admin/logout/', views.DjangoAdminLogoutView.as_view(), name='django-admin-logout'),
    
    # Admin endpoints
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:id>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:user_id>/activate/', views.AdminUserActivateView.as_view(), name='admin-user-activate'),
    path('admin/analytics/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('admin/reports/', views.AdminReportsView.as_view(), name='admin-reports'),
    path('admin/action-logs/', views.AdminActionLogView.as_view(), name='admin-action-logs'),
]