from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.common.enums import AuditAction, UserRole
from apps.common.pagination import StandardResultsSetPagination
from apps.common.permissions import (
    CanCompleteMilestone,
    CanEditProject,
    CanViewProject,
    IsAdmin,
)
from apps.common.responses import error_response, success_response
from apps.common.utils import log_audit
from apps.projects.filters import ProjectFilter
from apps.projects.models import Photo, Project, ProjectMilestone, Visit
from apps.projects.serializers import (
    CreateProjectSerializer,
    MilestoneSerializer,
    PhotoSerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
    UpdateProjectSerializer,
    VisitSerializer,
)
from apps.projects.services import ProjectService


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for managing projects, milestones, visits, photos, and compliance status."""

    queryset = Project.objects.all().order_by('-created_at')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProjectFilter

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'milestones', 'visits', 'photos', 'download_template']:
            return [IsAuthenticated(), CanViewProject()]
        elif self.action in ['create', 'update', 'partial_update', 'create_visit', 'upload_photos', 'bulk_import']:
            return [IsAuthenticated(), CanEditProject()]
        elif self.action == 'destroy':
            return [IsAuthenticated(), IsAdmin()]
        elif self.action == 'complete_milestone':
            return [IsAuthenticated(), CanCompleteMilestone()]
        elif self.action == 'compliance':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action == 'create':
            return CreateProjectSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateProjectSerializer
        return ProjectDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Project.objects.none()

        qs = Project.objects.all().order_by('-created_at')

        if user.role in (UserRole.ADMIN, UserRole.BACKEND_REVIEW_ENGINEER):
            return qs
        elif user.role == UserRole.FIELD_ENGINEER:
            return qs.filter(assigned_engineer=user)
        elif user.role == UserRole.HOUSE_OWNER:
            filters = Q()
            if user.cnic_hash:
                filters |= Q(owner_cnic_hash=user.cnic_hash)
            if user.phone:
                filters |= Q(owner_phone=user.phone)
            if filters:
                return qs.filter(filters)
            return qs.none()

        return qs.none()

    @swagger_auto_schema(
        operation_summary='List all projects',
        operation_description='Retrieve a paginated list of projects filtered by user role and query parameters.',
        tags=['Projects'],
    )
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ProjectListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ProjectListSerializer(queryset, many=True)
        return success_response(data=serializer.data)

    @swagger_auto_schema(
        operation_summary='Retrieve project details',
        operation_description='Retrieve full 360° detail view for a specific project.',
        tags=['Projects'],
    )
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ProjectDetailSerializer(instance)
        return success_response(data=serializer.data)

    @swagger_auto_schema(
        operation_summary='Create project',
        operation_description='Create a new project (Field Engineers / Admin). Auto-creates 15 milestones.',
        request_body=CreateProjectSerializer,
        tags=['Projects'],
    )
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if request.user.role == UserRole.FIELD_ENGINEER and 'assigned_engineer' not in data:
            data['assigned_engineer'] = request.user.id

        serializer = CreateProjectSerializer(data=data, context={'request': request})
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Project creation failed.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        project = serializer.save()

        log_audit(
            user=request.user,
            action=AuditAction.CREATE,
            entity_type='project',
            entity_id=project.id,
            after=ProjectDetailSerializer(project).data,
            request=request,
        )

        return success_response(
            data=ProjectDetailSerializer(project).data,
            message='Project created successfully.',
            status_code=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        operation_summary='Update project',
        operation_description='Update project details (Admin or assigned Field Engineer).',
        request_body=UpdateProjectSerializer,
        tags=['Projects'],
    )
    def update(self, request, *args, **kwargs):
        return self._update_project(request, partial=False)

    @swagger_auto_schema(
        operation_summary='Partial update project',
        operation_description='Partially update project details (Admin or assigned Field Engineer).',
        request_body=UpdateProjectSerializer,
        tags=['Projects'],
    )
    def partial_update(self, request, *args, **kwargs):
        return self._update_project(request, partial=True)

    def _update_project(self, request, partial):
        project = self.get_object()
        before = ProjectDetailSerializer(project).data

        serializer = UpdateProjectSerializer(
            project, data=request.data, partial=partial, context={'request': request}
        )
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Project update failed.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        project = serializer.save()

        log_audit(
            user=request.user,
            action=AuditAction.UPDATE,
            entity_type='project',
            entity_id=project.id,
            before=before,
            after=ProjectDetailSerializer(project).data,
            request=request,
        )

        return success_response(
            data=ProjectDetailSerializer(project).data,
            message='Project updated successfully.',
        )

    @swagger_auto_schema(
        operation_summary='Delete project',
        operation_description='Delete a project (Admin only).',
        tags=['Projects'],
    )
    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        before = ProjectDetailSerializer(project).data
        project_id = project.id

        project.delete()

        log_audit(
            user=request.user,
            action=AuditAction.DELETE,
            entity_type='project',
            entity_id=project_id,
            before=before,
            request=request,
        )

        return success_response(message='Project deleted successfully.')

    @swagger_auto_schema(
        method='get',
        operation_summary='Get project milestones',
        operation_description='Get list of all 15 milestones for a project.',
        tags=['Milestones'],
    )
    @action(detail=True, methods=['get'])
    def milestones(self, request, pk=None):
        project = self.get_object()
        milestones = project.milestones.all().order_by('milestone_no')
        serializer = MilestoneSerializer(milestones, many=True)
        return success_response(data=serializer.data)

    @swagger_auto_schema(
        method='get',
        operation_summary='Get project visits',
        operation_description='Get list of all visits for a project.',
        tags=['Visits'],
    )
    @action(detail=True, methods=['get'])
    def visits(self, request, pk=None):
        project = self.get_object()
        visits = project.visits.all().order_by('created_at')
        serializer = VisitSerializer(visits, many=True)
        return success_response(data=serializer.data)

    @swagger_auto_schema(
        method='get',
        operation_summary='Get project photos',
        operation_description='Get photos for a project, optionally filtered by milestone_no.',
        manual_parameters=[
            openapi.Parameter('milestone_no', openapi.IN_QUERY, description='Filter by milestone number', type=openapi.TYPE_INTEGER)
        ],
        tags=['Photos'],
    )
    @action(detail=True, methods=['get'])
    def photos(self, request, pk=None):
        project = self.get_object()
        photos_qs = project.photos.all()
        milestone_no = request.query_params.get('milestone_no')
        if milestone_no:
            photos_qs = photos_qs.filter(milestone_no=milestone_no)

        serializer = PhotoSerializer(photos_qs, many=True)
        return success_response(data=serializer.data)

    @swagger_auto_schema(
        method='post',
        operation_summary='Complete milestone',
        operation_description='Complete a milestone. Requires at least 1 photo reference in request body.',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['photos'],
            properties={
                'remarks': openapi.Schema(type=openapi.TYPE_STRING, description='Remarks'),
                'photos': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING), description='List of image references'),
                'latitude': openapi.Schema(type=openapi.TYPE_NUMBER, description='Latitude'),
                'longitude': openapi.Schema(type=openapi.TYPE_NUMBER, description='Longitude'),
                'gps_accuracy_m': openapi.Schema(type=openapi.TYPE_NUMBER, description='GPS Accuracy in meters'),
            },
        ),
        tags=['Milestones'],
    )
    @action(detail=True, methods=['post'], url_path=r'milestones/(?P<no>\d+)/complete')
    def complete_milestone(self, request, pk=None, no=None):
        project = self.get_object()
        milestone_no = int(no)

        photos = request.data.get('photos', [])
        if not photos or not isinstance(photos, list) or len(photos) == 0:
            return error_response(
                code='PHOTO_REQUIRED',
                message='At least 1 photo is required for milestone completion.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        remarks = request.data.get('remarks', '')
        latitude = request.data.get('latitude', project.latitude)
        longitude = request.data.get('longitude', project.longitude)
        gps_accuracy_m = request.data.get('gps_accuracy_m', 5.0)

        try:
            milestone = ProjectService.complete_milestone(
                project=project,
                milestone_no=milestone_no,
                user=request.user,
                remarks=remarks,
            )
        except Exception as e:
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                code = e.detail.get('code', 'VALIDATION_ERROR')
                msg = e.detail.get('message', e.detail.get('detail', str(e)))
                return error_response(code=code, message=str(msg), status_code=status.HTTP_400_BAD_REQUEST)
            return error_response(code='MILESTONE_ERROR', message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

        # Save photos
        now = timezone.now()
        created_photos = []
        for img_ref in photos:
            photo = Photo.objects.create(
                project=project,
                milestone_no=milestone_no,
                image_ref=img_ref,
                latitude=latitude,
                longitude=longitude,
                gps_accuracy_m=gps_accuracy_m,
                captured_at=now,
                uploaded_by=request.user,
            )
            created_photos.append(photo)

        log_audit(
            user=request.user,
            action=AuditAction.UPDATE,
            entity_type='milestone',
            entity_id=milestone.id,
            after={
                'milestone_no': milestone_no,
                'status': milestone.status,
                'overall_progress_pct': project.overall_progress_pct,
            },
            request=request,
        )

        return success_response(
            data={
                'milestone': MilestoneSerializer(milestone).data,
                'overall_progress_pct': project.overall_progress_pct,
                'photos': PhotoSerializer(created_photos, many=True).data,
            },
            message=f'Milestone {milestone_no} completed successfully.',
        )

    @swagger_auto_schema(
        method='post',
        operation_summary='Create visit',
        operation_description='Create a new inspection visit record (sequential order enforced: 1 -> 2 -> 3).',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['visit_no', 'visit_date', 'latitude', 'longitude', 'progress_pct_reported'],
            properties={
                'visit_no': openapi.Schema(type=openapi.TYPE_STRING, description='Visit number (1, 2, or 3)'),
                'visit_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
                'latitude': openapi.Schema(type=openapi.TYPE_NUMBER),
                'longitude': openapi.Schema(type=openapi.TYPE_NUMBER),
                'progress_pct_reported': openapi.Schema(type=openapi.TYPE_NUMBER),
                'engineer_remarks': openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        tags=['Visits'],
    )
    @action(detail=True, methods=['post'], url_path='visits')
    def create_visit(self, request, pk=None):
        project = self.get_object()
        visit_no = request.data.get('visit_no')

        try:
            visit = ProjectService.create_visit(
                project=project,
                engineer=request.user,
                visit_no=visit_no,
                data=request.data,
            )
        except Exception as e:
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                code = e.detail.get('code', 'VALIDATION_ERROR')
                msg = e.detail.get('message', e.detail.get('detail', str(e)))
                return error_response(code=code, message=str(msg), status_code=status.HTTP_400_BAD_REQUEST)
            return error_response(code='VISIT_ERROR', message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

        log_audit(
            user=request.user,
            action=AuditAction.CREATE,
            entity_type='visit',
            entity_id=visit.id,
            after=VisitSerializer(visit).data,
            request=request,
        )

        return success_response(
            data=VisitSerializer(visit).data,
            message='Visit created successfully.',
            status_code=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        method='post',
        operation_summary='Upload photos',
        operation_description='Upload photo records for a project milestone.',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['milestone_no', 'photos'],
            properties={
                'milestone_no': openapi.Schema(type=openapi.TYPE_INTEGER),
                'photos': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                'latitude': openapi.Schema(type=openapi.TYPE_NUMBER),
                'longitude': openapi.Schema(type=openapi.TYPE_NUMBER),
                'gps_accuracy_m': openapi.Schema(type=openapi.TYPE_NUMBER),
            },
        ),
        tags=['Photos'],
    )
    @action(detail=True, methods=['post'], url_path='photos')
    def upload_photos(self, request, pk=None):
        project = self.get_object()
        milestone_no = request.data.get('milestone_no')
        photos = request.data.get('photos', [])
        latitude = request.data.get('latitude', project.latitude)
        longitude = request.data.get('longitude', project.longitude)
        gps_accuracy_m = request.data.get('gps_accuracy_m', 5.0)

        if not milestone_no or not photos:
            return error_response(
                code='VALIDATION_ERROR',
                message='milestone_no and photos are required.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        created_photos = []
        for img_ref in photos:
            photo = Photo.objects.create(
                project=project,
                milestone_no=milestone_no,
                image_ref=img_ref,
                latitude=latitude,
                longitude=longitude,
                gps_accuracy_m=gps_accuracy_m,
                captured_at=now,
                uploaded_by=request.user,
            )
            created_photos.append(photo)

        return success_response(
            data=PhotoSerializer(created_photos, many=True).data,
            message='Photos uploaded successfully.',
            status_code=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        method='patch',
        operation_summary='Update project compliance',
        operation_description='Update compliance statuses (plans_status, environment_status, quality_status). Admin only.',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'plans_status': openapi.Schema(type=openapi.TYPE_STRING),
                'environment_status': openapi.Schema(type=openapi.TYPE_STRING),
                'quality_status': openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        tags=['Projects'],
    )
    @action(detail=True, methods=['patch'], url_path='compliance')
    def compliance(self, request, pk=None):
        project = self.get_object()
        before_compliance = {
            'plans_status': project.plans_status,
            'environment_status': project.environment_status,
            'quality_status': project.quality_status,
        }

        plans_status = request.data.get('plans_status')
        environment_status = request.data.get('environment_status')
        quality_status = request.data.get('quality_status')

        updated = False
        if plans_status:
            project.plans_status = plans_status
            updated = True
        if environment_status:
            project.environment_status = environment_status
            updated = True
        if quality_status:
            project.quality_status = quality_status
            updated = True

        if updated:
            project.save()
            log_audit(
                user=request.user,
                action=AuditAction.UPDATE,
                entity_type='project_compliance',
                entity_id=project.id,
                before=before_compliance,
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

    @swagger_auto_schema(
        method='get',
        operation_summary='Download House Import Excel / CSV Template',
        operation_description='Download a pre-formatted template with standard headers and sample data for bulk house upload.',
        tags=['Projects'],
    )
    @action(detail=False, methods=['get'], url_path='download_template')
    def download_template(self, request):
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="ACAG_House_Import_Template.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Owner Name',
            'CNIC',
            'Contact Number',
            'Email',
            'Address',
            'District',
            'Tehsil',
            'Union Council',
            'Plot Size (Marla)',
            'Covered Area (sqft)',
            'Floors',
            'Latitude',
            'Longitude',
            'Assigned Engineer',
            'Current Stage',
            'Progress (%)',
            'Loan Approved',
            'Loan Disbursed',
            'Loan Status',
            'Safety Status',
            'House Status',
            'Remarks',
        ])
        writer.writerow([
            'Muhammad Tariq',
            '35202-7654321-3',
            '0300-1234567',
            'tariq.acag@example.com',
            'House 12, Street 4, Gulshan Ravi',
            'Lahore',
            'Lahore City',
            'UC-45',
            '5',
            '1100',
            '1',
            '31.5204',
            '74.3587',
            'Engr. Bilal Raza',
            'Foundation',
            '20',
            '1500000',
            '500000',
            'Approved',
            'Safe',
            'Under Construction',
            'Foundation excavation completed, lean concrete in progress.',
        ])
        writer.writerow([
            'Fatima Bibi',
            '38403-1234567-8',
            '0321-9876543',
            'fatima.bibi@example.com',
            'Chak 42-SB, Sargodha Road',
            'Sargodha',
            'Sargodha',
            'UC-12',
            '3',
            '750',
            '1',
            '32.0836',
            '72.6711',
            'Engr. Ayesha Malik',
            'Brick Masonry',
            '45',
            '1500000',
            '750000',
            'Partially Disbursed',
            'Safe',
            'Under Construction',
            'Brick masonry up to lintel level in progress.',
        ])
        return response

    @swagger_auto_schema(
        method='post',
        operation_summary='Bulk Import Houses from Excel / CSV or JSON',
        operation_description='Validate, detect duplicates, auto-generate sequential House IDs, create milestones, and import house records.',
        tags=['Projects'],
    )
    @action(detail=False, methods=['post'], url_path='bulk_import')
    def bulk_import(self, request):
        import csv
        import io
        import re
        from decimal import Decimal
        from django.db import transaction
        from apps.accounts.models import JuniorEngineer, User
        from apps.projects.models import generate_unique_house_id

        district_coords = {
            'Lahore': (31.5204, 74.3587),
            'Rawalpindi': (33.5651, 73.0169),
            'Faisalabad': (31.4504, 73.1350),
            'Multan': (30.1575, 71.5249),
            'Gujranwala': (32.1877, 74.1945),
            'Bahawalpur': (29.3544, 71.6911),
            'Sargodha': (32.0836, 72.6711),
            'Sialkot': (32.4945, 74.5229),
            'Sheikhupura': (31.7131, 73.9783),
            'Jhang': (31.2781, 72.3317),
            'Rahim Yar Khan': (28.4212, 70.2989),
            'Kasur': (31.1179, 74.4461),
            'Sahiwal': (30.6682, 73.1114),
            'Okara': (30.8080, 73.4458),
            'Dera Ghazi Khan': (30.0489, 70.6455),
            'Chiniot': (31.7200, 72.9789),
            'Muzaffargarh': (30.0744, 71.1847),
        }

        raw_rows = []

        # 1. Check if file is uploaded
        uploaded_file = request.FILES.get('file')
        if uploaded_file:
            file_name = uploaded_file.name.lower()
            if file_name.endswith('.csv'):
                try:
                    file_content = uploaded_file.read().decode('utf-8-sig', errors='replace')
                    reader = csv.DictReader(io.StringIO(file_content))
                    for row in reader:
                        raw_rows.append(row)
                except Exception as e:
                    return error_response(message=f'Failed to parse CSV file: {str(e)}', status_code=status.HTTP_400_BAD_REQUEST)
            elif file_name.endswith('.xlsx') or file_name.endswith('.xls'):
                try:
                    import openpyxl
                    wb = openpyxl.load_workbook(uploaded_file, data_only=True)
                    sheet = wb.active
                    headers = []
                    for cell in sheet[1]:
                        headers.append(str(cell.value or '').strip())
                    for row in sheet.iter_rows(min_row=2, values_only=True):
                        if not any(row):
                            continue
                        row_dict = {}
                        for i, val in enumerate(row):
                            if i < len(headers) and headers[i]:
                                row_dict[headers[i]] = val
                        raw_rows.append(row_dict)
                except Exception as e:
                    return error_response(message=f'Failed to parse Excel file: {str(e)}', status_code=status.HTTP_400_BAD_REQUEST)
            else:
                return error_response(message='Unsupported file format. Please upload a .csv or .xlsx file.', status_code=status.HTTP_400_BAD_REQUEST)
        else:
            # 2. Check JSON payload
            json_houses = request.data.get('houses')
            if json_houses is None and isinstance(request.data, list):
                json_houses = request.data
            if json_houses and isinstance(json_houses, list):
                raw_rows = json_houses
            else:
                return error_response(message='No file or houses data provided for import.', status_code=status.HTTP_400_BAD_REQUEST)

        if not raw_rows:
            return error_response(message='The uploaded file or dataset contains no house records.', status_code=status.HTTP_400_BAD_REQUEST)

        # Helper to normalize keys
        def normalize_key(k):
            return re.sub(r'[^a-z0-9]', '', str(k).lower())

        # Existing CNICs and Case IDs for duplicate checking
        existing_cnics = set(
            Project.objects.exclude(owner_cnic='').values_list('owner_cnic', flat=True)
        )
        existing_case_ids = set(
            Project.objects.values_list('case_id', flat=True)
        )

        seen_in_batch_cnic = set()
        seen_in_batch_id = set()

        created_projects = []
        failed_records = []
        duplicate_records = []

        total_rows = len(raw_rows)

        # Pre-cache engineers for fast matching
        all_juniors = list(JuniorEngineer.objects.all())
        all_field_users = list(User.objects.filter(role=UserRole.FIELD_ENGINEER))

        for idx, row in enumerate(raw_rows, start=1):
            normalized_row = {normalize_key(k): v for k, v in row.items() if k is not None}

            def get_val(*keys, default=''):
                for key in keys:
                    n_k = normalize_key(key)
                    if n_k in normalized_row and normalized_row[n_k] is not None:
                        val_str = str(normalized_row[n_k]).strip()
                        if val_str:
                            return val_str
                return default

            owner_name = get_val('owner_name', 'owner', 'name', 'beneficiary_name')
            cnic = get_val('cnic', 'owner_cnic', 'nic')
            phone = get_val('phone', 'contact_number', 'contact', 'mobile', 'owner_phone')
            email = get_val('email', 'owner_email')
            address = get_val('address', 'site_address', 'location_address')
            district = get_val('district', 'district_name', default='Lahore')
            tehsil = get_val('tehsil', 'tehsil_name', default=district)
            union_council = get_val('union_council', 'uc')
            provided_case_id = get_val('house_id', 'case_id', 'id')

            # Validation: Owner Name required
            if not owner_name:
                failed_records.append({
                    'row_index': idx,
                    'owner_name': owner_name or '(Missing)',
                    'cnic': cnic or '(Missing)',
                    'reason': 'Owner Name is required.',
                })
                continue

            # Standardize CNIC if present
            cleaned_cnic = re.sub(r'[^0-9]', '', cnic)
            if cleaned_cnic and len(cleaned_cnic) == 13:
                formatted_cnic = f'{cleaned_cnic[:5]}-{cleaned_cnic[5:12]}-{cleaned_cnic[12]}'
            elif cnic:
                formatted_cnic = cnic
            else:
                formatted_cnic = ''

            # Duplicate Check: CNIC or House ID
            is_duplicate = False
            duplicate_reason = ''
            existing_ref = ''

            if formatted_cnic and (formatted_cnic in existing_cnics or formatted_cnic in seen_in_batch_cnic):
                is_duplicate = True
                duplicate_reason = f'Duplicate CNIC: {formatted_cnic} is already registered in the system.'
                existing_match = Project.objects.filter(owner_cnic=formatted_cnic).first()
                existing_ref = existing_match.case_id if existing_match else 'Batch duplicate'
            elif provided_case_id and (provided_case_id in existing_case_ids or provided_case_id in seen_in_batch_id):
                is_duplicate = True
                duplicate_reason = f'Duplicate House ID: {provided_case_id} already exists.'
                existing_ref = provided_case_id

            if is_duplicate:
                duplicate_records.append({
                    'row_index': idx,
                    'owner_name': owner_name,
                    'cnic': formatted_cnic or '(None)',
                    'existing_house_id': existing_ref,
                    'reason': duplicate_reason,
                })
                continue

            # Parse physical specs
            try:
                plot_size = float(get_val('plot_size', 'plot_size_marla', 'plotsize', default='5'))
            except (ValueError, TypeError):
                plot_size = 5.0

            try:
                covered_area = float(get_val('covered_area', 'covered_area_sqft', 'coveredarea', default='1100'))
            except (ValueError, TypeError):
                covered_area = 1100.0

            try:
                floors = int(get_val('floors', 'number_of_floors', default='1'))
            except (ValueError, TypeError):
                floors = 1

            # Parse coordinates & validate
            def_lat, def_lng = district_coords.get(district, (31.5204, 74.3587))
            try:
                lat = float(get_val('latitude', 'lat', default=str(def_lat)))
                if not (-90 <= lat <= 90):
                    lat = def_lat
            except (ValueError, TypeError):
                lat = def_lat

            try:
                lng = float(get_val('longitude', 'lng', 'long', default=str(def_lng)))
                if not (-180 <= lng <= 180):
                    lng = def_lng
            except (ValueError, TypeError):
                lng = def_lng

            # Parse Progress
            try:
                progress_pct = float(get_val('progress', 'progress_pct', 'overall_progress_pct', default='0'))
                progress_pct = max(0.0, min(100.0, progress_pct))
            except (ValueError, TypeError):
                progress_pct = 0.0

            # Parse Status & Stage
            current_stage = get_val('stage', 'current_stage', default='Site Preparation')
            house_status = get_val('status', 'house_status', default='Pending')
            loan_status = get_val('loan_status', default='Pending')
            safety_status = get_val('safety_status', default='Safe')
            remarks = get_val('remarks', 'notes', default='')

            try:
                loan_approved = Decimal(str(get_val('loan_approved', 'approved_loan', default='1500000')))
            except Exception:
                loan_approved = Decimal('1500000.00')

            try:
                loan_disbursed = Decimal(str(get_val('loan_disbursed', 'disbursed_loan', default='0')))
            except Exception:
                loan_disbursed = Decimal('0.00')

            # Engineer Matching
            engineer_input = get_val('assigned_engineer', 'engineer', 'engineer_name')
            matched_user_engineer = None
            matched_junior_engineer = None
            final_engineer_name = engineer_input

            if engineer_input:
                eng_clean = engineer_input.lower().replace('engr.', '').replace('engr', '').strip()
                for je in all_juniors:
                    if eng_clean in je.name.lower():
                        matched_junior_engineer = je
                        final_engineer_name = je.name
                        break
                if not matched_junior_engineer:
                    for fe in all_field_users:
                        full_n = (fe.get_full_name() or fe.username).lower()
                        if eng_clean in full_n:
                            matched_user_engineer = fe
                            final_engineer_name = fe.get_full_name() or fe.username
                            break

            # Auto-generate or assign sequential House ID
            if provided_case_id and provided_case_id not in existing_case_ids:
                case_id = provided_case_id
            else:
                case_id = generate_unique_house_id()

            # Create House Project with transaction safety
            try:
                with transaction.atomic():
                    project = Project.objects.create(
                        case_id=case_id,
                        owner_name=owner_name,
                        owner_cnic=formatted_cnic,
                        owner_phone=phone,
                        owner_email=email,
                        division='Punjab',
                        district=district,
                        tehsil=tehsil,
                        union_council=union_council,
                        address=address,
                        latitude=lat,
                        longitude=lng,
                        project_type='UNDER_CONSTRUCTION' if progress_pct > 0 else 'PENDING',
                        plot_size_marla=plot_size,
                        covered_area_sqft=covered_area,
                        floors=floors,
                        loan_approved=loan_approved,
                        loan_disbursed=loan_disbursed,
                        loan_status=loan_status,
                        status=house_status,
                        current_stage=current_stage,
                        overall_progress_pct=progress_pct,
                        safety_status=safety_status,
                        remarks=remarks,
                        assigned_engineer=matched_user_engineer,
                        assigned_junior_engineer=matched_junior_engineer,
                        assigned_engineer_name=final_engineer_name or 'Unassigned',
                        created_by=request.user if request.user.is_authenticated else None,
                    )

                    # Create standard 15 milestones
                    milestone_names = [
                        (1, 'Site Preparation', 'Site clearance, leveling and initial ground preparation'),
                        (2, 'Layout Marking', 'Demarcation and layout marking according to approved plan'),
                        (3, 'Foundation', 'Excavation, lean concrete, foundation masonry, and backfilling'),
                        (4, 'DPC (Damp Proof Course)', 'DPC concrete casting and bitumen coating membrane'),
                        (5, 'Brick Masonry', 'Ground floor brick masonry up to lintel beam level'),
                        (6, 'Lintel & Beams', 'Reinforced lintel casting and beam reinforcement'),
                        (7, 'Roof Slab', 'Formwork, steel reinforcement binding and concrete pouring'),
                        (8, 'Plastering', 'Internal and external cement-sand plaster finish'),
                        (9, 'Flooring', 'Base concrete, tile/marble/mosaic laying and grouting'),
                        (10, 'Plumbing & Drainage', 'Water supply piping, drainage, sanitary fixtures installation'),
                        (11, 'Electrical Installation', 'Conduit wiring, switchboards, distribution board setup'),
                        (12, 'Doors & Windows (Finishing)', 'Wood/aluminum frames, shutters, glass and hardware fitment'),
                        (13, 'Septic Tank & Sanitation', 'Septic tank construction, connection and wastewater testing'),
                        (14, 'Final Inspection & Snagging', 'Structural audit, safety checks and compliance certification'),
                        (15, 'House Construction Completed', 'Handover ready, all finishes and utility connections verified'),
                    ]

                    completed_count = int(round((progress_pct / 100.0) * 15))
                    for m_no, title, desc in milestone_names:
                        is_completed = m_no <= completed_count
                        ProjectMilestone.objects.create(
                            project=project,
                            milestone_no=m_no,
                            title=title,
                            description=desc,
                            is_completed=is_completed,
                            completed_at=timezone.now() if is_completed else None,
                        )

                    project.current_milestone_no = min(15, max(1, completed_count + 1))
                    project.save(update_fields=['current_milestone_no'])

                    # Mark seen
                    if formatted_cnic:
                        existing_cnics.add(formatted_cnic)
                        seen_in_batch_cnic.add(formatted_cnic)
                    existing_case_ids.add(case_id)
                    seen_in_batch_id.add(case_id)

                    created_projects.append(project)

            except Exception as e:
                failed_records.append({
                    'row_index': idx,
                    'owner_name': owner_name,
                    'cnic': formatted_cnic,
                    'reason': f'Database error: {str(e)}',
                })

        # Audit log
        if created_projects:
            log_audit(
                user=request.user,
                action=AuditAction.CREATE,
                entity_type='bulk_house_import',
                entity_id=created_projects[0].id,
                after={'imported_count': len(created_projects), 'total_rows': total_rows},
                request=request,
            )

        serialized_houses = ProjectListSerializer(created_projects, many=True).data

        summary = {
            'total_rows': total_rows,
            'successful_count': len(created_projects),
            'failed_count': len(failed_records),
            'duplicate_count': len(duplicate_records),
            'imported_houses': serialized_houses,
            'failed_records': failed_records,
            'duplicate_records': duplicate_records,
        }

        return success_response(
            data=summary,
            message=f'Bulk import completed: {len(created_projects)} imported, {len(duplicate_records)} duplicate(s), {len(failed_records)} failed.',
            status_code=status.HTTP_201_CREATED if created_projects else status.HTTP_200_OK,
        )

