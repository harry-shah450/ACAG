import os
import openpyxl
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.common.enums import ProjectType, UserRole
from apps.projects.models import Project
from apps.reports.models import Report

User = get_user_model()


class ReportsAPITestCase(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='rep_admin',
            password='password123',
            role=UserRole.ADMIN,
            is_staff=True,
            is_superuser=True,
        )

        self.project = Project.objects.create(
            case_id='REP-0001',
            owner_name='Report Owner',
            owner_phone='+923000000000',
            owner_cnic_hash='hash_rep_owner',
            division='Lahore',
            district='Lahore',
            tehsil='Model Town',
            latitude=31.5,
            longitude=74.3,
            project_type=ProjectType.UNDER_CONSTRUCTION,
            plot_size_marla=7.0,
            covered_area_sqft=1500.0,
            loan_approved=3500000.0,
            loan_disbursed=1000000.0,
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_generate_dpr_pdf(self):
        res = self.client.get('/reports/dpr/?scope=ALL')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'application/pdf')

    def test_generate_district_excel_columns(self):
        res = self.client.get('/reports/district-excel/?division=Lahore')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            res['Content-Type'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )

        # Inspect generated Excel file to verify NON-NEGOTIABLE columns
        report = Report.objects.filter(report_type='DISTRICT_EXCEL').first()
        self.assertIsNotNone(report)
        abs_path = report.file_path.lstrip('/')
        self.assertTrue(os.path.exists(abs_path))

        wb = openpyxl.load_workbook(abs_path)
        ws = wb.active

        expected_columns = [
            'Case ID',
            'Applicant Name',
            'Contact',
            'Tehsil',
            'GPS Coordinates',
            'Loan Approved',
            'Loan Disbursed',
            'Visit Date',
            'Overall Work Progress %',
            'Current Status',
            'Overall Engineer Rating',
            'Remarks',
        ]

        actual_columns = [ws.cell(row=1, column=col).value for col in range(1, 13)]
        self.assertEqual(actual_columns, expected_columns)

    def test_generate_report_post_and_list(self):
        payload = {
            'type': 'DPR',
            'scope': 'DIVISION',
            'scope_value': 'Lahore',
        }
        res_post = self.client.post('/reports/generate/', payload, format='json')
        self.assertEqual(res_post.status_code, status.HTTP_201_CREATED)

        res_list = self.client.get('/reports/')
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_list.data['data']), 1)
