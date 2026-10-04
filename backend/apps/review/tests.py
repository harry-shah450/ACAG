from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.common.enums import (
    ComplianceStatus,
    MilestoneStatus,
    NotificationPriority,
    NotificationType,
    ProjectType,
    QualityGrade,
    ReviewDecision,
    UserRole,
)
from apps.common.models import Notification
from apps.projects.models import Photo, Project, ProjectMilestone
from apps.review.models import AIResult, Review
from apps.review.services import ReviewService

User = get_user_model()


class ReviewAPITestCase(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='rev_admin',
            password='password123',
            role=UserRole.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        self.reviewer = User.objects.create_user(
            username='rev_engineer',
            password='password123',
            role=UserRole.BACKEND_REVIEW_ENGINEER,
        )
        self.field_engineer = User.objects.create_user(
            username='fe_user',
            password='password123',
            role=UserRole.FIELD_ENGINEER,
        )
        self.house_owner = User.objects.create_user(
            username='ho_user',
            password='password123',
            role=UserRole.HOUSE_OWNER,
        )

        self.project = Project.objects.create(
            case_id='REV-0001',
            owner_name='Review Owner',
            owner_phone='+923000000000',
            owner_cnic_hash='hash_rev_owner',
            division='Lahore',
            district='Lahore',
            tehsil='Model Town',
            latitude=31.5,
            longitude=74.3,
            project_type=ProjectType.UNDER_CONSTRUCTION,
            plot_size_marla=10.0,
            covered_area_sqft=2000.0,
            loan_approved=4000000.0,
            loan_disbursed=1000000.0,
            assigned_engineer=self.field_engineer,
            quality_status=ComplianceStatus.PENDING,
        )

        # Milestone 1 completed
        self.pm1 = ProjectMilestone.objects.create(
            project=self.project,
            milestone_no=1,
            status=MilestoneStatus.COMPLETED,
            completed_date=timezone.now(),
            completed_by=self.field_engineer,
        )
        # Milestone 2 pending
        self.pm2 = ProjectMilestone.objects.create(
            project=self.project,
            milestone_no=2,
            status=MilestoneStatus.PENDING,
        )

        self.photo1 = Photo.objects.create(
            project=self.project,
            milestone_no=1,
            image_ref='https://storage.vigilant.com/p1.jpg',
            latitude=31.5,
            longitude=74.3,
            gps_accuracy_m=5.0,
            captured_at=timezone.now(),
            uploaded_by=self.field_engineer,
        )

        self.client = APIClient()

    def test_review_queue_listing_and_filtering(self):
        self.client.force_authenticate(user=self.reviewer)

        res = self.client.get('/review/queue/?division=Lahore')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data['data']['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['project_id'], self.project.id)
        self.assertEqual(results[0]['milestone_no'], 1)

    def test_review_detail_view(self):
        self.client.force_authenticate(user=self.reviewer)

        # Create AI result
        AIResult.objects.create(
            photo=self.photo1,
            proposed_grade=QualityGrade.GOOD,
            confidence_score=92.5,
        )

        res = self.client.get(f'/review/{self.project.id}/1/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['milestone']['no'], 1)
        self.assertEqual(len(res.data['data']['photos']), 1)
        self.assertEqual(res.data['data']['photos'][0]['ai_result']['proposed_grade'], QualityGrade.GOOD)

    def test_submit_review_accepted(self):
        self.client.force_authenticate(user=self.reviewer)

        payload = {
            'decision': ReviewDecision.ACCEPTED,
            'final_grade': QualityGrade.GOOD,
            'remarks': 'Work looks great',
        }
        res = self.client.post(f'/review/{self.project.id}/1/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        self.project.refresh_from_db()
        self.assertEqual(self.project.quality_status, ComplianceStatus.COMPLETED)

        # Check notification
        notif = Notification.objects.filter(user=self.field_engineer, type=NotificationType.AI_VALIDATION_COMPLETE).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.priority, NotificationPriority.MEDIUM)

    def test_submit_review_rejected_requires_rectification(self):
        self.client.force_authenticate(user=self.reviewer)

        # Missing rectification_text -> 400
        payload_fail = {
            'decision': ReviewDecision.REJECTED,
            'final_grade': QualityGrade.NOT_SATISFACTORY,
            'remarks': 'Defects present',
        }
        res = self.client.post(f'/review/{self.project.id}/1/', payload_fail, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # With rectification_text -> success
        payload_success = {
            'decision': ReviewDecision.REJECTED,
            'final_grade': QualityGrade.NOT_SATISFACTORY,
            'remarks': 'Rebar spacing incorrect',
            'rectification_text': 'Re-bind rebar mesh with 6 inch center-to-center spacing.',
        }
        res = self.client.post(f'/review/{self.project.id}/1/', payload_success, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        self.project.refresh_from_db()
        self.assertEqual(self.project.quality_status, ComplianceStatus.PENDING)

        notif = Notification.objects.filter(user=self.field_engineer, type=NotificationType.RECTIFICATION_ISSUED).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.priority, NotificationPriority.HIGH)

    def test_review_eligibility_view(self):
        self.client.force_authenticate(user=self.reviewer)

        # Milestone 1 is completed -> eligible
        res1 = self.client.get(f'/review/{self.project.id}/1/eligible/')
        self.assertTrue(res1.data['data']['eligible'])

        # Milestone 2 is pending -> not eligible
        res2 = self.client.get(f'/review/{self.project.id}/2/eligible/')
        self.assertFalse(res2.data['data']['eligible'])

    def test_ai_analyze_photo_endpoints(self):
        self.client.force_authenticate(user=self.admin)

        # Single photo AI result
        res = self.client.post('/ai/analyze-photo/', {
            'photo_id': self.photo1.id,
            'proposed_grade': QualityGrade.VERY_GOOD,
            'confidence_score': 96.0,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        ai = AIResult.objects.filter(photo=self.photo1).first()
        self.assertIsNotNone(ai)
        self.assertEqual(ai.proposed_grade, QualityGrade.VERY_GOOD)

    def test_permission_restrictions(self):
        # House owner fails with 403
        self.client.force_authenticate(user=self.house_owner)
        res = self.client.get('/review/queue/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Field engineer fails with 403
        self.client.force_authenticate(user=self.field_engineer)
        res = self.client.get('/review/queue/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
