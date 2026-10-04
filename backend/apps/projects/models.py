import hashlib
import re
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.common.enums import (
    ComplianceStatus,
    MaterialType,
    MilestoneStatus,
    MILESTONE_NO_CHOICES,
    ProjectType,
    VisitNo,
)


def generate_unique_house_id():
    """Generate sequential unique ACAG House ID formatted as ACAG-000001, ACAG-000002, etc."""
    existing_case_ids = Project.objects.filter(case_id__regex=r'^ACAG-\d+').values_list('case_id', flat=True)
    max_id = 0
    for cid in existing_case_ids:
        match = re.search(r'ACAG-(\d+)', str(cid))
        if match:
            try:
                num = int(match.group(1))
                if num > max_id:
                    max_id = num
            except ValueError:
                pass

    if max_id == 0:
        # Fallback to total project count if no ACAG- ID exists yet
        count = Project.objects.count()
        next_id = count + 1
    else:
        next_id = max_id + 1

    candidate = f'ACAG-{next_id:06d}'
    while Project.objects.filter(case_id=candidate).exists():
        next_id += 1
        candidate = f'ACAG-{next_id:06d}'
    return candidate


class MilestoneDefinition(models.Model):
    """Reference definitions for the 15 construction milestones."""

    milestone_no = models.PositiveSmallIntegerField(unique=True)
    name = models.CharField(max_length=255)
    duration_days = models.PositiveSmallIntegerField()
    phase = models.CharField(max_length=50)

    class Meta:
        ordering = ['milestone_no']

    def __str__(self):
        return f'{self.milestone_no}. {self.name}'


class Project(models.Model):
    # Unique System Generated House ID (e.g. ACAG-000001)
    case_id = models.CharField(max_length=50, unique=True, blank=True)

    # Beneficiary / Owner Information
    owner_name = models.CharField(max_length=255)
    owner_phone = models.CharField(max_length=30, blank=True, default='')
    owner_cnic = models.CharField(max_length=30, blank=True, default='')
    owner_cnic_hash = models.CharField(max_length=128, blank=True, default='')
    owner_email = models.CharField(max_length=255, blank=True, default='')
    division = models.CharField(max_length=100, blank=True, default='Lahore')
    district = models.CharField(max_length=100, blank=True, default='Lahore')
    tehsil = models.CharField(max_length=100, blank=True, default='')
    union_council = models.CharField(max_length=100, blank=True, default='')
    address = models.TextField(blank=True, default='')

    # Location / GIS Coordinates
    latitude = models.FloatField(default=31.5204)
    longitude = models.FloatField(default=74.3587)

    # Physical Specifications
    project_type = models.CharField(max_length=30, choices=ProjectType.choices, default=ProjectType.UNDER_CONSTRUCTION)
    plot_size_marla = models.FloatField(default=5.0)
    covered_area_sqft = models.FloatField(default=1100.0)
    floors = models.PositiveSmallIntegerField(default=1)

    # Loan / Financial Information
    loan_approved = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('1500000.00'))
    loan_disbursed = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    loan_status = models.CharField(max_length=100, blank=True, default='Pending')
    loan_application_date = models.DateField(null=True, blank=True)

    # Assigned Engineer (Can link to Auth User or JuniorEngineer)
    assigned_engineer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_projects',
        limit_choices_to=Q(role='FIELD_ENGINEER'),
    )
    assigned_junior_engineer = models.ForeignKey(
        'accounts.JuniorEngineer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_projects',
    )
    assigned_engineer_name = models.CharField(max_length=255, blank=True, default='')

    # Overall Status & Stage Tracking
    status = models.CharField(max_length=50, blank=True, default='Pending')
    current_stage = models.CharField(max_length=100, blank=True, default='Site Preparation')
    start_date = models.DateField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    stage_start_date = models.DateField(null=True, blank=True)
    last_inspection_date = models.DateField(null=True, blank=True)
    next_inspection_date = models.DateField(null=True, blank=True)

    # Safety Information
    safety_status = models.CharField(max_length=50, blank=True, default='Safe')
    open_safety_issues = models.PositiveIntegerField(default=0)
    last_safety_inspection = models.DateField(null=True, blank=True)
    safety_remarks = models.TextField(blank=True, default='')

    # Remarks & Notes
    remarks = models.TextField(blank=True, default='')
    revisit_reason = models.TextField(blank=True, default='')

    # Compliance & Quality Fields
    plans_status = models.CharField(
        max_length=20,
        choices=ComplianceStatus.choices,
        default=ComplianceStatus.PENDING,
    )
    environment_status = models.CharField(
        max_length=20,
        choices=ComplianceStatus.choices,
        default=ComplianceStatus.PENDING,
    )
    quality_status = models.CharField(
        max_length=20,
        choices=ComplianceStatus.choices,
        default=ComplianceStatus.PENDING,
    )
    site_risk_flag = models.BooleanField(default=False)
    overall_progress_pct = models.FloatField(default=0.0)
    current_milestone_no = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.case_id} - {self.owner_name}'

    def save(self, *args, **kwargs):
        if not self.case_id:
            self.case_id = generate_unique_house_id()
        if self.owner_cnic and not self.owner_cnic_hash:
            self.owner_cnic_hash = hashlib.sha256(self.owner_cnic.strip().encode()).hexdigest()
        if not self.assigned_engineer_name:
            if self.assigned_junior_engineer:
                self.assigned_engineer_name = self.assigned_junior_engineer.name
            elif self.assigned_engineer:
                self.assigned_engineer_name = self.assigned_engineer.get_full_name() or self.assigned_engineer.username
        super().save(*args, **kwargs)


