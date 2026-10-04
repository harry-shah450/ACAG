from django.db.models import Q
from django.shortcuts import get_object_or_404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import JuniorEngineer, User
from apps.accounts.serializers import (
    JuniorEngineerSerializer,
    LoginSerializer,
    RegisterUserSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from apps.common.enums import AuditAction
from apps.common.pagination import StandardResultsSetPagination
from apps.common.permissions import IsAdmin
from apps.common.responses import error_response, success_response
from apps.common.utils import log_audit


class LoginView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary='User Login',
        operation_description='Enter username and password to authenticate and obtain JWT access and refresh tokens.',
        request_body=LoginSerializer,
        responses={
            200: 'Login successful with access_token and user info',
            400: 'Validation error / missing credentials',
            401: 'Invalid username or password',
        },
        tags=['Authentication'],
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            non_field = errors.get('non_field_errors', [])
            if non_field:
                return error_response(
                    code='INVALID_CREDENTIALS',
                    message=str(non_field[0]),
                    status_code=status.HTTP_401_UNAUTHORIZED,
                )
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid credentials.',
                details=errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        log_audit(
            user=user,
            action=AuditAction.LOGIN,
            entity_type='user',
            entity_id=user.id,
            request=request,
        )

        return success_response(
            data={
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': UserSerializer(user).data,
                'role': user.role,
            },
            message='Login successful.',
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='User Logout',
        operation_description='Blacklist refresh token to log out.',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={'refresh_token': openapi.Schema(type=openapi.TYPE_STRING, description='JWT refresh token')},
            required=['refresh_token'],
        ),
        tags=['Authentication'],
    )
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        log_audit(
            user=request.user,
            action=AuditAction.LOGOUT,
            entity_type='user',
            entity_id=request.user.id,
            request=request,
        )

        return success_response(message='Logout successful.')


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Get Current Authenticated User',
        operation_description='Retrieve details of the currently logged-in user.',
        tags=['Authentication'],
    )
    def get(self, request):
        return success_response(data=UserSerializer(request.user).data)


class RegisterUserView(APIView):
    permission_classes = [IsAdmin]

    @swagger_auto_schema(
        operation_summary='Register User',
        operation_description='Admin-only: register a new system user.',
        request_body=RegisterUserSerializer,
        tags=['Users'],
    )
    def post(self, request):
        serializer = RegisterUserSerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Registration failed.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        return success_response(
            data=UserSerializer(user).data,
            message='User registered successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class UserListView(APIView):
    permission_classes = [IsAdmin]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        queryset = User.objects.all()

        role = request.query_params.get('role')
        is_active = request.query_params.get('is_active')
        division = request.query_params.get('division')
        district = request.query_params.get('district')
        search = request.query_params.get('search')

        if role:
            queryset = queryset.filter(role=role)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() in ('true', '1', 'yes'))
        if division:
            queryset = queryset.filter(division__iexact=division)
        if district:
            queryset = queryset.filter(district__iexact=district)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
            )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class UserDetailView(APIView):
    permission_classes = [IsAdmin]

    def get_object(self, user_id):
        return get_object_or_404(User, pk=user_id)

    def get(self, request, id):
        user = self.get_object(id)
        return success_response(data=UserSerializer(user).data)

    @swagger_auto_schema(
        operation_summary='Update User (Full)',
        request_body=UserUpdateSerializer,
        tags=['Users'],
    )
    def put(self, request, id):
        return self._update(request, id, partial=False)

    @swagger_auto_schema(
        operation_summary='Update User (Partial)',
        request_body=UserUpdateSerializer,
        tags=['Users'],
    )
    def patch(self, request, id):
        return self._update(request, id, partial=True)

    def _update(self, request, user_id, partial):
        user = self.get_object(user_id)
        serializer = UserUpdateSerializer(
            user,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Update failed.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        user = serializer.save()
        return success_response(
            data=UserSerializer(user).data,
            message='User updated successfully.',
        )

    def delete(self, request, id):
        user = self.get_object(id)
        before = UserSerializer(user).data
        user.is_active = False
        user.save(update_fields=['is_active'])

        log_audit(
            user=request.user,
            action=AuditAction.DEACTIVATE,
            entity_type='user',
            entity_id=user.id,
            before=before,
            after=UserSerializer(user).data,
            request=request,
        )

        return success_response(message='User deactivated successfully.')


class UserActivateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, id):
        user = get_object_or_404(User, pk=id)
        before = UserSerializer(user).data
        user.is_active = True
        user.save(update_fields=['is_active'])

        log_audit(
            user=request.user,
            action=AuditAction.ACTIVATE,
            entity_type='user',
            entity_id=user.id,
            before=before,
            after=UserSerializer(user).data,
            request=request,
        )

        return success_response(
            data=UserSerializer(user).data,
            message='User activated successfully.',
        )


class JuniorEngineerListView(APIView):
    """List and create junior engineers in the directory (dashboard data)."""

    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        queryset = JuniorEngineer.objects.filter(is_active=True)

        division = request.query_params.get('division')
        district = request.query_params.get('district') or request.query_params.get('assigned_district')
        search = request.query_params.get('search')

        if division:
            queryset = queryset.filter(division__iexact=division)
        if district:
            queryset = queryset.filter(assigned_district__iexact=district)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
                | Q(cnic__icontains=search)
            )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = JuniorEngineerSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        operation_summary='Register Junior Engineer',
        request_body=JuniorEngineerSerializer,
        tags=['Junior Engineers'],
    )
    def post(self, request):
        data = request.data.copy()
        if not data.get('sr_no'):
            max_sr = JuniorEngineer.objects.all().order_by('-sr_no').first()
            data['sr_no'] = (max_sr.sr_no + 1) if max_sr else 1

        serializer = JuniorEngineerSerializer(data=data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Junior engineer registration failed.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        engineer = serializer.save()
        return success_response(
            data=JuniorEngineerSerializer(engineer).data,
            message='Junior engineer registered successfully.',
            status_code=status.HTTP_201_CREATED,
        )
