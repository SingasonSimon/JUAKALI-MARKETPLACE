from rest_framework.authentication import BaseAuthentication, SessionAuthentication
from rest_framework import exceptions
from firebase_admin import auth
from django.conf import settings

# Import your CustomUser model
from users.models import CustomUser

class FirebaseAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None  # No auth header, let SessionAuthentication try

        try:
            # Expecting "Bearer <token>"
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                raise exceptions.AuthenticationFailed('Invalid Authorization header prefix.')

            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token.get('uid')

            if not firebase_uid:
                raise exceptions.AuthenticationFailed('Invalid Firebase token: missing UID.')

            # Get or create the user in Django's database
            # This links the Firebase user to a Django user
            firebase_email = decoded_token.get('email')
            
            # First try to find user by email (in case admin was created before Firebase login)
            user = None
            if firebase_email:
                try:
                    user = CustomUser.objects.get(email=firebase_email)
                    # Link Firebase UID to existing user
                    if not user.firebase_uid:
                        user.firebase_uid = firebase_uid
                        user.save()
                    elif user.firebase_uid != firebase_uid:
                        # Firebase UID changed, update it
                        user.firebase_uid = firebase_uid
                        user.save()
                except CustomUser.DoesNotExist:
                    pass
            
            # If no user found by email, try by firebase_uid
            if not user:
                try:
                    user = CustomUser.objects.get(firebase_uid=firebase_uid)
                    # Update email if it changed in Firebase
                    if firebase_email and user.email != firebase_email:
                        user.email = firebase_email
                        user.save()
                except CustomUser.DoesNotExist:
                    # Create new user if none exists
                    user = CustomUser.objects.create(
                        email=firebase_email or f"user_{firebase_uid}@firebase.local",
                        firebase_uid=firebase_uid,
                        is_active=True,
                        role='SEEKER'  # Default role for new users
                    )

            return (user, decoded_token)

        except auth.ExpiredIdTokenError:
            raise exceptions.AuthenticationFailed('Firebase token has expired.')
        except auth.InvalidIdTokenError as e:
            # Log more details about the error
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Invalid Firebase token: {str(e)}')
            raise exceptions.AuthenticationFailed('Invalid Firebase token. Please ensure the Firebase service account matches your Firebase project.')
        except ValueError as e:
            raise exceptions.AuthenticationFailed(f'Invalid Authorization header: {str(e)}')
        except CustomUser.DoesNotExist:
            raise exceptions.AuthenticationFailed('No user found for this token.')
        except Exception as e:
            # Log the full error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Authentication error: {type(e).__name__}: {str(e)}')
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')