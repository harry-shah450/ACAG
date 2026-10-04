from django.shortcuts import get_object_or_404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.enums import AuditAction, ComplianceStatus
from apps.common.permissions import CanEditProject, CanViewProject, IsAdmin, IsFieldEngineer
from apps.common.responses import error_response, success_response
from apps.common.utils import log_audit
from apps.compliance.models import ESSCheck, HSECheck
from apps.compliance.serializers import (
    ESSCheckSerializer,
    HSECheckSerializer,
    SubmitESSChecklistSerializer,
    SubmitHSEChecklistSerializer,
)
from apps.compliance.services import ComplianceService
from apps.projects.models import Project, Visit
from apps.projects.serializers import ProjectListSerializer


class ProjectComplianceScoresView(APIView):
    permission_classes = [IsAuthenticated, CanViewProject]

    @swagger_auto_schema(
        operation_summary='Get project compliance scores',
        operation_description='Get HSE and ESS compliance scores and detailed breakdowns for the latest visit.',
        tags=['Compliance'],
    )
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        self.check_object_permissions(request, project)
        scores = ComplianceService.get_project_scores(project)
        return success_response(data=scores)


class ProjectHSEChecksView(APIView):
    permission_classes = [IsAuthenticated, CanViewProject]

    @swagger_auto_schema(
        operation_summary='Get HSE checks for a project',
        operation_description='Get HSE checks for a project, optionally filtered by visit_no or visit_id.',
        manual_parameters=[
            openapi.Parameter('visit_no', openapi.IN_QUERY, description='Visit number (1, 2, 3)', type=openapi.TYPE_STRING),
            openapi.Parameter('visit_id', openapi.IN_QUERY, description='Visit ID', type=openapi.TYPE_INTEGER),
        ],
        tags=['HSE'],
    )
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        self.check_object_permissions(request, project)

        checks = HSECheck.objects.filter(visit__project=project)
        visit_no = request.query_params.get('visit_no')
        visit_id = request.query_params.get('visit_id')

        if visit_id:
            checks = checks.filter(visit_id=visit_id)
        elif visit_no:
            checks = checks.filter(visit__visit_no=visit_no)

        serializer = HSECheckSerializer(checks, many=True)
        return success_response(data=serializer.data)

    @swagger_auto_schema(
        operation_summary='Submit HSE checklist for a visit',
        operation_description='Field engineer submits HSE checklist items for a visit.',
        request_body=SubmitHSEChecklistSerializer,
        tags=['HSE'],
    )
    def post(self, request, id):
        project = get_object_or_404(Project, pk=id)

        # Check edit permission
        if not (request.user.role in ('ADMIN', 'FIELD_ENGINEER')):
            return error_response(
                code='PERMISSION_DENIED',
                message='Only field engineers or admins can submit HSE checklists.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        serializer = SubmitHSEChecklistSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid HSE checklist payload.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        visit_id = serializer.validated_data['visit_id']
        visit = get_object_or_404(Visit, pk=visit_id, project=project)
        photo_path = serializer.validated_data.get('photo_path', '')
        items = serializer.validated_data['items']

        created_or_updated = []
        for item in items:
            check, _ = HSECheck.objects.update_or_create(
                visit=visit,
                item_key=item['item_key'],
                defaults={
                    'answer': item['answer'],
                    'remarks': item.get('remarks', ''),
                    'photo_path': photo_path,
                },
            )
            created_or_updated.append(check)

        log_audit(
            user=request.user,
            action=AuditAction.CREATE,
            entity_type='hse_checklist',
            entity_id=visit.id,
            after={'visit_id': visit.id, 'items_count': len(items)},
            request=request,
        )

        hse_score_res = ComplianceService.calculate_hse_score(visit.id)

        return success_response(
            data={
                'hse_checks': HSECheckSerializer(created_or_updated, many=True).data,
                'hse_score': hse_score_res,
            },
            message='HSE checklist submitted successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class ProjectESSChecksView(APIView):
    permission_classes = [IsAuthenticated, CanViewProject]

    @swagger_auto_schema(
        operation_summary='Get ESS checks for a project',
        operation_description='Get ESS checks for a project, optionally filtered by visit_no or visit_id.',
        manual_parameters=[
            openapi.Parameter('visit_no', openapi.IN_QUERY, description='Visit number', type=openapi.TYPE_STRING),
            openapi.Parameter('visit_id', openapi.IN_QUERY, description='Visit ID', type=openapi.TYPE_INTEGER),
        ],
        tags=['ESS'],
    )
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        self.check_object_permissions(request, project)

        checks = ESSCheck.objects.filter(visit__project=project)
        visit_no = request.query_params.get('visit_no')
        visit_id = request.query_params.get('visit_id')

        if visit_id:
            checks = checks.filter(visit_id=visit_id)
        elif visit_no:
            checks = checks.filter(visit__visit_no=visit_no)

        serializer = ESSCheckSerializer(checks, many=True)
        return success_response(data=serializer.data)

    @swagger_auto_schema(
        operation_summary='Submit ESS checklist for a visit',
        operation_description='Field engineer submits ESS checklist for a visit. Triggers site_risk_flag evaluation.',
        request_body=SubmitESSChecklistSerializer,
        tags=['ESS'],
    )
    def post(self, request, id):
        project = get_object_or_404(Project, pk=id)

        if not (request.user.role in ('ADMIN', 'FIELD_ENGINEER')):
            return error_response(
                code='PERMISSION_DENIED',
                message='Only field engineers or admins can submit ESS checklists.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        serializer = SubmitESSChecklistSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid ESS checklist payload.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        visit_id = serializer.validated_data['visit_id']
        visit = get_object_or_404(Visit, pk=visit_id, project=project)

        ess_check, _ = ESSCheck.objects.update_or_create(
            visit=visit,
            defaults={
                'trees_requiring_permission': serializer.validated_data['trees_requiring_permission'],
                'near_settlements': serializer.validated_data['near_settlements'],
                'near_drainage_nullah': serializer.validated_data['near_drainage_nullah'],
                'blocks_right_of_way': serializer.validated_data['blocks_right_of_way'],
                'remarks': serializer.validated_data.get('remarks', ''),
                'photo_path': serializer.validated_data.get('photo_path', ''),
            },
        )

        risk_res = ComplianceService.update_site_risk_flag(project)

        log_audit(
            user=request.user,
            action=AuditAction.CREATE,
            entity_type='ess_checklist',
            entity_id=ess_check.id,
            after={
                'visit_id': visit.id,
                'site_risk_flag': project.site_risk_flag,
            },
            request=request,
        )

        ess_score_res = ComplianceService.calculate_ess_score(visit.id)

        return success_response(
            data={
                'ess_check': ESSCheckSerializer(ess_check).data,
                'ess_score': ess_score_res,
                'site_risk_flag': project.site_risk_flag,
                'site_risk_reason': risk_res['reason'],
            },
            message='ESS checklist submitted successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class ProjectComplianceSummaryView(APIView):
    permission_classes = [IsAuthenticated, CanViewProject]

    @swagger_auto_schema(
        operation_summary='Get compliance summary',
        operation_description='Get overall compliance summary including plans, environment, quality statuses, site risk flag, and latest scores.',
        tags=['Compliance'],
    )
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        self.check_object_permissions(request, project)
        summary = ComplianceService.get_project_compliance_summary(project)
        return success_response(data=summary)


class ProjectComplianceTrendView(APIView):
    permission_classes = [IsAuthenticated, CanViewProject]

    @swagger_auto_schema(
        operation_summary='Get compliance trend across visits',
        operation_description='Get HSE and ESS score trends for all visits of a project.',
        tags=['Compliance'],
    )
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        self.check_object_permissions(request, project)
        trend = ComplianceService.get_compliance_trend(project)
        return success_response(data=trend)


class UpdateComplianceStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @swagger_auto_schema(
        operation_summary='Update compliance statuses (Admin only)',
        operation_description='Update plans_status, environment_status, or quality_status for a project.',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'plans_status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'COMPLETED']),
                'environment_status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'COMPLETED']),
                'quality_status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'COMPLETED']),
            },
        ),
        tags=['Compliance'],
    )
    def patch(self, request, id):
        project = get_object_or_404(Project, pk=id)
        before = {
            'plans_status': project.plans_status,
            'environment_status': project.environment_status,
            'quality_status': project.quality_status,
        }

        plans_status = request.data.get('plans_status')
        environment_status = request.data.get('environment_status')
        quality_status = request.data.get('quality_status')

        valid_statuses = [ComplianceStatus.PENDING, ComplianceStatus.COMPLETED, 'PENDING', 'COMPLETED']

        if plans_status:
            if plans_status not in valid_statuses:
                return error_response('INVALID_STATUS', 'Invalid plans_status value.')
            project.plans_status = plans_status
        if environment_status:
            if environment_status not in valid_statuses:
                return error_response('INVALID_STATUS', 'Invalid environment_status value.')
            project.environment_status = environment_status
        if quality_status:
            if quality_status not in valid_statuses:
                return error_response('INVALID_STATUS', 'Invalid quality_status value.')
            project.quality_status = quality_status

        project.save()

        log_audit(
            user=request.user,
            action=AuditAction.UPDATE,
            entity_type='project_compliance',
            entity_id=project.id,
            before=before,
            after={
                'plans_status': project.plans_status,
                'environment_status': project.environment_status,
                'quality_status': project.quality_status,
            },
            request=request,
        )

        return success_response(
            data={
                'plans_status': project.plans_status,
                'environment_status': project.environment_status,
                'quality_status': project.quality_status,
            },
            message='Compliance status updated successfully.',
        )


class SiteRiskRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='List projects with site risk flag',
        operation_description='Retrieve all projects flagged with site_risk_flag=True along with failed ESS items.',
        manual_parameters=[
            openapi.Parameter('division', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('district', openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        tags=['Compliance'],
    )
    def get(self, request):
        qs = Project.objects.filter(site_risk_flag=True)

        division = request.query_params.get('division')
        district = request.query_params.get('district')

        if division:
            qs = qs.filter(division__iexact=division)
        if district:
            qs = qs.filter(district__iexact=district)

        results = []
        for project in qs:
            latest_ess = ESSCheck.objects.filter(visit__project=project).order_by('-visit__created_at', '-visit__visit_date').first()
            failed_items = []
            if latest_ess:
                if latest_ess.trees_requiring_permission:
                    failed_items.append('trees_requiring_permission')
                if latest_ess.near_settlements:
                    failed_items.append('near_settlements')
                if latest_ess.near_drainage_nullah:
                    failed_items.append('near_drainage_nullah')
                if latest_ess.blocks_right_of_way:
                    failed_items.append('blocks_right_of_way')

            latest_visit = project.visits.order_by('-created_at', '-visit_date').first()

            results.append({
                'project': ProjectListSerializer(project).data,
                'failed_items': failed_items,
                'latest_visit_date': latest_visit.visit_date if latest_visit else None,
            })

        return success_response(data=results)
