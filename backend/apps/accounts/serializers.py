from rest_framework import serializers

from apps.accounts.models import EngineerProfile, JuniorEngineer, User
from apps.common.enums import AuditAction, UserRole
from apps.common.utils import log_audit


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'phone', 'role',
            'division', 'district', 'is_active', 'created_at',
        )
        read_only_fields = ('id', 'created_at')


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        user = authenticate(
            username=attrs['username'],
            password=attrs['password'],
        )
        if user is None:
            raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')
        attrs['user'] = user
        return attrs


class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'phone', 'password',
            'role', 'division', 'district',
        )

    def validate_role(self, value):
        valid_roles = {choice[0] for choice in UserRole.choices}
        if value not in valid_roles:
            raise serializers.ValidationError(
                f'Invalid role. Must be one of: {", ".join(sorted(valid_roles))}'
            )
        return value

    def validate(self, attrs):
        required_fields = ['username', 'password', 'role']
        for field in required_fields:
            if not attrs.get(field):
                raise serializers.ValidationError({field: 'This field is required.'})
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == UserRole.FIELD_ENGINEER:
            EngineerProfile.objects.create(
                user=user,
                employee_code=f'EMG-{user.id:04d}',
                assigned_division=user.division or '',
                assigned_districts=[user.district] if user.district else [],
            )

        log_audit(
            user=request.user if request and request.user.is_authenticated else None,
            action=AuditAction.CREATE,
            entity_type='user',
            entity_id=user.id,
            after=UserSerializer(user).data,
            request=request,
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'phone', 'division', 'district', 'is_active', 'role')

    def validate_role(self, value):
        valid_roles = {choice[0] for choice in UserRole.choices}
        if value not in valid_roles:
            raise serializers.ValidationError(
                f'Invalid role. Must be one of: {", ".join(sorted(valid_roles))}'
            )
        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        before = UserSerializer(instance).data
        user = super().update(instance, validated_data)
        log_audit(
            user=request.user if request and request.user.is_authenticated else None,
            action=AuditAction.UPDATE,
            entity_type='user',
            entity_id=user.id,
            before=before,
            after=UserSerializer(user).data,
            request=request,
        )
        return user


class EngineerProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    average_beneficiary_rating = serializers.SerializerMethodField()
    projects_assigned = serializers.SerializerMethodField()

    class Meta:
        model = EngineerProfile
        fields = (
            'user_id', 'employee_code', 'assigned_division',
            'assigned_districts', 'joined_at',
            'average_beneficiary_rating', 'projects_assigned',
        )
        read_only_fields = (
            'user_id', 'employee_code', 'assigned_division',
            'assigned_districts', 'joined_at',
            'average_beneficiary_rating', 'projects_assigned',
        )

    def get_average_beneficiary_rating(self, obj):
        return obj.average_beneficiary_rating

    def get_projects_assigned(self, obj):
        return obj.projects_assigned


class JuniorEngineerSerializer(serializers.ModelSerializer):
    class Meta:
        model = JuniorEngineer
        fields = (
            'id', 'sr_no', 'name', 'cnic', 'email', 'phone',
            'degree_16', 'degree_18', 'division', 'assigned_district',
            'is_active', 'created_at',
        )
        read_only_fields = ('id', 'created_at')
