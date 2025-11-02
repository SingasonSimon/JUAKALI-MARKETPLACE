from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows login with email instead of username.
    Django admin will use this to authenticate users by email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Django admin passes 'username' parameter, but we want to use email
        # Since CustomUser uses email as USERNAME_FIELD, 'username' will actually be the email
        email = kwargs.get('email') or username
        
        if email is None or password is None:
            return None
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a non-existing user
            User().set_password(password)
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None

