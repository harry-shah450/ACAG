from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import EngineerProfile, JuniorEngineer, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'id', 'username', 'email', 'role', 'phone', 'division', 'district',
        'is_active', 'is_staff', 'created_at',
    )
    list_filter = ('role', 'is_active', 'is_staff', 'division', 'district')
    search_fields = ('username', 'email', 'phone', 'first_name', 'last_name')
    readonly_fields = ('created_at', 'last_login', 'date_joined')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('ACAG Profile', {
            'fields': ('role', 'phone', 'cnic_hash', 'division', 'district', 'created_at'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('ACAG Profile', {
            'fields': ('role', 'phone', 'cnic_hash', 'division', 'district'),
        }),
    )


@admin.register(EngineerProfile)
class EngineerProfileAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'employee_code', 'user', 'assigned_division', 'joined_at',
    )
    list_filter = ('assigned_division', 'joined_at')
    search_fields = ('employee_code', 'user__username', 'assigned_division')
    readonly_fields = ('joined_at',)


@admin.register(JuniorEngineer)
class JuniorEngineerAdmin(admin.ModelAdmin):
    list_display = (
        'sr_no', 'name', 'cnic', 'email', 'phone', 'division',
        'assigned_district', 'is_active',
    )
    list_filter = ('division', 'assigned_district', 'is_active')
    search_fields = ('name', 'cnic', 'email', 'phone', 'division', 'assigned_district')
    ordering = ('sr_no',)
    readonly_fields = ('created_at',)
