import os
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import error_response, success_response
from apps.handover.models import Handover
from apps.handover.serializers import (
    HandoverRecordSerializer,
    HandoverSerializer,
    HandoverSignSerializer,
    HandoverSummarySerializer,
    HandoverUpdateSerializer,
)
from apps.handover.services import HandoverService
from apps.projects.models import Project


class HandoverSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Get Handover Summary KPIs',
        operation_description='Retrieve aggregate handover KPIs including completed, pending, and under-construction counts.',
        tags=['Handover'],
    )
    def get(self, request):
        summary = HandoverService.get_handover_summary()
        serializer = HandoverSummarySerializer(summary)
        return success_response(data=serializer.data)


class HandoverRecordsView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Get Handover Records Table',
        operation_description='List handover records with division, district, and status filters.',
        manual_parameters=[
            openapi.Parameter('division', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('district', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('handover_status', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('page', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=1),
            openapi.Parameter('page_size', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=20),
        ],
        tags=['Handover'],
    )
    def get(self, request):
        filters = {
            'division': request.query_params.get('division'),
            'district': request.query_params.get('district'),
            'handover_status': request.query_params.get('handover_status'),
        }

        records = HandoverService.get_handover_records(filters)

        page_num = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        paginator = Paginator(records, page_size)
        page_obj = paginator.get_page(page_num)

        serializer = HandoverRecordSerializer(page_obj.object_list, many=True)
        return success_response(
            data={
                'count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': page_num,
                'results': serializer.data,
            }
        )


class ProjectHandoverView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Get Project Handover Details',
        tags=['Handover'],
    )
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        handover, _ = Handover.objects.get_or_create(project=project)
        serializer = HandoverSerializer(handover)
        return success_response(data=serializer.data)

    @swagger_auto_schema(
        operation_summary='Update Project Handover Details',
        request_body=HandoverUpdateSerializer,
        tags=['Handover'],
    )
    def patch(self, request, id):
        project = get_object_or_404(Project, pk=id)
        serializer = HandoverUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid handover payload.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        status_val = data.get('handover_status')

        try:
            handover = HandoverService.update_handover_status(
                project=project,
                status_val=status_val,
                data=data,
                request=request,
            )
        except ValidationError as e:
            return error_response(
                code='HANDOVER_UPDATE_ERROR',
                message=str(e.message_dict if hasattr(e, 'message_dict') else e.message if hasattr(e, 'message') else e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data=HandoverSerializer(handover).data,
            message='Handover record updated successfully.',
        )


class SignHandoverView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Sign Handover Record',
        operation_description='Sign-off on project handover as beneficiary or field engineer.',
        request_body=HandoverSignSerializer,
        tags=['Handover'],
    )
    def post(self, request, id):
        project = get_object_or_404(Project, pk=id)
        serializer = HandoverSignSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid sign payload.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        role = serializer.validated_data['role']
        try:
            handover = HandoverService.sign_handover(
                project=project,
                user=request.user,
                role=role,
                request=request,
            )
        except ValidationError as e:
            return error_response(
                code='SIGN_HANDOVER_ERROR',
                message=str(e.message if hasattr(e, 'message') else e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data=HandoverSerializer(handover).data,
            message=f'Handover successfully signed by {role}.',
        )


class HandoverEligibilityView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Check Handover Eligibility',
        operation_description='Check if a project meets all conditions for handover completion.',
        tags=['Handover'],
    )
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        res = HandoverService.check_handover_eligibility(project)
        return success_response(data=res)


class CertificateView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Get Project Completion Certificate',
        operation_description='Retrieve or generate project completion PDF certificate file.',
        tags=['Handover Certificate'],
    )
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        handover, _ = Handover.objects.get_or_create(project=project)

        if not handover.certificate_path or not os.path.exists(handover.certificate_path.lstrip('/')):
            HandoverService.generate_completion_certificate(project, handover)

        abs_path = handover.certificate_path.lstrip('/')
        if not os.path.exists(abs_path):
            raise Http404('Certificate file not found.')

        return FileResponse(
            open(abs_path, 'rb'),
            content_type='application/pdf',
            filename=f'Certificate_{project.case_id}.pdf',
        )
