from rest_framework import serializers

from apps.common.enums import QualityGrade, ReviewDecision
from apps.projects.models import Photo
from apps.review.models import AIResult, Review


class AIResultSerializer(serializers.ModelSerializer):
    photo_id = serializers.IntegerField(source='photo.id', read_only=True)
    duplicate_of_photo_id = serializers.IntegerField(source='duplicate_of_photo.id', read_only=True, allow_null=True)

    class Meta:
        model = AIResult
        fields = [
            'id',
            'photo_id',
            'stage_match_confidence',
            'blur_score',
            'is_blurred',
            'duplicate_of_photo_id',
            'defects_json',
            'proposed_grade',
            'confidence_score',
            'model_version',
            'processed_at',
        ]
        read_only_fields = fields


class ReviewQueueSerializer(serializers.Serializer):
    project_id = serializers.IntegerField()
    case_id = serializers.CharField()
    owner_name = serializers.CharField()
    division = serializers.CharField()
    district = serializers.CharField()
    milestone_no = serializers.IntegerField()
    milestone_name = serializers.CharField()
    engineer_name = serializers.CharField()
    submitted_date = serializers.DateTimeField()
    ai_proposed_grade = serializers.CharField(allow_null=True)
    ai_confidence = serializers.FloatField(allow_null=True)


class ReviewDetailSerializer(serializers.Serializer):
    project = serializers.DictField()
    milestone = serializers.DictField()
    photos = serializers.ListField()


class ReviewSubmitSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=ReviewDecision.choices)
    final_grade = serializers.ChoiceField(choices=QualityGrade.choices)
    remarks = serializers.CharField(required=False, allow_blank=True, default='')
    rectification_text = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        decision = attrs.get('decision')
        rectification_text = attrs.get('rectification_text', '').strip()

        if decision == ReviewDecision.REJECTED and not rectification_text:
            raise serializers.ValidationError({
                'rectification_text': 'Rectification text is required when rejecting a milestone.'
            })
        return attrs


class ReviewHistorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    project_id = serializers.IntegerField()
    milestone_no = serializers.IntegerField()
    reviewer_id = serializers.IntegerField()
    reviewer_name = serializers.CharField()
    decision = serializers.CharField()
    final_grade = serializers.CharField()
    remarks = serializers.CharField(allow_blank=True)
    rectification_text = serializers.CharField(allow_blank=True)
    reviewed_at = serializers.DateTimeField()


class AIAnalyzePhotoSerializer(serializers.Serializer):
    photo_id = serializers.IntegerField()
    stage_match_confidence = serializers.FloatField(required=False, default=95.0)
    blur_score = serializers.FloatField(required=False, default=15.0)
    is_blurred = serializers.BooleanField(required=False, default=False)
    duplicate_of_photo_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    defects_json = serializers.JSONField(required=False, default=dict)
    proposed_grade = serializers.ChoiceField(choices=QualityGrade.choices, required=False, default=QualityGrade.GOOD)
    confidence_score = serializers.FloatField(required=False, default=90.0)
    model_version = serializers.CharField(required=False, default='v1.0-yolo')

    def validate_photo_id(self, value):
        if not Photo.objects.filter(id=value).exists():
            raise serializers.ValidationError('Photo not found.')
        return value


class AIBatchAnalyzeSerializer(serializers.Serializer):
    photos = AIAnalyzePhotoSerializer(many=True)
