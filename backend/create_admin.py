#!/usr/bin/env python
"""
Django management script to create an admin user.
Run this with: python manage.py shell < create_admin.py
Or run: python create_admin.py (if Django is set up)
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser

def create_admin_user(email, first_name="Admin", last_name="User", password=None):
    """
    Create an admin user.
    
    Args:
        email: Email address for the admin user
        first_name: First name (default: "Admin")
        last_name: Last name (default: "User")
        password: Password (if None, will prompt)
    """
    # Check if user already exists
    if CustomUser.objects.filter(email=email).exists():
        user = CustomUser.objects.get(email=email)
        user.role = 'ADMIN'
        user.save()
        print(f"✅ User {email} already exists. Updated role to ADMIN.")
        return user
    
    # Create new admin user
    user = CustomUser.objects.create_user(
        email=email,
        first_name=first_name,
        last_name=last_name,
        role='ADMIN'
    )
    
    # Note: Since we're using Firebase for auth, the password field might not be used
    # But we can set it for Django admin access if needed
    if password:
        user.set_password(password)
        user.save()
    
    print(f"✅ Admin user created successfully!")
    print(f"   Email: {user.email}")
    print(f"   Name: {user.first_name} {user.last_name}")
    print(f"   Role: {user.role}")
    print(f"\n⚠️  Note: Authentication is handled by Firebase.")
    print(f"   Make sure to register/login through Firebase with this email: {email}")
    
    return user

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        email = sys.argv[1]
        first_name = sys.argv[2] if len(sys.argv) > 2 else "Admin"
        last_name = sys.argv[3] if len(sys.argv) > 3 else "User"
    else:
        email = input("Enter admin email: ")
        first_name = input("Enter first name (default: Admin): ") or "Admin"
        last_name = input("Enter last name (default: User): ") or "User"
    
    create_admin_user(email, first_name, last_name)

