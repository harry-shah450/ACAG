from rest_framework import serializers

from apps.common.enums import HSECheckAnswer, HSECheckItem
from apps.compliance.models import ESSCheck, HSECheck
from apps.projects.models import Visit


class HSECheckSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    is_compliant = serializers.SerializerMethodField()

    class Meta:
        model = HSECheck
        fields = [
            'id',
            'visit',
            'item_key',
            'display_name',
            'answer',
            'is_compliant',
            'remarks',
            'photo_path',
        ]
        read_only_fields = ['id', 'display_name', 'is_compliant']

    def get_display_name(self, obj):
        return obj.get_item_key_display()

    def get_is_compliant(self, obj):
        return (obj.answer or '').lower() in ('yes', 'y')


class ESSCheckSerializer(serializers.ModelSerializer):
    items_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = ESSCheck
        fields = [
            'id',
            'visit',
            'trees_requiring_permission',
            'near_settlements',
            'near_drainage_nullah',
            'blocks_right_of_way',
            'remarks',
            'photo_path',
            'items_breakdown',
        ]
        read_only_fields = ['id', 'items_breakdown']

    def get_items_breakdown(self, obj):
        return [
            {
                'field': 'trees_requiring_permission',
                'display_name': 'Trees requiring permission',
                'value': obj.trees_requiring_permission,
                'is_compliant': not obj.trees_requiring_permission,
            },
            {
                'field': 'near_settlements',
                'display_name': 'Proximity to settlements',
                'value': obj.near_settlements,
                'is_compliant': not obj.near_settlements,
            },
            {
                'field': 'near_drainage_nullah',
                'display_name': 'Proximity to drainage/nullah',
                'value': obj.near_drainage_nullah,
                'is_compliant': not obj.near_drainage_nullah,
            },
            {
                'field': 'blocks_right_of_way',
                'display_name': 'Blocks right of way',
                'value': obj.blocks_right_of_way,
                'is_compliant': not obj.blocks_right_of_way,
            },
        ]


class ComplianceScoreSerializer(serializers.Serializer):
    hse_score = serializers.FloatField(allow_null=True)
    ess_score = serializers.FloatField(allow_null=True)
    visit_no = serializers.CharField(allow_null=True)
    visit_display = serializers.CharField(allow_null=True)
    visit_date = serializers.DateTimeField(allow_null=True)
    hse_breakdown = serializers.DictField(source='hse', allow_null=True)
    ess_breakdown = serializers.DictField(source='ess', allow_null=True)


class ComplianceTrendSerializer(serializers.Serializer):
    visit_no = serializers.CharField()
    visit_display = serializers.CharField(required=False)
    visit_date = serializers.DateTimeField()
    hse_score = serializers.FloatField(allow_null=True)
    ess_score = serializers.FloatField(allow_null=True)


class SubmitHSEItemSerializer(serializers.Serializer):
    item_key = serializers.ChoiceField(choices=HSECheckItem.choices)
    answer = serializers.CharField()
    remarks = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_answer(self, value):
        val = (value or '').upper()
        if val not in (HSECheckAnswer.YES, HSECheckAnswer.NO, HSECheckAnswer.NA, 'YES', 'NO', 'NA'):
            raise serializers.ValidationError('Answer must be YES, NO, or NA.')
        return val


class SubmitHSEChecklistSerializer(serializers.Serializer):
    visit_id = serializers.IntegerField()
    items = SubmitHSEItemSerializer(many=True)
    photo_path = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_visit_id(self, value):
        if not Visit.objects.filter(id=value).exists():
            raise serializers.ValidationError('Visit not found.')
        return value


class SubmitESSChecklistSerializer(serializers.Serializer):
    visit_id = serializers.IntegerField()
    trees_requiring_permission = serializers.BooleanField()
    near_settlements = serializers.BooleanField()
    near_drainage_nullah = serializers.BooleanField()
    blocks_right_of_way = serializers.BooleanField()
    remarks = serializers.CharField(required=False, allow_blank=True, default='')
    photo_path = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_visit_id(self, value):
        if not Visit.objects.filter(id=value).exists():
            raise serializers.ValidationError('Visit not found.')
        return value
