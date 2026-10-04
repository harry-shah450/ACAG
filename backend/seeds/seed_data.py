"""Shared seed helpers used by management commands and data migrations."""

from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.utils import timezone

BASE_DIR = Path(__file__).resolve().parent.parent
ENGINEERS_FIXTURE = Path(__file__).resolve().parent / 'data' / 'junior_engineers.json'

DIVISIONS = [
    'Rawalpindi',
    'Sargodha',
    'Gujranwala',
    'Gujrat',
    'Faisalabad',
    'Lahore',
    'Sahiwal',
    'Multan',
    'D.G. Khan',
    'Bahawalpur',
]

MILESTONES = [
    (1, 'Site Preparation / Layout Marking', 2, 'Foundation'),
    (2, 'Excavation Completed', 3, 'Foundation'),
    (3, 'Foundation Completed', 8, 'Foundation'),
    (4, 'Foundation Backfilling Completed', 3, 'Foundation'),
    (5, 'Damp Proof Course (DPC) Completed', 4, 'Plinth'),
    (6, 'Plinth Filling & Compaction Completed', 4, 'Plinth'),
    (7, 'Wall Masonry up to Lintel Level Completed', 15, 'Roof'),
    (8, 'Lintel Completed', 5, 'Roof'),
    (9, 'Roof Slab (RCC) Cast Completed', 15, 'Roof'),
    (10, 'Plastering Completed', 10, 'Finishing'),
    (11, 'Flooring Completed', 8, 'Finishing'),
    (12, 'Doors & Windows Installed', 8, 'Finishing'),
    (13, 'Electrical & Plumbing Completed', 7, 'Finishing'),
    (14, 'Paint & Finishing Completed', 6, 'Finishing'),
    (15, 'House Construction Completed', 2, 'Finishing'),
]

SOIL_REFERENCE_DATA = [
    ('Attock', 'Loamy Sand', 'Moderate', 'Suitable for shallow foundations with proper compaction.'),
    ('Chakwal', 'Silty Loam', 'Low', 'Generally stable; watch for seasonal moisture variation.'),
    ('Jhelum', 'Clay Loam', 'Moderate', 'May require improved drainage near slopes.'),
    ('Rawalpindi', 'Sandy Loam', 'Moderate', 'Rocky substrata common in hilly areas.'),
    ('Murree', 'Silty Clay', 'High', 'Steep terrain; erosion risk during heavy rain.'),
    ('Sargodha', 'Loam', 'Low', 'Good bearing capacity for residential construction.'),
    ('Khushab', 'Sandy Loam', 'Moderate', 'Check groundwater level before excavation.'),
    ('Mianwali', 'Loamy Sand', 'Moderate', 'Wind erosion possible in open plots.'),
    ('Bhakkar', 'Sandy Clay', 'Moderate', 'Shrink-swell behavior during monsoon.'),
    ('Gujranwala', 'Alluvial Loam', 'Low', 'Fertile alluvial soils with good stability.'),
    ('Gujrat', 'Silty Loam', 'Low', 'Suitable for standard strip foundations.'),
    ('Hafizabad', 'Loam', 'Low', 'Minimal special foundation requirements.'),
    ('Mandi Bahauddin', 'Clay Loam', 'Moderate', 'Monitor moisture content during curing.'),
    ('Sialkot', 'Silty Clay', 'Moderate', 'Drainage planning recommended near canals.'),
    ('Narowal', 'Loamy Sand', 'Low', 'Stable for typical single-storey housing.'),
    ('Faisalabad', 'Alluvial Loam', 'Low', 'High agricultural productivity soils.'),
    ('Jhang', 'Sandy Loam', 'Moderate', 'Floodplain areas need raised plinth.'),
    ('Toba Tek Singh', 'Loam', 'Low', 'Standard foundation practices apply.'),
    ('Chiniot', 'Silty Loam', 'Low', 'Good compaction characteristics.'),
    ('Lahore', 'Alluvial Silt', 'Moderate', 'High water table in some urban zones.'),
    ('Kasur', 'Loamy Sand', 'Moderate', 'Canal proximity may affect moisture.'),
    ('Nankana Sahib', 'Loam', 'Low', 'Generally favorable for construction.'),
    ('Sheikhupura', 'Silty Loam', 'Low', 'Stable alluvial deposits.'),
    ('Sahiwal', 'Alluvial Loam', 'Low', 'Excellent for conventional foundations.'),
    ('Okara', 'Loam', 'Low', 'Low susceptibility to settlement.'),
    ('Pakpattan', 'Sandy Loam', 'Moderate', 'Check salinity near agricultural fields.'),
    ('Multan', 'Silty Clay', 'Moderate', 'Hot climate; account for thermal expansion.'),
    ('Khanewal', 'Loam', 'Low', 'Good load-bearing for residential builds.'),
    ('Lodhran', 'Sandy Loam', 'Moderate', 'Desert fringe soils; windblown sand possible.'),
    ('Vehari', 'Loamy Sand', 'Moderate', 'Irrigated belt with variable moisture.'),
    ('D.G. Khan', 'Sandy Clay', 'High', 'Arid climate; deep foundations in loose sand.'),
    ('Layyah', 'Loamy Sand', 'Moderate', 'Riverine deposits near Indus tributaries.'),
    ('Muzaffargarh', 'Silty Clay', 'High', 'Flood-prone; elevate finished floor level.'),
    ('Rajanpur', 'Sandy Loam', 'High', 'Flash flood risk in kacha areas.'),
    ('Bahawalpur', 'Sandy Loam', 'Moderate', 'Cholistan fringe; shifting sand in open areas.'),
    ('Rahim Yar Khan', 'Loamy Sand', 'Moderate', 'Desert soils; compaction critical at DPC.'),
]

