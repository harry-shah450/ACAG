import django_filters
from django.db.models import Q
from apps.projects.models import Project


class ProjectFilter(django_filters.FilterSet):
    division = django_filters.CharFilter(field_name='division', lookup_expr='iexact')
    district = django_filters.CharFilter(field_name='district', lookup_expr='iexact')
    tehsil = django_filters.CharFilter(field_name='tehsil', lookup_expr='icontains')
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')
    current_stage = django_filters.CharFilter(field_name='current_stage', lookup_expr='icontains')
    stage = django_filters.CharFilter(field_name='current_stage', lookup_expr='icontains')
    loan_status = django_filters.CharFilter(field_name='loan_status', lookup_expr='icontains')
    safety_status = django_filters.CharFilter(field_name='safety_status', lookup_expr='iexact')
    project_type = django_filters.CharFilter(field_name='project_type', lookup_expr='exact')
    assigned_engineer = django_filters.NumberFilter(field_name='assigned_engineer__id', lookup_expr='exact')
    assigned_engineer_id = django_filters.NumberFilter(field_name='assigned_engineer__id', lookup_expr='exact')
    assigned_junior_engineer = django_filters.NumberFilter(field_name='assigned_junior_engineer__id', lookup_expr='exact')
    assigned_engineer_username = django_filters.CharFilter(
        field_name='assigned_engineer__username', lookup_expr='icontains'
    )
    assigned_engineer_name = django_filters.CharFilter(
        field_name='assigned_engineer_name', lookup_expr='icontains'
    )
    site_risk_flag = django_filters.BooleanFilter(field_name='site_risk_flag')
    plans_status = django_filters.CharFilter(field_name='plans_status', lookup_expr='exact')
    environment_status = django_filters.CharFilter(field_name='environment_status', lookup_expr='exact')
    quality_status = django_filters.CharFilter(field_name='quality_status', lookup_expr='exact')

    overall_progress_pct_gte = django_filters.NumberFilter(
        field_name='overall_progress_pct', lookup_expr='gte'
    )
    overall_progress_pct_lte = django_filters.NumberFilter(
        field_name='overall_progress_pct', lookup_expr='lte'
    )

    date_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')

    case_id = django_filters.CharFilter(field_name='case_id', lookup_expr='icontains')
    owner_name = django_filters.CharFilter(field_name='owner_name', lookup_expr='icontains')
    owner_cnic = django_filters.CharFilter(field_name='owner_cnic', lookup_expr='icontains')
    search = django_filters.CharFilter(method='filter_search')

    phase = django_filters.CharFilter(method='filter_by_phase')

    class Meta:
        model = Project
        fields = [
            'division',
            'district',
            'tehsil',
            'status',
            'current_stage',
            'stage',
            'loan_status',
            'safety_status',
            'project_type',
            'assigned_engineer',
            'assigned_junior_engineer',
            'site_risk_flag',
            'plans_status',
            'environment_status',
            'quality_status',
            'case_id',
            'owner_name',
            'owner_cnic',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        val = value.strip()
        return queryset.filter(
            Q(case_id__icontains=val)
            | Q(owner_name__icontains=val)
            | Q(owner_cnic__icontains=val)
            | Q(owner_phone__icontains=val)
            | Q(district__icontains=val)
            | Q(tehsil__icontains=val)
            | Q(assigned_engineer_name__icontains=val)
        )

    def filter_by_phase(self, queryset, name, value):
        if not value:
            return queryset

        val = value.strip().lower()
        if val == 'foundation':
            return queryset.filter(current_milestone_no__in=[0, 1, 2, 3, 4])
        elif val == 'plinth':
            return queryset.filter(current_milestone_no__in=[5, 6])
        elif val == 'roof':
            return queryset.filter(current_milestone_no__in=[7, 8, 9])
        elif val == 'finishing':
            return queryset.filter(current_milestone_no__in=[10, 11, 12, 13, 14, 15])

        return queryset
