from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.common.enums import ComplianceStatus, MilestoneStatus, ProjectType, UserRole
from apps.projects.models import MilestoneDefinition, Project, ProjectMilestone, Visit
from apps.projects.services import ProjectService

User = get_user_model()


class ProjectsAPITestCase(TestCase):
    def setUp(self):
        # Create milestone definitions
        from seeds.management.commands.seed_milestones import MILESTONES
        for milestone_no, name, duration_days, phase in MILESTONES:
            MilestoneDefinition.objects.get_or_create(
                milestone_no=milestone_no,
                defaults={
                    'name': name,
                    'duration_days': duration_days,
                    'phase': phase,
                },
            )

        # Users
        self.admin = User.objects.create_user(
            username='test_admin',
            password='password123',
            role=UserRole.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        self.field_engineer = User.objects.create_user(
            username='test_fe',
            password='password123',
            role=UserRole.FIELD_ENGINEER,
        )
        self.other_engineer = User.objects.create_user(
            username='other_fe',
            password='password123',
            role=UserRole.FIELD_ENGINEER,
        )
        self.house_owner = User.objects.create_user(
            username='test_owner',
            password='password123',
            role=UserRole.HOUSE_OWNER,
            phone='+923001234567',
            cnic_hash='hash_cnic_owner',
        )

        # Project
        self.project = Project.objects.create(
            case_id='TEST-0001',
            owner_name='Test Owner',
            owner_phone='+923001234567',
            owner_cnic_hash='hash_cnic_owner',
            division='Lahore',
            district='Lahore',
            tehsil='Model Town',
            latitude=31.5204,
            longitude=74.3587,
            project_type=ProjectType.UNDER_CONSTRUCTION,
            plot_size_marla=10.0,
            covered_area_sqft=2500.0,
            loan_approved=5000000.00,
            loan_disbursed=2000000.00,
            assigned_engineer=self.field_engineer,
        )
        for i in range(1, 16):
            ProjectMilestone.objects.create(
                project=self.project,
                milestone_no=i,
                status=MilestoneStatus.PENDING,
            )

        self.client = APIClient()

    def test_milestone_order_and_progress_calculation(self):
        # Cannot complete milestone 2 before milestone 1
        with self.assertRaises(Exception):
            ProjectService.complete_milestone(self.project, 2, self.field_engineer)

        # Complete milestone 1
        m1 = ProjectService.complete_milestone(self.project, 1, self.field_engineer, remarks='Done layout')
        self.assertEqual(m1.status, MilestoneStatus.COMPLETED)
        self.assertEqual(self.project.overall_progress_pct, 2.0)
        self.assertEqual(self.project.current_milestone_no, 1)

        # Complete milestone 2
        m2 = ProjectService.complete_milestone(self.project, 2, self.field_engineer, remarks='Excavation done')
        self.assertEqual(m2.status, MilestoneStatus.COMPLETED)
        self.assertEqual(self.project.overall_progress_pct, 5.0)  # 2 + 3
        self.assertEqual(self.project.current_milestone_no, 2)

    def test_visit_sequence_validation(self):
        data = {
            'visit_date': timezone.now().isoformat(),
            'latitude': 31.5204,
            'longitude': 74.3587,
            'progress_pct_reported': 5.0,
            'engineer_remarks': 'First visit',
        }
        # Attempting visit 2 first should fail
        with self.assertRaises(Exception):
            ProjectService.create_visit(self.project, self.field_engineer, visit_no='2', data=data)

        # Visit 1 should succeed
        v1 = ProjectService.create_visit(self.project, self.field_engineer, visit_no='1', data=data)
        self.assertIsNotNone(v1.id)

        # Creating another Visit 1 should fail (sequence expects 2)
        with self.assertRaises(Exception):
            ProjectService.create_visit(self.project, self.field_engineer, visit_no='1', data=data)

    def test_create_project_engineer_role_validation(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post('/projects/', {
            'case_id': 'TEST-0002',
            'owner_name': 'New Owner',
            'owner_phone': '+923009999999',
            'owner_cnic_hash': 'hash9999',
            'division': 'Lahore',
            'district': 'Lahore',
            'tehsil': 'Gulberg',
            'latitude': 31.5,
            'longitude': 74.3,
            'project_type': 'VACANT_PLOT',
            'plot_size_marla': 5.0,
            'covered_area_sqft': 1200.0,
            'loan_approved': '1000000.00',
            'loan_disbursed': '500000.00',
            'assigned_engineer': self.house_owner.id,  # Invalid role
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_complete_milestone_endpoint_photo_required(self):
        self.client.force_authenticate(user=self.field_engineer)
        url = f'/projects/{self.project.id}/milestones/1/complete/'

        # Without photos -> fail
        res = self.client.post(url, {'remarks': 'No photo'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['code'], 'PHOTO_REQUIRED')

        # With photos -> success
        res = self.client.post(url, {'remarks': 'With photo', 'photos': ['http://image.url/ref1.jpg']}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'success')
        self.assertEqual(res.data['data']['overall_progress_pct'], 2.0)

    def test_role_based_list_filtering(self):
        # Admin sees project
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/projects/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['count'], 1)

        # Assigned Field Engineer sees project
        self.client.force_authenticate(user=self.field_engineer)
        res = self.client.get('/projects/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['count'], 1)

        # Other Field Engineer sees 0 projects
        self.client.force_authenticate(user=self.other_engineer)
        res = self.client.get('/projects/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['count'], 0)

        # House Owner sees project (matching cnic/phone)
        self.client.force_authenticate(user=self.house_owner)
        res = self.client.get('/projects/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['count'], 1)

    def test_phase_filter(self):
        self.client.force_authenticate(user=self.admin)

        # Foundation phase (current_milestone_no is 0)
        res = self.client.get('/projects/?phase=Foundation')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['count'], 1)

        # Plinth phase
        res = self.client.get('/projects/?phase=Plinth')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['count'], 0)

    def test_compliance_patch_admin_only(self):
        # Field engineer fails
        self.client.force_authenticate(user=self.field_engineer)
        res = self.client.patch(f'/projects/{self.project.id}/compliance/', {
            'plans_status': ComplianceStatus.COMPLETED
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin succeeds
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(f'/projects/{self.project.id}/compliance/', {
            'plans_status': ComplianceStatus.COMPLETED
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['plans_status'], ComplianceStatus.COMPLETED)
