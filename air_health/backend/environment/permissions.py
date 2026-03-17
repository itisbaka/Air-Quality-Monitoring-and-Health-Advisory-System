from rest_framework import permissions


class IsEnvironmentalOfficer(permissions.BasePermission):
    """Allow access only to users with the Environmental Officer role."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, 'role', None) == 'officer')
