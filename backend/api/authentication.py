from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from firebase_admin import auth
from django.conf import settings

# Import your CustomUser model
from users.models import CustomUser

class FirebaseAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None  # No auth header, let other auth methods try

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
            user, created = CustomUser.objects.get_or_create(
                firebase_uid=firebase_uid,
                defaults={
                    'email': decoded_token.get('email'),
                    'is_active': True
                    # Add other fields you want to sync from Firebase
                }
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