from django.contrib import admin

from apps.handover.models import Handover


@admin.register(Handover)
class HandoverAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'project',
        'handover_status',
        'handover_date',
        'electricity_connected',
        'gas_connected',
        'drainage_connected',
        'water_supply_connected',
        'beneficiary_signed_by',
        'engineer_signed_by',
        'updated_at',
    )
    list_filter = ('handover_status', 'electricity_connected', 'gas_connected', 'handover_date')
    search_fields = ('project__case_id', 'project__owner_name', 'certificate_path')
    readonly_fields = ('created_at', 'updated_at', 'certificate_generated_at')
