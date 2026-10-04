from decimal import Decimal
from rest_framework import serializers

from apps.accounts.models import JuniorEngineer, User
from apps.common.enums import MilestoneStatus, UserRole
from apps.projects.models import (
    MilestoneDefinition,
    Photo,
    Project,
    ProjectMilestone,
    Visit,
)
from apps.projects.services import ProjectService


class MilestoneDefinitionSerializer(serializers.ModelSerializer):
    weight = serializers.SerializerMethodField()

    class Meta:
        model = MilestoneDefinition
        fields = ['milestone_no', 'name', 'weight', 'phase']
        read_only_fields = fields

    def get_weight(self, obj):
        weights = ProjectService.get_milestone_weights()
        return weights.get(obj.milestone_no, getattr(obj, 'duration_days', 0))


class MilestoneSerializer(serializers.ModelSerializer):
    completed_by_name = serializers.SerializerMethodField()
    phase = serializers.SerializerMethodField()
    weight = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMilestone
        fields = [
            'id',
            'milestone_no',
            'name',
            'status',
            'completed_date',
            'completed_by',
            'completed_by_name',
            'remarks',
            'phase',
            'weight',
        ]
        read_only_fields = fields

    def get_completed_by_name(self, obj):
        if obj.completed_by:
            return obj.completed_by.get_full_name() or obj.completed_by.username
        return None

    def get_phase(self, obj):
        defn = MilestoneDefinition.objects.filter(milestone_no=obj.milestone_no).first()
        if defn:
            return defn.phase
        return ProjectService.get_phase(obj.milestone_no)

    def get_weight(self, obj):
        return ProjectService.get_milestone_weights().get(obj.milestone_no, 0)

    def get_name(self, obj):
        defn = MilestoneDefinition.objects.filter(milestone_no=obj.milestone_no).first()
        return defn.name if defn else f'Milestone {obj.milestone_no}'


class VisitSerializer(serializers.ModelSerializer):
    engineer_name = serializers.SerializerMethodField()
    visit_no_display = serializers.CharField(source='get_visit_no_display', read_only=True)

    class Meta:
        model = Visit
        fields = [
            'id',
            'visit_no',
            'visit_no_display',
            'visit_date',
            'latitude',
            'longitude',
            'progress_pct_reported',
            'engineer_remarks',
            'created_at',
            'engineer',
            'engineer_name',
        ]
        read_only_fields = ['id', 'created_at', 'engineer_name', 'visit_no_display']

    def get_engineer_name(self, obj):
        if obj.engineer:
            return obj.engineer.get_full_name() or obj.engineer.username
        return None


class PhotoSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = [
            'id',
            'image_ref',
            'milestone_no',
            'latitude',
            'longitude',
            'gps_accuracy_m',
            'captured_at',
            'uploaded_by',
            'uploaded_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'uploaded_by_name']

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name() or obj.uploaded_by.username
        return None


class ProjectListSerializer(serializers.ModelSerializer):
    assigned_engineer_name = serializers.SerializerMethodField()
    compliance = serializers.SerializerMethodField()
    remaining_loan = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'case_id',
            'owner_name',
            'owner_phone',
            'owner_cnic',
            'owner_cnic_hash',
            'owner_email',
            'division',
            'district',
            'tehsil',
            'union_council',
            'address',
            'latitude',
            'longitude',
            'project_type',
            'plot_size_marla',
            'covered_area_sqft',
            'floors',
            'loan_approved',
            'loan_disbursed',
            'remaining_loan',
            'loan_status',
            'loan_application_date',
            'status',
            'current_stage',
            'overall_progress_pct',
            'start_date',
            'expected_completion_date',
            'stage_start_date',
            'last_inspection_date',
            'next_inspection_date',
            'safety_status',
            'open_safety_issues',
            'last_safety_inspection',
            'safety_remarks',
            'remarks',
            'revisit_reason',
            'assigned_engineer',
            'assigned_junior_engineer',
            'assigned_engineer_name',
            'plans_status',
            'environment_status',
            'quality_status',
            'compliance',
            'site_risk_flag',
            'current_milestone_no',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'remaining_loan', 'compliance']

    def get_assigned_engineer_name(self, obj):
        if obj.assigned_engineer_name:
            return obj.assigned_engineer_name
        if obj.assigned_junior_engineer:
            return obj.assigned_junior_engineer.name
        if obj.assigned_engineer:
            return obj.assigned_engineer.get_full_name() or obj.assigned_engineer.username
        return 'Unassigned'

    def get_remaining_loan(self, obj):
        return max(Decimal('0.00'), (obj.loan_approved or Decimal('0.00')) - (obj.loan_disbursed or Decimal('0.00')))

    def get_compliance(self, obj):
        return {
            'plans_status': obj.plans_status,
            'environment_status': obj.environment_status,
            'quality_status': obj.quality_status,
        }