DUMMY_PROJECTS = [
    ('VS-2026-0001', 'Owner 1', 'Lahore', 'Lahore', 'Model Town', 31.5204, 74.3587, 'UNDER_CONSTRUCTION', 5),
    ('VS-2026-0002', 'Owner 2', 'Lahore', 'Lahore', 'Gulberg', 31.5102, 74.3441, 'VACANT_PLOT', 0),
    ('VS-2026-0003', 'Owner 3', 'Rawalpindi', 'Rawalpindi', 'Saddar', 33.5984, 73.0441, 'UNDER_CONSTRUCTION', 3),
    ('VS-2026-0004', 'Owner 4', 'Rawalpindi', 'Rawalpindi', 'Taxila', 33.7463, 72.8397, 'UNDER_CONSTRUCTION', 8),
    ('VS-2026-0005', 'Owner 5', 'Multan', 'Multan', 'Multan City', 30.1575, 71.5249, 'COMPLETED_HOME', 15),
    ('VS-2026-0006', 'Owner 6', 'Faisalabad', 'Faisalabad', 'Lyallpur', 31.4504, 73.1350, 'UNDER_CONSTRUCTION', 6),
    ('VS-2026-0007', 'Owner 7', 'Gujranwala', 'Gujranwala', 'Gujranwala City', 32.1877, 74.1945, 'VACANT_PLOT', 1),
    ('VS-2026-0008', 'Owner 8', 'Sargodha', 'Sargodha', 'Sargodha City', 32.0836, 72.6711, 'UNDER_CONSTRUCTION', 10),
    ('VS-2026-0009', 'Owner 9', 'Sahiwal', 'Sahiwal', 'Sahiwal City', 30.6682, 73.1114, 'UNDER_CONSTRUCTION', 4),
    ('VS-2026-0010', 'Owner 10', 'Bahawalpur', 'Bahawalpur', 'Bahawalpur City', 29.3544, 71.6911, 'UNDER_CONSTRUCTION', 12),
]


def ensure_admin_user():
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@vigilant.local',
            'role': 'ADMIN',
            'division': 'Lahore',
            'district': 'Lahore',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        },
    )
    # Always reset password to the known demo credential.
    user.set_password('admin')
    user.role = 'ADMIN'
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    return user, created


