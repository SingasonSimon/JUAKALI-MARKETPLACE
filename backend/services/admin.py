from django.contrib import admin
from .models import Booking, Service, Category, Review, Complaint

# Register your models here.
admin.site.register(Booking)
admin.site.register(Service)
admin.site.register(Category)
admin.site.register(Review)
admin.site.register(Complaint)