class ProjectDetailSerializer(serializers.ModelSerializer):
    assigned_engineer_name = serializers.SerializerMethodField()
    compliance = serializers.SerializerMethodField()
    compliance_scores = serializers.SerializerMethodField()
    current_phase = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    remaining_loan = serializers.SerializerMethodField()
    milestones = MilestoneSerializer(many=True, read_only=True)
    visits = VisitSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'case_id',
            'owner_name',
            'owner_phone',
            'owner_cnic',
            'owner_cnic_hash',
            'owner_email',
            'division',
            'district',
            'tehsil',
            'union_council',
            'address',
            'latitude',
            'longitude',
            'project_type',
            'plot_size_marla',
            'covered_area_sqft',
            'floors',
            'loan_approved',
            'loan_disbursed',
            'remaining_loan',
            'loan_status',
            'loan_application_date',
            'status',
            'current_stage',
            'overall_progress_pct',
            'start_date',
            'expected_completion_date',
            'stage_start_date',
            'last_inspection_date',
            'next_inspection_date',
            'safety_status',
            'open_safety_issues',
            'last_safety_inspection',
            'safety_remarks',
            'remarks',
            'revisit_reason',
            'assigned_engineer',
            'assigned_junior_engineer',
            'assigned_engineer_name',
            'plans_status',
            'environment_status',
            'quality_status',
            'compliance',
            'compliance_scores',
            'site_risk_flag',
            'current_milestone_no',
            'current_phase',
            'completion_percentage',
            'milestones',
            'visits',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_assigned_engineer_name(self, obj):
        if obj.assigned_engineer_name:
            return obj.assigned_engineer_name
        if obj.assigned_junior_engineer:
            return obj.assigned_junior_engineer.name
        if obj.assigned_engineer:
            return obj.assigned_engineer.get_full_name() or obj.assigned_engineer.username
        return 'Unassigned'

    def get_remaining_loan(self, obj):
        return max(Decimal('0.00'), (obj.loan_approved or Decimal('0.00')) - (obj.loan_disbursed or Decimal('0.00')))

    def get_compliance(self, obj):
        return {
            'plans_status': obj.plans_status,
            'environment_status': obj.environment_status,
            'quality_status': obj.quality_status,
        }

    def get_compliance_scores(self, obj):
        from apps.compliance.services import ComplianceService
        return ComplianceService.get_project_scores(obj)

    def get_current_phase(self, obj):
        return ProjectService.get_phase(obj.current_milestone_no)

    def get_completion_percentage(self, obj):
        return obj.overall_progress_pct


