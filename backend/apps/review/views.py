from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.enums import UserRole
from apps.common.responses import error_response, success_response
from apps.projects.models import Photo, Project
from apps.review.models import AIResult
from apps.review.serializers import (
    AIAnalyzePhotoSerializer,
    AIBatchAnalyzeSerializer,
    AIResultSerializer,
    ReviewDetailSerializer,
    ReviewHistorySerializer,
    ReviewQueueSerializer,
    ReviewSubmitSerializer,
)
from apps.review.services import ReviewService


class IsReviewerOrAdmin(IsAuthenticated):
    """Permission allowing access only to BACKEND_REVIEW_ENGINEER or ADMIN roles."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in (UserRole.BACKEND_REVIEW_ENGINEER, UserRole.ADMIN) or request.user.is_superuser


class ReviewQueueView(APIView):
    permission_classes = [IsReviewerOrAdmin]

    @swagger_auto_schema(
        operation_summary='Get HITL review queue',
        operation_description='Retrieve completed milestone submissions awaiting review (oldest first).',
        manual_parameters=[
            openapi.Parameter('division', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('district', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('engineer', openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter('page', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=1),
            openapi.Parameter('page_size', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=20),
        ],
        tags=['Review Queue'],
    )
    def get(self, request):
        filters = {
            'division': request.query_params.get('division'),
            'district': request.query_params.get('district'),
            'engineer': request.query_params.get('engineer'),
        }

        queue = ReviewService.get_review_queue(filters=filters)

        page_num = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        paginator = Paginator(queue, page_size)
        page_obj = paginator.get_page(page_num)

        serializer = ReviewQueueSerializer(page_obj.object_list, many=True)
        return success_response(
            data={
                'count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': page_num,
                'results': serializer.data,
            }
        )


class ReviewDetailView(APIView):
    permission_classes = [IsReviewerOrAdmin]

    @swagger_auto_schema(
        operation_summary='Get review details for a milestone',
        operation_description='Retrieve project info, milestone metadata, and photos with AI inspection results.',
        tags=['Review Queue'],
    )
    def get(self, request, projectId, milestoneNo):
        get_object_or_404(Project, pk=projectId)
        detail = ReviewService.get_review_detail(projectId, milestoneNo)
        return success_response(data=detail)

    @swagger_auto_schema(
        operation_summary='Submit review decision',
        operation_description='Submit accepted, overridden, or rejected decision for a milestone.',
        request_body=ReviewSubmitSerializer,
        tags=['Review Queue'],
    )
    def post(self, request, projectId, milestoneNo):
        serializer = ReviewSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid review submission payload.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = ReviewService.submit_review(
                project_id=projectId,
                milestone_no=milestoneNo,
                reviewer=request.user,
                data=serializer.validated_data,
                request=request,
            )
        except ValidationError as e:
            return error_response(
                code='REVIEW_SUBMISSION_ERROR',
                message=str(e.message if hasattr(e, 'message') else e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data={
                'id': review.id,
                'project_id': review.project_id,
                'milestone_no': review.milestone_no,
                'decision': review.decision,
                'final_grade': review.final_grade,
                'remarks': review.remarks,
                'rectification_text': review.rectification_text,
                'reviewed_at': review.reviewed_at,
            },
            message=f'Review submitted successfully with decision: {review.decision}',
            status_code=status.HTTP_201_CREATED,
        )


class SubmitReviewView(APIView):
    permission_classes = [IsReviewerOrAdmin]

    @swagger_auto_schema(
        operation_summary='Submit review decision',
        operation_description='Submit accepted, overridden, or rejected decision for a milestone.',
        request_body=ReviewSubmitSerializer,
        tags=['Review Queue'],
    )
    def post(self, request, projectId, milestoneNo):
        serializer = ReviewSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid review submission payload.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = ReviewService.submit_review(
                project_id=projectId,
                milestone_no=milestoneNo,
                reviewer=request.user,
                data=serializer.validated_data,
                request=request,
            )
        except ValidationError as e:
            return error_response(
                code='REVIEW_SUBMISSION_ERROR',
                message=str(e.message if hasattr(e, 'message') else e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data={
                'id': review.id,
                'project_id': review.project_id,
                'milestone_no': review.milestone_no,
                'decision': review.decision,
                'final_grade': review.final_grade,
                'remarks': review.remarks,
                'rectification_text': review.rectification_text,
                'reviewed_at': review.reviewed_at,
            },
            message=f'Review submitted successfully with decision: {review.decision}',
            status_code=status.HTTP_201_CREATED,
        )


class ReviewHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Get review history for a project',
        operation_description='List all reviews submitted for a given project.',
        tags=['Review Queue'],
    )
    def get(self, request, id):
        get_object_or_404(Project, pk=id)
        history = ReviewService.get_review_history(id)
        serializer = ReviewHistorySerializer(history, many=True)
        return success_response(data=serializer.data)


class ReviewEligibilityView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Check review eligibility',
        operation_description='Check if a milestone is ready and eligible for HITL review.',
        tags=['Review Queue'],
    )
    def get(self, request, projectId, milestoneNo):
        project = get_object_or_404(Project, pk=projectId)
        res = ReviewService.check_review_eligibility(project, milestoneNo)
        return success_response(data=res)


class AIAnalyzePhotoView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Submit single photo AI analysis (Internal)',
        operation_description='Endpoint for AI vision pipeline to report inspection results for a photo.',
        request_body=AIAnalyzePhotoSerializer,
        tags=['AI Vision'],
    )
    def post(self, request):
        serializer = AIAnalyzePhotoSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid AI analysis payload.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        photo = get_object_or_404(Photo, pk=data['photo_id'])

        duplicate_of = None
        if data.get('duplicate_of_photo_id'):
            duplicate_of = Photo.objects.filter(id=data['duplicate_of_photo_id']).first()

        ai_result = AIResult.objects.create(
            photo=photo,
            stage_match_confidence=data.get('stage_match_confidence', 95.0),
            blur_score=data.get('blur_score', 15.0),
            is_blurred=data.get('is_blurred', False),
            duplicate_of_photo=duplicate_of,
            defects_json=data.get('defects_json', {}),
            proposed_grade=data.get('proposed_grade'),
            confidence_score=data.get('confidence_score', 90.0),
            model_version=data.get('model_version', 'v1.0'),
        )

        return success_response(
            data=AIResultSerializer(ai_result).data,
            message='AI result stored successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class AIBatchAnalyzeView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Submit batch photo AI analysis (Internal)',
        operation_description='Endpoint for AI vision pipeline to report inspection results for multiple photos.',
        request_body=AIBatchAnalyzeSerializer,
        tags=['AI Vision'],
    )
    def post(self, request):
        serializer = AIBatchAnalyzeSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code='VALIDATION_ERROR',
                message='Invalid batch AI payload.',
                details=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        results = []
        for item in serializer.validated_data['photos']:
            photo = Photo.objects.filter(pk=item['photo_id']).first()
            if not photo:
                continue

            duplicate_of = None
            if item.get('duplicate_of_photo_id'):
                duplicate_of = Photo.objects.filter(id=item['duplicate_of_photo_id']).first()

            ai_res = AIResult.objects.create(
                photo=photo,
                stage_match_confidence=item.get('stage_match_confidence', 95.0),
                blur_score=item.get('blur_score', 15.0),
                is_blurred=item.get('is_blurred', False),
                duplicate_of_photo=duplicate_of,
                defects_json=item.get('defects_json', {}),
                proposed_grade=item.get('proposed_grade'),
                confidence_score=item.get('confidence_score', 90.0),
                model_version=item.get('model_version', 'v1.0'),
            )
            results.append(ai_res)

        return success_response(
            data=AIResultSerializer(results, many=True).data,
            message=f'Batch AI results stored for {len(results)} photos.',
            status_code=status.HTTP_201_CREATED,
        )
