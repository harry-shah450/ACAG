from django.contrib import admin

from apps.compliance.models import ESSCheck, HSECheck


@admin.register(HSECheck)
class HSECheckAdmin(admin.ModelAdmin):
    list_display = ('visit', 'item_key', 'answer', 'photo_path')
    list_filter = ('item_key', 'answer')
    search_fields = ('visit__project__case_id', 'remarks')
    raw_id_fields = ('visit',)


@admin.register(ESSCheck)
class ESSCheckAdmin(admin.ModelAdmin):
    list_display = (
        'visit', 'trees_requiring_permission', 'near_settlements',
        'near_drainage_nullah', 'blocks_right_of_way',
    )
    list_filter = (
        'trees_requiring_permission', 'near_settlements',
        'near_drainage_nullah', 'blocks_right_of_way',
    )
    search_fields = ('visit__project__case_id', 'remarks')
    raw_id_fields = ('visit',)
