from django.conf import settings
from django.db import models

from apps.common.enums import QualityGrade, ReviewDecision, UserRole


class AIResult(models.Model):
    photo = models.ForeignKey(
        'projects.Photo',
        on_delete=models.CASCADE,
        related_name='ai_results',
    )
    stage_match_confidence = models.FloatField(default=0.0)
    blur_score = models.FloatField(default=0.0)
    is_blurred = models.BooleanField(default=False)
    duplicate_of_photo = models.ForeignKey(
        'projects.Photo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='duplicates',
    )
    defects_json = models.JSONField(default=dict, blank=True)
    proposed_grade = models.CharField(
        max_length=30,
        choices=QualityGrade.choices,
        default=QualityGrade.GOOD,
    )
    confidence_score = models.FloatField(default=0.0)
    model_version = models.CharField(max_length=50, default='v1.0')
    processed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-processed_at']

    def __str__(self):
        return f'AI Result for Photo {self.photo_id} - {self.proposed_grade}'


class Review(models.Model):
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    milestone_no = models.IntegerField()
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given',
        limit_choices_to={'role__in': [UserRole.BACKEND_REVIEW_ENGINEER, UserRole.ADMIN]},
    )
    decision = models.CharField(
        max_length=20,
        choices=ReviewDecision.choices,
    )
    final_grade = models.CharField(
        max_length=30,
        choices=QualityGrade.choices,
    )
    remarks = models.TextField(blank=True)
    rectification_text = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'milestone_no')
        ordering = ['-reviewed_at']

    def __str__(self):
        return f'Review ({self.decision}) - Project {self.project.case_id} Milestone {self.milestone_no}'