class ProjectMilestone(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='milestones',
    )
    milestone_no = models.IntegerField(choices=MILESTONE_NO_CHOICES)
    status = models.CharField(
        max_length=20,
        choices=MilestoneStatus.choices,
        default=MilestoneStatus.PENDING,
    )
    completed_date = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='completed_milestones',
    )
    remarks = models.TextField(blank=True)

    class Meta:
        unique_together = ('project', 'milestone_no')
        ordering = ['project', 'milestone_no']

    def __str__(self):
        return f'{self.project.case_id} - Milestone {self.milestone_no}'


class Visit(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='visits',
    )
    engineer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='visits',
    )
    visit_no = models.CharField(max_length=10, choices=VisitNo.choices)
    visit_date = models.DateTimeField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    progress_pct_reported = models.FloatField()
    engineer_remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'visit_no')
        ordering = ['-visit_date']

    def __str__(self):
        return f'{self.project.case_id} - {self.get_visit_no_display()}'


class Photo(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='photos',
    )
    visit = models.ForeignKey(
        Visit,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='photos',
    )
    milestone_no = models.IntegerField()
    image_ref = models.CharField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()
    gps_accuracy_m = models.FloatField()
    captured_at = models.DateTimeField()
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_photos',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-captured_at']

    def __str__(self):
        return f'Photo for {self.project.case_id} (M{self.milestone_no})'


class EngineerRating(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='engineer_ratings',
    )
    engineer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_received',
    )
    rated_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given',
    )
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Rating {self.rating} for {self.engineer.username}'


class MaterialRate(models.Model):
    district = models.CharField(max_length=100)
    material = models.CharField(max_length=20, choices=MaterialType.choices)
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=50)
    effective_from = models.DateField()
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='material_rate_updates',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_from', 'district', 'material']

    def __str__(self):
        return f'{self.material} - {self.district} ({self.rate} {self.unit})'


class SoilReference(models.Model):
    district = models.CharField(max_length=100, unique=True)
    dominant_soil_type = models.CharField(max_length=100)
    susceptibility = models.CharField(max_length=100)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ['district']

    def __str__(self):
        return f'{self.district} - {self.dominant_soil_type}'
