from django.contrib import admin

from apps.review.models import AIResult, Review


@admin.register(AIResult)
class AIResultAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'photo',
        'proposed_grade',
        'confidence_score',
        'stage_match_confidence',
        'blur_score',
        'is_blurred',
        'model_version',
        'processed_at',
    )
    list_filter = ('proposed_grade', 'is_blurred', 'model_version', 'processed_at')
    search_fields = ('photo__image_ref', 'photo__project__case_id')
    readonly_fields = ('processed_at',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'project',
        'milestone_no',
        'reviewer',
        'decision',
        'final_grade',
        'reviewed_at',
    )
    list_filter = ('decision', 'final_grade', 'reviewer', 'reviewed_at')
    search_fields = ('project__case_id', 'reviewer__username', 'reviewer__email', 'remarks')
    readonly_fields = ('reviewed_at', 'created_at')
