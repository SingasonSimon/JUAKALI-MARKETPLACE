from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from users.serializers import CustomUserSerializer

class CurrentUserView(RetrieveUpdateAPIView):
    """
    Handles GET and PATCH requests for the currently authenticated user.
    - GET /api/users/me/: Returns the user's details.
    - PATCH /api/users/me/: Updates the user's details (e.g., role, name).
    """
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        Returns the user object based on the authenticated request.
        Our FirebaseAuthentication class already attached the user to request.user.
        """
        return self.request.user