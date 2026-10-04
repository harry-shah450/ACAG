from rest_framework import serializers

from apps.common.enums import HandoverStatus
from apps.handover.models import Handover


class HandoverSerializer(serializers.ModelSerializer):
    beneficiary_signed_by_name = serializers.CharField(source='beneficiary_signed_by.get_full_name', read_only=True, default='')
    engineer_signed_by_name = serializers.CharField(source='engineer_signed_by.get_full_name', read_only=True, default='')

    class Meta:
        model = Handover
        fields = [
            'id',
            'project',
            'handover_status',
            'handover_date',
            'occupant_count',
            'occupant_details',
            'electricity_connected',
            'gas_connected',
            'drainage_connected',
            'water_supply_connected',
            'beneficiary_signed_at',
            'beneficiary_signed_by',
            'beneficiary_signed_by_name',
            'engineer_signed_at',
            'engineer_signed_by',
            'engineer_signed_by_name',
            'certificate_path',
            'certificate_generated_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'project',
            'certificate_path',
            'certificate_generated_at',
            'beneficiary_signed_at',
            'beneficiary_signed_by',
            'engineer_signed_at',
            'engineer_signed_by',
            'created_at',
            'updated_at',
        ]


class HandoverSummarySerializer(serializers.Serializer):
    total_handovers_completed = serializers.IntegerField()
    pending_handover_count = serializers.IntegerField()
    under_construction_count = serializers.IntegerField()
    by_division = serializers.DictField()


class HandoverRecordSerializer(serializers.Serializer):
    case_id = serializers.CharField()
    owner_name = serializers.CharField()
    owner_cnic_hash = serializers.CharField()
    location = serializers.CharField()
    division = serializers.CharField()
    stage = serializers.CharField()
    handover_date = serializers.DateTimeField(allow_null=True)
    handover_status = serializers.CharField()


class HandoverSignSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['beneficiary', 'engineer'])


class HandoverUpdateSerializer(serializers.Serializer):
    handover_status = serializers.ChoiceField(choices=HandoverStatus.choices, required=False)
    occupant_count = serializers.IntegerField(required=False, allow_null=True)
    occupant_details = serializers.JSONField(required=False)
    electricity_connected = serializers.BooleanField(required=False)
    gas_connected = serializers.BooleanField(required=False)
    drainage_connected = serializers.BooleanField(required=False)
    water_supply_connected = serializers.BooleanField(required=False)
