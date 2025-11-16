from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwner(BasePermission):
    # Access only for owner, manager
    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        return request.user.is_authenticated and role in ["owner", "manager"]
    
class IsOwnerOrManager(BasePermission):
    # Manager and owner access
    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        return request.user.is_authenticated and role in ["owner", "manager"]
    
    # Allow access for only owner
    #def has_permission(self, request, view):
    #    return request.user.is_authenticated and getattr(request.user, "role", None) == "owner"

class IsOwnerManagerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # Read for everyone.
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # Changes only for owner or manager.
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) in ["owner", "manager"]
        )
