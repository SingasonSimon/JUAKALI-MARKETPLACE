"""
Email utility functions for sending notifications.
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_email_notification(user, subject, template_name, context):
    """
    Send an email notification to a user if they have email notifications enabled.
    
    Args:
        user: CustomUser instance
        subject: Email subject line
        template_name: Name of the email template (without .html extension)
        context: Dictionary of context variables for the template
    
    Returns:
        bool: True if email was sent, False otherwise
    """
    # Check if user has email notifications enabled
    if not user.email_notifications:
        return False
    
    # Check if user has an email address
    if not user.email:
        return False
    
    try:
        # Render HTML email template
        html_message = render_to_string(f'emails/{template_name}.html', context)
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        # Log error but don't fail the request
        print(f"Error sending email to {user.email}: {str(e)}")
        return False


def send_booking_confirmation_email(booking):
    """Send email when a booking is confirmed."""
    seeker = booking.seeker
    provider = booking.service.provider
    
    # Email to seeker
    send_email_notification(
        user=seeker,
        subject=f'Booking Confirmed: {booking.service.title}',
        template_name='booking_confirmed_seeker',
        context={
            'booking': booking,
            'service': booking.service,
            'provider': provider,
            'seeker': seeker,
        }
    )
    
    # Email to provider
    send_email_notification(
        user=provider,
        subject=f'New Booking Confirmed: {booking.service.title}',
        template_name='booking_confirmed_provider',
        context={
            'booking': booking,
            'service': booking.service,
            'provider': provider,
            'seeker': seeker,
        }
    )


def send_booking_completed_email(booking):
    """Send email when a booking is completed."""
    seeker = booking.seeker
    provider = booking.service.provider
    
    # Email to seeker
    send_email_notification(
        user=seeker,
        subject=f'Booking Completed: {booking.service.title}',
        template_name='booking_completed_seeker',
        context={
            'booking': booking,
            'service': booking.service,
            'provider': provider,
            'seeker': seeker,
        }
    )
    
    # Email to provider
    send_email_notification(
        user=provider,
        subject=f'Booking Completed: {booking.service.title}',
        template_name='booking_completed_provider',
        context={
            'booking': booking,
            'service': booking.service,
            'provider': provider,
            'seeker': seeker,
        }
    )


def send_booking_canceled_email(booking, canceled_by):
    """Send email when a booking is canceled."""
    seeker = booking.seeker
    provider = booking.service.provider
    
    # Determine who to notify
    if canceled_by == 'SEEKER':
        # Notify provider
        send_email_notification(
            user=provider,
            subject=f'Booking Canceled: {booking.service.title}',
            template_name='booking_canceled_provider',
            context={
                'booking': booking,
                'service': booking.service,
                'provider': provider,
                'seeker': seeker,
                'canceled_by': 'seeker',
            }
        )
    elif canceled_by == 'PROVIDER':
        # Notify seeker
        send_email_notification(
            user=seeker,
            subject=f'Booking Canceled: {booking.service.title}',
            template_name='booking_canceled_seeker',
            context={
                'booking': booking,
                'service': booking.service,
                'provider': provider,
                'seeker': seeker,
                'canceled_by': 'provider',
            }
        )


def send_new_review_email(review):
    """Send email when a new review is posted."""
    provider = review.service.provider
    seeker = review.seeker
    
    # Email to provider
    send_email_notification(
        user=provider,
        subject=f'New Review: {review.service.title}',
        template_name='new_review',
        context={
            'review': review,
            'service': review.service,
            'provider': provider,
            'seeker': seeker,
        }
    )


def send_complaint_resolved_email(complaint):
    """Send email when a complaint is resolved."""
    user = complaint.user
    
    send_email_notification(
        user=user,
        subject=f'Complaint Resolved: {complaint.complaint_type}',
        template_name='complaint_resolved',
        context={
            'complaint': complaint,
            'user': user,
        }
    )

