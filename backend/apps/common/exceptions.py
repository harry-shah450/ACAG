from rest_framework.exceptions import APIException, AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.views import exception_handler

from apps.common.responses import error_response


class InvalidCredentialsError(APIException):
    status_code = 401
    default_code = 'INVALID_CREDENTIALS'
    default_detail = 'Invalid username or password.'


class PermissionDeniedError(APIException):
    status_code = 403
    default_code = 'PERMISSION_DENIED'
    default_detail = 'You do not have permission to perform this action.'


class NotFoundError(APIException):
    status_code = 404
    default_code = 'NOT_FOUND'
    default_detail = 'Resource not found.'


def _build_error_payload(exc, response):
    details = response.data
    code = getattr(exc, 'default_code', 'ERROR')

    if isinstance(exc, AuthenticationFailed):
        code = 'INVALID_CREDENTIALS'
    elif isinstance(exc, NotAuthenticated):
        code = 'UNAUTHORIZED'
    elif isinstance(exc, PermissionDenied):
        code = 'PERMISSION_DENIED'

    if isinstance(details, dict) and 'detail' in details and len(details) == 1:
        message = str(details['detail'])
        details = None
    elif isinstance(details, dict) and 'detail' in details:
        message = str(details.pop('detail'))
    elif isinstance(details, list):
        message = '; '.join(str(item) for item in details)
        details = None
    else:
        message = 'Request failed.'
        if isinstance(details, dict) and not details:
            details = None

    if hasattr(exc, 'get_codes'):
        codes = exc.get_codes()
        if isinstance(codes, str):
            code = codes.upper()
        elif isinstance(codes, dict) and code == 'ERROR':
            code = 'VALIDATION_ERROR'

    return error_response(
        code=code,
        message=message,
        details=details,
        status_code=None,
    )


def custom_exception_handler(exc, context):
    """Return standardized error responses for API exceptions."""
    response = exception_handler(exc, context)

    if response is not None:
        response.data = _build_error_payload(exc, response)

    return response
