import os
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.common.enums import ComplianceStatus, HandoverStatus, MilestoneStatus, ProjectType, UserRole
from apps.compliance.models import ESSCheck, HSECheck
from apps.handover.models import Handover
from apps.handover.services import HandoverService
from apps.projects.models import Project, ProjectMilestone, Visit

User = get_user_model()


class HandoverAPITestCase(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='ho_admin',
            password='password123',
            role=UserRole.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        self.field_engineer = User.objects.create_user(
            username='ho_fe',
            password='password123',
            role=UserRole.FIELD_ENGINEER,
        )
        self.beneficiary = User.objects.create_user(
            username='ho_ben',
            password='password123',
            role=UserRole.HOUSE_OWNER,
        )

        self.project = Project.objects.create(
            case_id='HO-0001',
            owner_name='Handover Owner',
            owner_phone='+923000000000',
            owner_cnic_hash='hash_ho_owner',
            division='Lahore',
            district='Lahore',
            tehsil='Model Town',
            latitude=31.5,
            longitude=74.3,
            project_type=ProjectType.UNDER_CONSTRUCTION,
            plot_size_marla=5.0,
            covered_area_sqft=1200.0,
            loan_approved=3000000.0,
            loan_disbursed=3000000.0,
            assigned_engineer=self.field_engineer,
            quality_status=ComplianceStatus.COMPLETED,
        )

        self.client = APIClient()

    def test_handover_eligibility_check(self):
        self.client.force_authenticate(user=self.admin)

        # Initially ineligible because 0/15 milestones completed
        res1 = self.client.get(f'/projects/{self.project.id}/handover/eligible/')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertFalse(res1.data['data']['eligible'])

        # Complete all 15 milestones
        for i in range(1, 16):
            ProjectMilestone.objects.create(
                project=self.project,
                milestone_no=i,
                status=MilestoneStatus.COMPLETED,
                completed_date=timezone.now(),
            )

        # Create visit, HSECheck, and ESSCheck
        visit = Visit.objects.create(
            project=self.project,
            engineer=self.field_engineer,
            visit_no='ONE',
            visit_date=timezone.now().date(),
            latitude=31.5,
            longitude=74.3,
            progress_pct_reported=100.0,
        )

        HSECheck.objects.create(
            visit=visit,
            item_key='PPE_WORN',
            answer='YES',
        )

        ESSCheck.objects.create(
            visit=visit,
            trees_requiring_permission=False,
            near_settlements=False,
            near_drainage_nullah=False,
            blocks_right_of_way=False,
        )

        # Now eligible!
        res2 = self.client.get(f'/projects/{self.project.id}/handover/eligible/')
        self.assertTrue(res2.data['data']['eligible'])

    def test_handover_sign_and_certificate(self):
        # Prepare eligible project
        for i in range(1, 16):
            ProjectMilestone.objects.create(
                project=self.project,
                milestone_no=i,
                status=MilestoneStatus.COMPLETED,
            )
        visit = Visit.objects.create(
            project=self.project,
            engineer=self.field_engineer,
            visit_no='ONE',
            visit_date=timezone.now().date(),
            latitude=31.5,
            longitude=74.3,
            progress_pct_reported=100.0,
        )
        HSECheck.objects.create(visit=visit, item_key='PPE_WORN', answer='YES')
        ESSCheck.objects.create(visit=visit)

        # Beneficiary signs
        self.client.force_authenticate(user=self.beneficiary)
        res_ben = self.client.post(f'/projects/{self.project.id}/handover/sign/', {'role': 'beneficiary'}, format='json')
        self.assertEqual(res_ben.status_code, status.HTTP_200_OK)

        # Engineer signs
        self.client.force_authenticate(user=self.field_engineer)
        res_eng = self.client.post(f'/projects/{self.project.id}/handover/sign/', {'role': 'engineer'}, format='json')
        self.assertEqual(res_eng.status_code, status.HTTP_200_OK)

        # Should be HANDED_OVER now
        handover = Handover.objects.get(project=self.project)
        self.assertEqual(handover.handover_status, HandoverStatus.HANDED_OVER)
        self.assertTrue(os.path.exists(handover.certificate_path.lstrip('/')))

    def test_handover_summary_and_records(self):
        self.client.force_authenticate(user=self.admin)

        res_sum = self.client.get('/handover/summary/')
        self.assertEqual(res_sum.status_code, status.HTTP_200_OK)

        res_rec = self.client.get('/handover/records/?division=Lahore')
        self.assertEqual(res_rec.status_code, status.HTTP_200_OK)
