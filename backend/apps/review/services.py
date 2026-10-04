from django.core.exceptions import ValidationError

from apps.common.enums import (
    AuditAction,
    ComplianceStatus,
    MilestoneStatus,
    NotificationPriority,
    NotificationType,
    QualityGrade,
    ReviewDecision,
)
from apps.common.models import Notification
from apps.common.utils import log_audit
from apps.projects.models import MilestoneDefinition, Photo, Project, ProjectMilestone
from apps.projects.services import ProjectService
from apps.review.models import AIResult, Review


class ReviewService:
    @classmethod
    def get_review_queue(cls, filters=None):
        """Retrieve completed milestones awaiting HITL review."""
        filters = filters or {}

        # Get all completed milestones
        qs = ProjectMilestone.objects.filter(status=MilestoneStatus.COMPLETED).select_related(
            'project', 'project__assigned_engineer'
        )

        # Exclude those that already have a review
        reviewed_pairs = set(Review.objects.values_list('project_id', 'milestone_no'))
        
        # Apply filters
        division = filters.get('division')
        district = filters.get('district')
        engineer_id = filters.get('engineer') or filters.get('engineer_id')

        if division:
            qs = qs.filter(project__division__iexact=division)
        if district:
            qs = qs.filter(project__district__iexact=district)
        if engineer_id:
            qs = qs.filter(project__assigned_engineer_id=engineer_id)

        # Order by completed_date / id (oldest submitted first)
        qs = qs.order_by('completed_date', 'id')

        queue = []
        for pm in qs:
            if (pm.project_id, pm.milestone_no) in reviewed_pairs:
                continue

            defn = MilestoneDefinition.objects.filter(milestone_no=pm.milestone_no).first()
            milestone_name = defn.name if defn else f'Milestone {pm.milestone_no}'

            # AI grade details from photos
            photos = Photo.objects.filter(project_id=pm.project_id, milestone_no=pm.milestone_no)
            ai_proposed_grade = None
            ai_confidence = None

            for photo in photos:
                ai = AIResult.objects.filter(photo=photo).order_by('-processed_at').first()
                if ai:
                    ai_proposed_grade = ai.proposed_grade
                    ai_confidence = ai.confidence_score
                    break

            engineer = pm.project.assigned_engineer
            engineer_name = (engineer.get_full_name() or engineer.username) if engineer else 'Unassigned'

            queue.append({
                'project_id': pm.project_id,
                'case_id': pm.project.case_id,
                'owner_name': pm.project.owner_name,
                'division': pm.project.division,
                'district': pm.project.district,
                'milestone_no': pm.milestone_no,
                'milestone_name': milestone_name,
                'engineer_name': engineer_name,
                'submitted_date': pm.completed_date,
                'ai_proposed_grade': ai_proposed_grade,
                'ai_confidence': ai_confidence,
            })

        return queue

    @classmethod
    def get_review_detail(cls, project_id, milestone_no):
        """Retrieve project, milestone, and photos with AI results for review inspection."""
        project = Project.objects.get(pk=project_id)
        pm = ProjectMilestone.objects.filter(project=project, milestone_no=milestone_no).first()
        defn = MilestoneDefinition.objects.filter(milestone_no=milestone_no).first()

        milestone_name = defn.name if defn else f'Milestone {milestone_no}'
        phase = defn.phase if defn else ProjectService.get_phase(milestone_no)
        weight = ProjectService.get_milestone_weights().get(milestone_no, 0)

        photos = Photo.objects.filter(project=project, milestone_no=milestone_no).order_by('-captured_at', '-created_at')
        photos_data = []

        for photo in photos:
            ai = AIResult.objects.filter(photo=photo).order_by('-processed_at').first()
            ai_data = None
            if ai:
                ai_data = {
                    'stage_match_confidence': ai.stage_match_confidence,
                    'blur_score': ai.blur_score,
                    'is_blurred': ai.is_blurred,
                    'duplicate_of_photo_id': ai.duplicate_of_photo_id,
                    'defects_json': ai.defects_json,
                    'proposed_grade': ai.proposed_grade,
                    'confidence_score': ai.confidence_score,
                    'model_version': ai.model_version,
                }

            photos_data.append({
                'id': photo.id,
                'image_ref': photo.image_ref,
                'captured_at': photo.captured_at,
                'ai_result': ai_data,
            })

        return {
            'project': {
                'id': project.id,
                'case_id': project.case_id,
                'owner_name': project.owner_name,
                'division': project.division,
                'district': project.district,
            },
            'milestone': {
                'no': milestone_no,
                'name': milestone_name,
                'phase': phase,
                'weight': weight,
                'status': pm.status if pm else MilestoneStatus.PENDING,
                'completed_date': pm.completed_date if pm else None,
            },
            'photos': photos_data,
        }

    @classmethod
    def check_review_eligibility(cls, project, milestone_no):
        """Check if milestone is completed and eligible for review."""
        pm = ProjectMilestone.objects.filter(project=project, milestone_no=milestone_no).first()
        if not pm or pm.status != MilestoneStatus.COMPLETED:
            return {'eligible': False, 'reason': 'Milestone is not marked as completed.'}

        if Review.objects.filter(project=project, milestone_no=milestone_no).exists():
            return {'eligible': False, 'reason': 'Milestone has already been reviewed.'}

        return {'eligible': True, 'reason': 'Milestone is eligible for review.'}

    @classmethod
    def submit_review(cls, project_id, milestone_no, reviewer, data, request=None):
        """Submit a HITL review decision."""
        project = Project.objects.get(pk=project_id)
        eligibility = cls.check_review_eligibility(project, milestone_no)
        if not eligibility['eligible']:
            raise ValidationError(eligibility['reason'])

        decision = data.get('decision')
        final_grade = data.get('final_grade')
        remarks = data.get('remarks', '')
        rectification_text = data.get('rectification_text', '')

        if decision == ReviewDecision.REJECTED and not rectification_text:
            raise ValidationError('Rectification text is required when rejecting a milestone.')

        review = Review.objects.create(
            project=project,
            milestone_no=milestone_no,
            reviewer=reviewer,
            decision=decision,
            final_grade=final_grade,
            remarks=remarks,
            rectification_text=rectification_text if decision == ReviewDecision.REJECTED else '',
        )

        # Update project quality_status and generate notification
        if decision in (ReviewDecision.ACCEPTED, ReviewDecision.OVERRIDDEN):
            project.quality_status = ComplianceStatus.COMPLETED
            project.save(update_fields=['quality_status', 'updated_at'])

            if project.assigned_engineer:
                Notification.objects.create(
                    user=project.assigned_engineer,
                    type=NotificationType.AI_VALIDATION_COMPLETE,
                    title='Milestone Approved',
                    body=f'Milestone {milestone_no} for project {project.case_id} has been approved.',
                    related_project=project,
                    priority=NotificationPriority.MEDIUM,
                )

        elif decision == ReviewDecision.REJECTED:
            project.quality_status = ComplianceStatus.PENDING
            project.save(update_fields=['quality_status', 'updated_at'])

            if project.assigned_engineer:
                Notification.objects.create(
                    user=project.assigned_engineer,
                    type=NotificationType.RECTIFICATION_ISSUED,
                    title='Rectification Required',
                    body=f'Milestone {milestone_no} for project {project.case_id} has been rejected. {rectification_text}',
                    related_project=project,
                    priority=NotificationPriority.HIGH,
                )

        log_audit(
            user=reviewer,
            action=AuditAction.CREATE,
            entity_type='review',
            entity_id=review.id,
            after={
                'project_id': project.id,
                'milestone_no': milestone_no,
                'decision': decision,
                'final_grade': final_grade,
            },
            request=request,
        )

        return review

    @classmethod
    def get_review_history(cls, project_id):
        """Get history of all reviews for a project."""
        reviews = Review.objects.filter(project_id=project_id).select_related('reviewer').order_by('-reviewed_at')
        history = []

        for r in reviews:
            reviewer_name = r.reviewer.get_full_name() or r.reviewer.username if r.reviewer else 'Unknown'
            history.append({
                'id': r.id,
                'project_id': r.project_id,
                'milestone_no': r.milestone_no,
                'reviewer_id': r.reviewer_id,
                'reviewer_name': reviewer_name,
                'decision': r.decision,
                'final_grade': r.final_grade,
                'remarks': r.remarks,
                'rectification_text': r.rectification_text,
                'reviewed_at': r.reviewed_at,
            })

        return history
