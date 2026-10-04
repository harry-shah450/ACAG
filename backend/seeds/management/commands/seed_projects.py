from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.common.enums import ComplianceStatus, ProjectType, UserRole, VisitNo
from apps.projects.models import Project, ProjectMilestone, Visit
from apps.projects.services import ProjectService


class Command(BaseCommand):
    help = 'Seed test projects with milestones and visits'

    def handle(self, *args, **options):
        # Ensure seed_milestones ran
        from seeds.management.commands.seed_milestones import Command as SeedMilestonesCommand
        SeedMilestonesCommand().handle()

        engineers = list(User.objects.filter(role=UserRole.FIELD_ENGINEER))
        if not engineers:
            self.stdout.write(self.style.WARNING('No field engineers found. Run create_test_users first.'))
            field_engineer = None
        else:
            field_engineer = engineers[0]

        districts_data = [
            ('Lahore', 'Lahore', 'Model Town', 31.5204, 74.3587),
            ('Lahore', 'Lahore', 'Gulberg', 31.5102, 74.3441),
            ('Rawalpindi', 'Rawalpindi', 'Saddar', 33.5984, 73.0441),
            ('Rawalpindi', 'Rawalpindi', 'Taxila', 33.7463, 72.8397),
            ('Multan', 'Multan', 'Multan City', 30.1575, 71.5249),
            ('Faisalabad', 'Faisalabad', 'Lyallpur', 31.4504, 73.1350),
            ('Gujranwala', 'Gujranwala', 'Gujranwala City', 32.1877, 74.1945),
            ('Sarkodha', 'Sarkodha', 'Sargodha City', 32.0836, 72.6711),
            ('Sahiwal', 'Sahiwal', 'Sahiwal City', 30.6682, 73.1114),
            ('Bahawalpur', 'Bahawalpur', 'Bahawalpur City', 29.3544, 71.6911),
        ]

        project_types = [
            ProjectType.VACANT_PLOT,
            ProjectType.UNDER_CONSTRUCTION,
            ProjectType.COMPLETED_HOME,
        ]

        created_count = 0

        for i, (div, dist, teh, lat, lng) in enumerate(districts_data, start=1):
            case_id = f'VS-2026-{i:04d}'
            eng = engineers[(i - 1) % len(engineers)] if engineers else None

            project, created = Project.objects.get_or_create(
                case_id=case_id,
                defaults={
                    'owner_name': f'Owner {i}',
                    'owner_phone': f'+9230000000{i:02d}',
                    'owner_cnic_hash': f'hash_cnic_{i:04d}',
                    'division': div,
                    'district': dist,
                    'tehsil': teh,
                    'latitude': lat,
                    'longitude': lng,
                    'project_type': project_types[(i - 1) % len(project_types)],
                    'plot_size_marla': 5.0 + (i * 2.5),
                    'covered_area_sqft': 1200.0 + (i * 300.0),
                    'loan_approved': 2500000.00 + (i * 500000.00),
                    'loan_disbursed': 1000000.00 + (i * 200000.00),
                    'assigned_engineer': eng,
                    'plans_status': ComplianceStatus.COMPLETED if i % 2 == 0 else ComplianceStatus.PENDING,
                    'environment_status': ComplianceStatus.COMPLETED if i % 3 == 0 else ComplianceStatus.PENDING,
                    'quality_status': ComplianceStatus.COMPLETED if i % 2 == 1 else ComplianceStatus.PENDING,
                    'site_risk_flag': True if i in (3, 7) else False,
                },
            )

            if created:
                created_count += 1

                # Create 15 milestones
                milestones = []
                num_completed = (i * 2) % 16  # Vary from 0 to 15 completed milestones
                for m_no in range(1, 16):
                    status_val = 'COMPLETED' if m_no <= num_completed else 'PENDING'
                    pm = ProjectMilestone.objects.create(
                        project=project,
                        milestone_no=m_no,
                        status=status_val,
                        completed_date=timezone.now() if status_val == 'COMPLETED' else None,
                        completed_by=eng if status_val == 'COMPLETED' else None,
                        remarks=f'Milestone {m_no} remark' if status_val == 'COMPLETED' else '',
                    )
                    milestones.append(pm)

                # Calculate overall progress & current milestone no
                ProjectService.calculate_progress(project)
                if num_completed > 0:
                    project.current_milestone_no = num_completed
                    project.save(update_fields=['current_milestone_no'])

                # Add sample visit for projects with at least 1 milestone completed
                if num_completed >= 1 and eng:
                    Visit.objects.create(
                        project=project,
                        engineer=eng,
                        visit_no=VisitNo.ONE,
                        visit_date=timezone.now(),
                        latitude=lat,
                        longitude=lng,
                        progress_pct_reported=project.overall_progress_pct,
                        engineer_remarks='Initial field visit verification.',
                    )

        self.stdout.write(
            self.style.SUCCESS(f'Projects seeded: {created_count} new project(s) created.')
        )
