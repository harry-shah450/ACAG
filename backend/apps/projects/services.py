from django.utils import timezone
from rest_framework import serializers

from apps.common.enums import MilestoneStatus, VisitNo
from apps.projects.models import ProjectMilestone, Visit

MILESTONE_WEIGHTS = {
    1: 2,
    2: 3,
    3: 8,
    4: 3,
    5: 4,
    6: 4,
    7: 15,
    8: 5,
    9: 15,
    10: 10,
    11: 8,
    12: 8,
    13: 7,
    14: 6,
    15: 2,
}

VISIT_NO_INT_MAP = {
    VisitNo.ONE: 1,
    VisitNo.TWO: 2,
    VisitNo.THREE: 3,
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    '1': 1,
    '2': 2,
    '3': 3,
    1: 1,
    2: 2,
    3: 3,
}

INT_TO_VISIT_NO_MAP = {
    1: VisitNo.ONE,
    2: VisitNo.TWO,
    3: VisitNo.THREE,
}


class ProjectService:
    @staticmethod
    def get_milestone_weights():
        return MILESTONE_WEIGHTS

    @staticmethod
    def get_phase(milestone_no):
        if not milestone_no or milestone_no < 1:
            return 'Foundation'
        if 1 <= milestone_no <= 4:
            return 'Foundation'
        elif 5 <= milestone_no <= 6:
            return 'Plinth'
        elif 7 <= milestone_no <= 9:
            return 'Roof'
        elif 10 <= milestone_no <= 15:
            return 'Finishing'
        return 'Finishing'

    @classmethod
    def calculate_progress(cls, project):
        """Sum weights of completed milestones and update project overall progress."""
        completed_nos = ProjectMilestone.objects.filter(
            project=project, status=MilestoneStatus.COMPLETED
        ).values_list('milestone_no', flat=True)

        progress_pct = sum(cls.get_milestone_weights().get(no, 0) for no in completed_nos)
        project.overall_progress_pct = float(progress_pct)
        project.save(update_fields=['overall_progress_pct', 'updated_at'])
        return project.overall_progress_pct

    @classmethod
    def validate_milestone_order(cls, project, milestone_no):
        """Check all previous milestones (1 to milestone_no - 1) are completed."""
        if milestone_no > 1:
            prev_milestones = ProjectMilestone.objects.filter(
                project=project,
                milestone_no__lt=milestone_no
            ).order_by('milestone_no')

            for prev in prev_milestones:
                if prev.status != MilestoneStatus.COMPLETED:
                    raise serializers.ValidationError({
                        'code': 'MILESTONE_ORDER_ERROR',
                        'message': f'Cannot complete milestone {milestone_no} - milestone {prev.milestone_no} is still pending',
                        'detail': f'Cannot complete milestone {milestone_no} - milestone {prev.milestone_no} is still pending',
                    })

    @classmethod
    def complete_milestone(cls, project, milestone_no, user, remarks=''):
        """Complete a milestone for a project, enforcing ordering and calculating overall progress."""
        try:
            milestone = ProjectMilestone.objects.get(project=project, milestone_no=milestone_no)
        except ProjectMilestone.DoesNotExist:
            raise serializers.ValidationError({
                'code': 'MILESTONE_NOT_FOUND',
                'message': f'Milestone {milestone_no} not found for this project.',
                'detail': f'Milestone {milestone_no} not found for this project.',
            })

        if milestone.status == MilestoneStatus.COMPLETED:
            raise serializers.ValidationError({
                'code': 'MILESTONE_ALREADY_COMPLETED',
                'message': f'Milestone {milestone_no} is already completed.',
                'detail': f'Milestone {milestone_no} is already completed.',
            })

        cls.validate_milestone_order(project, milestone_no)

        milestone.status = MilestoneStatus.COMPLETED
        milestone.completed_date = timezone.now()
        milestone.completed_by = user
        if remarks:
            milestone.remarks = remarks
        milestone.save()

        cls.calculate_progress(project)

        if milestone_no > project.current_milestone_no:
            project.current_milestone_no = milestone_no
            project.save(update_fields=['current_milestone_no', 'updated_at'])

        return milestone

    @classmethod
    def create_visit(cls, project, engineer, visit_no, data):
        """Create a visit record ensuring sequential order (1 -> 2 -> 3)."""
        provided_int = VISIT_NO_INT_MAP.get(visit_no)
        if provided_int is None:
            raise serializers.ValidationError({
                'code': 'INVALID_VISIT_NO',
                'message': f'Invalid visit number: {visit_no}',
                'detail': f'Invalid visit number: {visit_no}',
            })

        existing_visits_count = project.visits.count()
        expected_int = existing_visits_count + 1

        if provided_int != expected_int:
            raise serializers.ValidationError({
                'code': 'VISIT_SEQUENCE_ERROR',
                'message': f'Expected visit number {expected_int}, got {provided_int}',
                'detail': f'Expected visit number {expected_int}, got {provided_int}',
            })

        visit_choice = INT_TO_VISIT_NO_MAP[provided_int]

        visit = Visit.objects.create(
            project=project,
            engineer=engineer,
            visit_no=visit_choice,
            visit_date=data['visit_date'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            progress_pct_reported=data['progress_pct_reported'],
            engineer_remarks=data.get('engineer_remarks', ''),
        )
        return visit

    @classmethod
    def submit_for_review(cls, project, milestone_no, photos=None):
        """Called when field engineer completes a milestone. Triggers AI analysis and adds to review queue."""
        pm = ProjectMilestone.objects.filter(project=project, milestone_no=milestone_no).first()
        return {
            'project_id': project.id,
            'milestone_no': milestone_no,
            'status': pm.status if pm else 'PENDING',
            'photos_count': len(photos) if photos else 0,
        }