class CreateProjectSerializer(serializers.ModelSerializer):
    case_id = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.FloatField(required=False, default=31.5204)
    longitude = serializers.FloatField(required=False, default=74.3587)
    overall_progress_pct = serializers.FloatField(required=False, default=0.0)
    floors = serializers.IntegerField(required=False, default=1, min_value=1, max_value=10)
    open_safety_issues = serializers.IntegerField(required=False, default=0, min_value=0, max_value=100)
    loan_approved = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False, required=False, default=Decimal('1500000.00'))
    loan_disbursed = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False, required=False, default=Decimal('0.00'))
    assigned_engineer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=UserRole.FIELD_ENGINEER),
        required=False,
        allow_null=True,
    )
    assigned_junior_engineer = serializers.PrimaryKeyRelatedField(
        queryset=JuniorEngineer.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Project
        fields = [
            'case_id',
            'owner_name',
            'owner_phone',
            'owner_cnic',
            'owner_cnic_hash',
            'owner_email',
            'division',
            'district',
            'tehsil',
            'union_council',
            'address',
            'latitude',
            'longitude',
            'project_type',
            'plot_size_marla',
            'covered_area_sqft',
            'floors',
            'loan_approved',
            'loan_disbursed',
            'loan_status',
            'loan_application_date',
            'status',
            'current_stage',
            'overall_progress_pct',
            'start_date',
            'expected_completion_date',
            'stage_start_date',
            'last_inspection_date',
            'next_inspection_date',
            'safety_status',
            'open_safety_issues',
            'last_safety_inspection',
            'safety_remarks',
            'remarks',
            'revisit_reason',
            'assigned_engineer',
            'assigned_junior_engineer',
            'assigned_engineer_name',
        ]

    def to_internal_value(self, data):
        # Sanitize Swagger default dummy values
        if isinstance(data, dict):
            data = data.copy()
            if data.get('assigned_engineer') in (0, '0', '', 'string'):
                data['assigned_engineer'] = None
            if data.get('assigned_junior_engineer') in (0, '0', '', 'string'):
                data['assigned_junior_engineer'] = None
            if data.get('loan_approved') in ('string', '', None):
                data['loan_approved'] = 1500000.00
            if data.get('loan_disbursed') in ('string', '', None):
                data['loan_disbursed'] = 0.00
            if data.get('floors') in (9223372036854775807, '9223372036854775807', 'string', '', None):
                data['floors'] = 1
            if data.get('open_safety_issues') in (9223372036854775807, '9223372036854775807', 'string', '', None):
                data['open_safety_issues'] = 0
            if data.get('latitude') == 'string':
                data['latitude'] = 31.5204
            if data.get('longitude') == 'string':
                data['longitude'] = 74.3587
            if data.get('plot_size_marla') == 'string':
                data['plot_size_marla'] = 5.0
            if data.get('covered_area_sqft') == 'string':
                data['covered_area_sqft'] = 1100.0
            if data.get('overall_progress_pct') == 'string':
                data['overall_progress_pct'] = 0.0
        return super().to_internal_value(data)

    def validate_latitude(self, value):
        if value is not None and (value < -90 or value > 90):
            raise serializers.ValidationError('Latitude must be between -90 and 90 degrees.')
        return value

    def validate_longitude(self, value):
        if value is not None and (value < -180 or value > 180):
            raise serializers.ValidationError('Longitude must be between -180 and 180 degrees.')
        return value

    def validate_overall_progress_pct(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError('Progress percentage must be between 0 and 100.')
        return value

    def validate_assigned_engineer(self, value):
        if value and value.role != UserRole.FIELD_ENGINEER:
            raise serializers.ValidationError('Assigned engineer must be a field engineer.')
        return value

    def create(self, validated_data):
        from apps.projects.models import generate_unique_house_id
        from django.utils import timezone

        if not validated_data.get('case_id'):
            validated_data['case_id'] = generate_unique_house_id()

        # Resolve engineer name if provided
        assigned_junior = validated_data.get('assigned_junior_engineer')
        assigned_user = validated_data.get('assigned_engineer')
        if assigned_junior and not validated_data.get('assigned_engineer_name'):
            validated_data['assigned_engineer_name'] = assigned_junior.name
        elif assigned_user and not validated_data.get('assigned_engineer_name'):
            validated_data['assigned_engineer_name'] = assigned_user.get_full_name() or assigned_user.username

        # Stage to milestone mapping
        stage_name = validated_data.get('current_stage', 'Site Preparation')
        progress_pct = validated_data.get('overall_progress_pct', 0.0)

        # Estimate completed milestones from progress percentage or stage
        completed_milestones_count = int((progress_pct / 100.0) * 15) if progress_pct > 0 else 0
        validated_data['current_milestone_no'] = completed_milestones_count

        project = Project.objects.create(**validated_data)

        # Create 15 milestones with appropriate status
        milestones = []
        for i in range(1, 16):
            is_done = i <= completed_milestones_count
            milestones.append(
                ProjectMilestone(
                    project=project,
                    milestone_no=i,
                    status=MilestoneStatus.COMPLETED if is_done else MilestoneStatus.PENDING,
                    completed_date=timezone.now() if is_done else None,
                    remarks=f'Completed upon project initialization' if is_done else '',
                )
            )
        ProjectMilestone.objects.bulk_create(milestones)
        return project


class UpdateProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'case_id',
            'owner_name',
            'owner_phone',
            'owner_cnic',
            'owner_cnic_hash',
            'owner_email',
            'division',
            'district',
            'tehsil',
            'union_council',
            'address',
            'latitude',
            'longitude',
            'project_type',
            'plot_size_marla',
            'covered_area_sqft',
            'floors',
            'loan_approved',
            'loan_disbursed',
            'loan_status',
            'loan_application_date',
            'status',
            'current_stage',
            'overall_progress_pct',
            'start_date',
            'expected_completion_date',
            'stage_start_date',
            'last_inspection_date',
            'next_inspection_date',
            'safety_status',
            'open_safety_issues',
            'last_safety_inspection',
            'safety_remarks',
            'remarks',
            'revisit_reason',
            'assigned_engineer',
            'assigned_junior_engineer',
            'assigned_engineer_name',
            'plans_status',
            'environment_status',
            'quality_status',
            'site_risk_flag',
        ]

    def validate_latitude(self, value):
        if value is not None and (value < -90 or value > 90):
            raise serializers.ValidationError('Latitude must be between -90 and 90 degrees.')
        return value

    def validate_longitude(self, value):
        if value is not None and (value < -180 or value > 180):
            raise serializers.ValidationError('Longitude must be between -180 and 180 degrees.')
        return value

    def validate_assigned_engineer(self, value):
        if value and value.role != UserRole.FIELD_ENGINEER:
            raise serializers.ValidationError('Assigned engineer must be a field engineer.')
        return value
