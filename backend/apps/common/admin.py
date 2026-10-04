from django.contrib import admin

from apps.common.models import AuditLog, Division, Notification


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'action', 'entity_type', 'entity_id',
        'ip_address', 'created_at',
    )
    list_filter = ('action', 'entity_type', 'created_at')
    search_fields = ('action', 'entity_type', 'user__username')
    readonly_fields = ('created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'type', 'title', 'priority', 'is_read',
        'related_project', 'created_at',
    )
    list_filter = ('type', 'priority', 'is_read', 'created_at')
    search_fields = ('title', 'body', 'user__username')
    readonly_fields = ('created_at',)
