from django.contrib import admin

from apps.reports.models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'report_type',
        'scope',
        'scope_value',
        'generated_by',
        'file_path',
        'created_at',
    )
    list_filter = ('report_type', 'scope', 'created_at')
    search_fields = ('scope_value', 'file_path', 'generated_by__username')
    readonly_fields = ('created_at',)
