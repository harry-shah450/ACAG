from rest_framework import serializers

from apps.common.enums import ReportScope
from apps.reports.models import Report


class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True, default='System')

    class Meta:
        model = Report
        fields = [
            'id',
            'report_type',
            'scope',
            'scope_value',
            'period_from',
            'period_to',
            'generated_by',
            'generated_by_name',
            'file_path',
            'created_at',
        ]
        read_only_fields = fields


class DPRGenerateSerializer(serializers.Serializer):
    date = serializers.DateField(required=False)
    scope = serializers.ChoiceField(choices=ReportScope.choices, required=False, default=ReportScope.ALL)
    scope_value = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class DistrictExcelGenerateSerializer(serializers.Serializer):
    division = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    district = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_from = serializers.DateField(required=False, allow_null=True)
    date_to = serializers.DateField(required=False, allow_null=True)


class GenerateReportSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=Report.REPORT_TYPES)
    scope = serializers.ChoiceField(choices=ReportScope.choices, required=False, default=ReportScope.ALL)
    scope_value = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    period_from = serializers.DateField(required=False, allow_null=True)
    period_to = serializers.DateField(required=False, allow_null=True)
