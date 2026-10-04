from rest_framework import permissions

from apps.common.enums import UserRole


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


class IsBackendReviewEngineer(permissions.BasePermission):
    """Allow access to backend review engineers and admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in (UserRole.BACKEND_REVIEW_ENGINEER, UserRole.ADMIN)
        )


class IsFieldEngineer(permissions.BasePermission):
    """Allow access to field engineers and admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in (UserRole.FIELD_ENGINEER, UserRole.ADMIN)
        )


class IsHouseOwner(permissions.BasePermission):
    """Allow access only to house owners."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.HOUSE_OWNER
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access if the user owns the object or is an admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.ADMIN:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'id'):
            return obj.id == request.user.id
        return False


class CanViewProject(permissions.BasePermission):
    """Permission to view a project: Admin, BRE, assigned FE, or owning HouseOwner."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.role in (UserRole.ADMIN, UserRole.BACKEND_REVIEW_ENGINEER):
            return True
        if user.role == UserRole.FIELD_ENGINEER:
            return obj.assigned_engineer_id == user.id
        if user.role == UserRole.HOUSE_OWNER:
            return (
                (user.cnic_hash and obj.owner_cnic_hash == user.cnic_hash)
                or (user.phone and obj.owner_phone == user.phone)
            )
        return False


class CanEditProject(permissions.BasePermission):
    """Permission to edit project details: Admin or assigned FieldEngineer."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.role == UserRole.ADMIN:
            return True
        if user.role == UserRole.FIELD_ENGINEER:
            return obj.assigned_engineer_id == user.id
        return False


class CanCompleteMilestone(permissions.BasePermission):
    """Permission to complete milestone: FieldEngineer assigned to project, or Admin."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.role == UserRole.ADMIN:
            return True
        if user.role == UserRole.FIELD_ENGINEER:
            return obj.assigned_engineer_id == user.id
        return False

