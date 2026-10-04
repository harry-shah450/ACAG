from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.common.enums import ComplianceStatus, HSECheckAnswer, HSECheckItem, ProjectType, UserRole, VisitNo
from apps.compliance.models import ESSCheck, HSECheck
from apps.compliance.services import ComplianceService
from apps.projects.models import Project, Visit

User = get_user_model()


class ComplianceAPITestCase(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='comp_admin',
            password='password123',
            role=UserRole.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        self.field_engineer = User.objects.create_user(
            username='comp_fe',
            password='password123',
            role=UserRole.FIELD_ENGINEER,
        )
        self.project = Project.objects.create(
            case_id='COMP-0001',
            owner_name='Compliance Owner',
            owner_phone='+923000000000',
            owner_cnic_hash='hash_comp_owner',
            division='Lahore',
            district='Lahore',
            tehsil='Model Town',
            latitude=31.5,
            longitude=74.3,
            project_type=ProjectType.UNDER_CONSTRUCTION,
            plot_size_marla=5.0,
            covered_area_sqft=1500.0,
            loan_approved=3000000.0,
            loan_disbursed=1000000.0,
            assigned_engineer=self.field_engineer,
        )
        self.visit1 = Visit.objects.create(
            project=self.project,
            engineer=self.field_engineer,
            visit_no=VisitNo.ONE,
            visit_date=timezone.now(),
            latitude=31.5,
            longitude=74.3,
            progress_pct_reported=10.0,
            engineer_remarks='Visit 1 remarks',
        )

        self.client = APIClient()

    def test_hse_score_calculation(self):
        # 4 Yes, 1 No, 1 NA -> 4/5 = 80.0%
        HSECheck.objects.create(visit=self.visit1, item_key=HSECheckItem.PPE_WORN, answer=HSECheckAnswer.YES)
        HSECheck.objects.create(visit=self.visit1, item_key=HSECheckItem.DUST_MASKS_USED, answer=HSECheckAnswer.YES)
        HSECheck.objects.create(visit=self.visit1, item_key=HSECheckItem.DRINKING_WATER_AVAILABLE, answer=HSECheckAnswer.YES)
        HSECheck.objects.create(visit=self.visit1, item_key=HSECheckItem.NO_CHILD_LABOUR, answer=HSECheckAnswer.YES)
        HSECheck.objects.create(visit=self.visit1, item_key=HSECheckItem.NO_INJURIES, answer=HSECheckAnswer.NO)
        HSECheck.objects.create(visit=self.visit1, item_key=HSECheckItem.DEBRIS_DISPOSED_PROPERLY, answer=HSECheckAnswer.NA)

        res = ComplianceService.calculate_hse_score(self.visit1.id)
        self.assertEqual(res['score'], 80.0)
        self.assertEqual(res['total_items'], 6)
        self.assertEqual(res['compliant_items'], 4)
        self.assertEqual(res['applicable_items'], 5)

    def test_ess_score_and_site_risk_flag_trigger(self):
        # 1 adverse item (trees_requiring_permission=True) -> score 75.0%, site_risk_flag=True
        ess = ESSCheck.objects.create(
            visit=self.visit1,
            trees_requiring_permission=True,
            near_settlements=False,
            near_drainage_nullah=False,
            blocks_right_of_way=False,
        )

        score_res = ComplianceService.calculate_ess_score(self.visit1.id)
        self.assertEqual(score_res['score'], 75.0)

        # Refresh project to check site_risk_flag updated by signal
        self.project.refresh_from_db()
        self.assertTrue(self.project.site_risk_flag)

        # Create visit 2 with all favorable items -> site_risk_flag should clear back to False
        visit2 = Visit.objects.create(
            project=self.project,
            engineer=self.field_engineer,
            visit_no=VisitNo.TWO,
            visit_date=timezone.now(),
            latitude=31.5,
            longitude=74.3,
            progress_pct_reported=20.0,
        )
        ESSCheck.objects.create(
            visit=visit2,
            trees_requiring_permission=False,
            near_settlements=False,
            near_drainage_nullah=False,
            blocks_right_of_way=False,
        )
        self.project.refresh_from_db()
        self.assertFalse(self.project.site_risk_flag)

    def test_submit_hse_checklist_endpoint(self):
        self.client.force_authenticate(user=self.field_engineer)
        url = f'/compliance/projects/{self.project.id}/hse/'

        payload = {
            'visit_id': self.visit1.id,
            'items': [
                {'item_key': HSECheckItem.PPE_WORN, 'answer': 'yes', 'remarks': 'PPE checked'},
                {'item_key': HSECheckItem.DUST_MASKS_USED, 'answer': 'yes'},
            ],
            'photo_path': '/media/hse1.jpg',
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'success')
        self.assertEqual(res.data['data']['hse_score']['score'], 100.0)

    def test_submit_ess_checklist_endpoint(self):
        self.client.force_authenticate(user=self.field_engineer)
        url = f'/compliance/projects/{self.project.id}/ess/'

        payload = {
            'visit_id': self.visit1.id,
            'trees_requiring_permission': False,
            'near_settlements': True,
            'near_drainage_nullah': False,
            'blocks_right_of_way': False,
            'remarks': 'Near settlement warning',
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['data']['site_risk_flag'])

    def test_compliance_summary_and_trend(self):
        self.client.force_authenticate(user=self.admin)

        # Submit ESS check for visit 1
        ESSCheck.objects.create(
            visit=self.visit1,
            trees_requiring_permission=False,
            near_settlements=False,
            near_drainage_nullah=False,
            blocks_right_of_way=False,
        )

        # Summary
        summary_res = self.client.get(f'/compliance/projects/{self.project.id}/summary/')
        self.assertEqual(summary_res.status_code, status.HTTP_200_OK)
        self.assertEqual(summary_res.data['data']['ess_score'], 100.0)

        # Trend
        trend_res = self.client.get(f'/compliance/projects/{self.project.id}/trend/')
        self.assertEqual(trend_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(trend_res.data['data']), 1)

    def test_site_risk_register_view(self):
        self.client.force_authenticate(user=self.admin)

        # Flag project via adverse ESS check
        ESSCheck.objects.create(
            visit=self.visit1,
            trees_requiring_permission=True,
            near_settlements=False,
            near_drainage_nullah=False,
            blocks_right_of_way=False,
        )

        res = self.client.get('/compliance/site-risk/?division=Lahore')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['data']), 1)
        self.assertIn('trees_requiring_permission', res.data['data'][0]['failed_items'])
