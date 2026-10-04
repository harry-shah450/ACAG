import os
from datetime import datetime
from django.http import FileResponse, Http404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import error_response, success_response
from apps.reports.serializers import (
    DistrictExcelGenerateSerializer,
    DPRGenerateSerializer,
    GenerateReportSerializer,
    ReportSerializer,
)
from apps.reports.services import ReportService


class DPRView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Generate Daily Progress Report (DPR) PDF',
        operation_description='Generate and download Daily Progress Report PDF.',
        manual_parameters=[
            openapi.Parameter('date', openapi.IN_QUERY, type=openapi.TYPE_STRING, description='YYYY-MM-DD'),
            openapi.Parameter('scope', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('scope_value', openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        tags=['Reports'],
    )
    def get(self, request):
        date_str = request.query_params.get('date')
        if date_str:
            try:
                date_val = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                date_val = datetime.now().date()
        else:
            date_val = datetime.now().date()

        scope = request.query_params.get('scope', 'ALL')
        scope_value = request.query_params.get('scope_value')

        file_path = ReportService.generate_dpr(
            date_val=date_val,
            scope=scope,
            scope_value=scope_value,
            user=request.user,
        )

        abs_path = file_path.lstrip('/')
        if not os.path.exists(abs_path):
            raise Http404('Report file could not be found.')

        return FileResponse(
            open(abs_path, 'rb'),
            content_type='application/pdf',
            filename=f'DPR_{date_val.strftime("%Y%m%d")}.pdf',
        )


class DistrictExcelView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Export District Progress Excel (XLSX)',
        operation_description='Generate and download District Progress Excel spreadsheet with exact required columns.',
        manual_parameters=[
            openapi.Parameter('division', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('district', openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        tags=['Reports'],
    )
    def get(self, request):
        division = request.query_params.get('division')
        district = request.query_params.get('district')

        file_path = ReportService.generate_district_excel(
            division=division,
            district=district,
            user=request.user,
        )

        abs_path = file_path.lstrip('/')
        if not os.path.exists(abs_path):
            raise Http404('Excel report file not found.')

        return FileResponse(
            open(abs_path, 'rb'),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=f'District_Progress_{district or division or "All"}.xlsx',
        )


class ReportListView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='List Report History',
        operation_description='Retrieve list of previously generated reports.',
        manual_parameters=[
            openapi.Parameter('report_type', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('scope', openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        tags=['Reports'],
    )
    def get(self, request):
        filters = {
            'report_type': request.query_params.get('report_type'),
            'scope': request.query_params.get('scope'),
        }
        history = ReportService.get_report_history(filters)
        return success_response(data=history)


class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Generate Report Endpoint',
        operation_description='Generate report (DPR, DISTRICT_EXCEL, HANDOVER_SUMMARY).',
        request_body=GenerateReportSerializer,
        tags=['Reports'],
    )
    def post(self, request):
        serializer = GenerateReportSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid report generation request.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        r_type = data['type']
        scope = data.get('scope', 'ALL')
        scope_value = data.get('scope_value')

        if r_type == 'DPR':
            date_val = data.get('period_from') or datetime.now().date()
            file_path = ReportService.generate_dpr(date_val=date_val, scope=scope, scope_value=scope_value, user=request.user)
        elif r_type == 'DISTRICT_EXCEL':
            file_path = ReportService.generate_district_excel(division=scope_value, district=scope_value, user=request.user)
        else:
            file_path = ReportService.generate_handover_report(division=scope_value, district=scope_value, user=request.user)

        return success_response(
            data={'file_path': file_path, 'report_type': r_type, 'scope': scope},
            message=f'Report {r_type} generated successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class HandoverReportView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Generate Handover Summary Report PDF',
        tags=['Reports'],
    )
    def get(self, request):
        division = request.query_params.get('division')
        district = request.query_params.get('district')

        file_path = ReportService.generate_handover_report(
            division=division,
            district=district,
            user=request.user,
        )

        abs_path = file_path.lstrip('/')
        if not os.path.exists(abs_path):
            raise Http404('Handover report file not found.')

        return FileResponse(
            open(abs_path, 'rb'),
            content_type='application/pdf',
            filename='Handover_Summary_Report.pdf',
        )
