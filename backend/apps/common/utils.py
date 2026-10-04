from apps.common.models import AuditLog


def get_client_ip(request):
    """Extract client IP address from request headers."""
    if request is None:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def get_user_agent(request):
    """Extract user agent string from request."""
    if request is None:
        return ''
    return request.META.get('HTTP_USER_AGENT', '')[:500]


def log_audit(user, action, entity_type, entity_id=None, before=None, after=None, request=None):
    """Create an audit log entry."""
    AuditLog.objects.create(
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        before_json=before,
        after_json=after,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
