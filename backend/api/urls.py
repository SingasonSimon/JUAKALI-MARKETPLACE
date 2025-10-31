from django.urls import path
from . import views

urlpatterns = [
    # /api/users/me/
    path('users/me/', views.CurrentUserView.as_view(), name='current-user'),
]