def seed_divisions():
    from apps.common.models import Division

    for name in DIVISIONS:
        Division.objects.get_or_create(name=name)


def seed_milestones():
    from apps.projects.models import MilestoneDefinition

    for milestone_no, name, duration_days, phase in MILESTONES:
        MilestoneDefinition.objects.update_or_create(
            milestone_no=milestone_no,
            defaults={
                'name': name,
                'duration_days': duration_days,
                'phase': phase,
            },
        )


def seed_soil_reference():
    from apps.projects.models import SoilReference

    for district, soil_type, susceptibility, note in SOIL_REFERENCE_DATA:
        SoilReference.objects.update_or_create(
            district=district,
            defaults={
                'dominant_soil_type': soil_type,
                'susceptibility': susceptibility,
                'note': note,
            },
        )


def seed_junior_engineers(fixture_path: Path | None = None):
    from apps.accounts.models import JuniorEngineer

    path = fixture_path or ENGINEERS_FIXTURE
    if not path.exists():
        raise FileNotFoundError(f'Engineer fixture not found: {path}')

    rows = json.loads(path.read_text(encoding='utf-8'))
    created = 0
    updated = 0
    for row in rows:
        _, was_created = JuniorEngineer.objects.update_or_create(
            cnic=row['cnic'],
            defaults={
                'sr_no': row['sr_no'],
                'name': row['name'],
                'email': row.get('email', ''),
                'phone': row.get('phone', ''),
                'degree_16': row.get('degree_16', ''),
                'degree_18': row.get('degree_18', ''),
                'division': row.get('division', ''),
                'assigned_district': row.get('assigned_district', ''),
                'is_active': True,
            },
        )
        if was_created:
            created += 1
        else:
            updated += 1
    return created, updated


def seed_dummy_projects():
    """Create dummy projects/milestones for dashboard demos (no engineer login users)."""
    from apps.common.enums import ComplianceStatus, MilestoneStatus
    from apps.projects.models import Project, ProjectMilestone

    for i, (
        case_id, owner_name, division, district, tehsil, lat, lng, project_type, completed
    ) in enumerate(DUMMY_PROJECTS, start=1):
        project, created = Project.objects.get_or_create(
            case_id=case_id,
            defaults={
                'owner_name': owner_name,
                'owner_phone': f'+9230000000{i:02d}',
                'owner_cnic_hash': f'hash_cnic_{i:04d}',
                'division': division,
                'district': district,
                'tehsil': tehsil,
                'latitude': lat,
                'longitude': lng,
                'project_type': project_type,
                'plot_size_marla': 5.0 + (i * 2.5),
                'covered_area_sqft': 1200.0 + (i * 300.0),
                'loan_approved': Decimal('2500000.00') + Decimal(i * 500000),
                'loan_disbursed': Decimal('1000000.00') + Decimal(i * 200000),
                'assigned_engineer': None,
                'plans_status': ComplianceStatus.COMPLETED if i % 2 == 0 else ComplianceStatus.PENDING,
                'environment_status': ComplianceStatus.COMPLETED if i % 3 == 0 else ComplianceStatus.PENDING,
                'quality_status': ComplianceStatus.COMPLETED if i % 2 == 1 else ComplianceStatus.PENDING,
                'site_risk_flag': i in (3, 7),
                'overall_progress_pct': round((completed / 15) * 100, 2),
                'current_milestone_no': completed,
            },
        )
        if not created:
            continue

        for m_no in range(1, 16):
            is_done = m_no <= completed
            ProjectMilestone.objects.create(
                project=project,
                milestone_no=m_no,
                status=MilestoneStatus.COMPLETED if is_done else MilestoneStatus.PENDING,
                completed_date=timezone.now() if is_done else None,
                completed_by=None,
                remarks=f'Milestone {m_no} remark' if is_done else '',
            )


def seed_all():
    """Run full Phase-1/2 demo seed used by data migration."""
    ensure_admin_user()
    seed_divisions()
    seed_milestones()
    seed_soil_reference()
    seed_junior_engineers()
    seed_dummy_projects()
