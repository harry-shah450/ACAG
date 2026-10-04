from django.contrib import admin

from apps.projects.models import (
    EngineerRating,
    MaterialRate,
    MilestoneDefinition,
    Photo,
    Project,
    ProjectMilestone,
    SoilReference,
    Visit,
)


@admin.register(MilestoneDefinition)
class MilestoneDefinitionAdmin(admin.ModelAdmin):
    list_display = ('milestone_no', 'name', 'duration_days', 'phase')
    list_filter = ('phase',)
    search_fields = ('name', 'phase')
    ordering = ('milestone_no',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'case_id', 'owner_name', 'division', 'district', 'project_type',
        'assigned_engineer', 'overall_progress_pct', 'current_milestone_no',
        'site_risk_flag', 'created_at',
    )
    list_filter = (
        'project_type', 'division', 'district', 'plans_status',
        'environment_status', 'quality_status', 'site_risk_flag',
    )
    search_fields = ('case_id', 'owner_name', 'owner_phone', 'tehsil')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('assigned_engineer',)


@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = (
        'project', 'milestone_no', 'status', 'completed_date', 'completed_by',
    )
    list_filter = ('status', 'milestone_no')
    search_fields = ('project__case_id', 'remarks')
    raw_id_fields = ('project', 'completed_by')


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = (
        'project', 'engineer', 'visit_no', 'visit_date',
        'progress_pct_reported', 'created_at',
    )
    list_filter = ('visit_no', 'visit_date')
    search_fields = ('project__case_id', 'engineer__username', 'engineer_remarks')
    raw_id_fields = ('project', 'engineer')


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = (
        'project', 'visit', 'milestone_no', 'uploaded_by', 'captured_at', 'created_at',
    )
    list_filter = ('milestone_no', 'captured_at')
    search_fields = ('project__case_id', 'image_ref')
    raw_id_fields = ('project', 'visit', 'uploaded_by')


@admin.register(EngineerRating)
class EngineerRatingAdmin(admin.ModelAdmin):
    list_display = ('project', 'engineer', 'rated_by_user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('project__case_id', 'engineer__username', 'comment')
    raw_id_fields = ('project', 'engineer', 'rated_by_user')


@admin.register(MaterialRate)
class MaterialRateAdmin(admin.ModelAdmin):
    list_display = (
        'district', 'material', 'rate', 'unit', 'effective_from', 'updated_by', 'created_at',
    )
    list_filter = ('material', 'district', 'effective_from')
    search_fields = ('district', 'material')
    raw_id_fields = ('updated_by',)


@admin.register(SoilReference)
class SoilReferenceAdmin(admin.ModelAdmin):
    list_display = ('district', 'dominant_soil_type', 'susceptibility')
    list_filter = ('dominant_soil_type', 'susceptibility')
    search_fields = ('district', 'dominant_soil_type', 'note')
