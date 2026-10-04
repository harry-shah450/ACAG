from rest_framework import status
from rest_framework.response import Response


def success_response(data=None, message=None, status_code=status.HTTP_200_OK):
    """Build a standardized success response."""
    payload = {'status': 'success', 'data': data}
    if message:
        payload['message'] = message
    return Response(payload, status=status_code)


def error_response(code, message, details=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Build a standardized error response dict (for Response or exception handler)."""
    payload = {
        'status': 'error',
        'code': code,
        'message': message,
    }
    if details is not None:
        payload['details'] = details
    return payload if status_code is None else Response(payload, status=status_code)
