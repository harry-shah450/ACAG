import os
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Count, Q
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from apps.common.enums import ComplianceStatus, HandoverStatus, MilestoneStatus
from apps.common.utils import log_audit
from apps.compliance.models import ESSCheck, HSECheck
from apps.compliance.services import ComplianceService
from apps.handover.models import Handover
from apps.projects.models import Project, ProjectMilestone


class HandoverService:
    @classmethod
    def check_handover_eligibility(cls, project):
        """Check if project meets all 5 handover eligibility conditions."""
        reasons = []

        completed_count = ProjectMilestone.objects.filter(
            project=project, status=MilestoneStatus.COMPLETED
        ).count()
        if completed_count < 15:
            reasons.append(f'Only {completed_count}/15 milestones are completed.')

        hse_exists = HSECheck.objects.filter(visit__project=project).exists()
        if not hse_exists:
            reasons.append('No HSE checklist recorded for this project.')

        ess_exists = ESSCheck.objects.filter(visit__project=project).exists()
        if not ess_exists:
            reasons.append('No ESS checklist recorded for this project.')

        quality_completed = (
            project.quality_status == ComplianceStatus.COMPLETED
            or str(project.quality_status).lower() == 'completed'
        )
        if not quality_completed:
            reasons.append('Quality status is not marked as completed.')

        return {
            'eligible': len(reasons) == 0,
            'reasons': reasons,
        }

    @classmethod
    def update_handover_status(cls, project, status_val, data=None, request=None):
        """Update handover record, utility connections, and transition status."""
        data = data or {}
        handover, _ = Handover.objects.get_or_create(project=project)

        if 'occupant_count' in data:
            handover.occupant_count = data['occupant_count']
        if 'occupant_details' in data:
            handover.occupant_details = data['occupant_details']
        if 'electricity_connected' in data:
            handover.electricity_connected = data['electricity_connected']
        if 'gas_connected' in data:
            handover.gas_connected = data['gas_connected']
        if 'drainage_connected' in data:
            handover.drainage_connected = data['drainage_connected']
        if 'water_supply_connected' in data:
            handover.water_supply_connected = data['water_supply_connected']

        if status_val == HandoverStatus.HANDED_OVER or status_val == 'HANDED_OVER':
            eligibility = cls.check_handover_eligibility(project)
            if not eligibility['eligible']:
                raise ValidationError({
                    'code': 'HANDOVER_INELIGIBLE',
                    'message': 'Project is not eligible for handover.',
                    'reasons': eligibility['reasons'],
                })

            handover.handover_status = HandoverStatus.HANDED_OVER
            if not handover.handover_date:
                handover.handover_date = timezone.now()
            cls.generate_completion_certificate(project, handover)

        elif status_val == HandoverStatus.PENDING_HANDOVER or status_val == 'PENDING_HANDOVER':
            handover.handover_status = HandoverStatus.PENDING_HANDOVER
        elif status_val == HandoverStatus.UNDER_CONSTRUCTION or status_val == 'UNDER_CONSTRUCTION':
            handover.handover_status = HandoverStatus.UNDER_CONSTRUCTION

        handover.save()

        log_audit(
            user=request.user if request and hasattr(request, 'user') else None,
            action='UPDATE',
            entity_type='handover',
            entity_id=handover.id,
            after={'status': handover.handover_status},
            request=request,
        )

        return handover

    @classmethod
    def generate_completion_certificate(cls, project, handover):
        """Generate PDF handover certificate using ReportLab."""
        cert_dir = os.path.join(settings.MEDIA_ROOT, 'certificates')
        os.makedirs(cert_dir, exist_ok=True)

        filename = f'certificate_{project.case_id}.pdf'
        file_path = os.path.join(cert_dir, filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CertTitle',
            parent=styles['Heading1'],
            fontSize=20,
            leading=24,
            alignment=1,
            textColor=colors.HexColor('#1E3A8A'),
        )
        subtitle_style = ParagraphStyle(
            'CertSubTitle',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            alignment=1,
            textColor=colors.HexColor('#4B5563'),
        )
        normal_style = styles['Normal']

        elements = []

        # Title
        elements.append(Paragraph('GOVERNMENT OF PUNJAB - ACAG MONITORING', title_style))
        elements.append(Spacer(1, 8))
        elements.append(Paragraph('PROJECT COMPLETION & HANDOVER CERTIFICATE', subtitle_style))
        elements.append(Spacer(1, 16))

        # Project Details Table
        scores = ComplianceService.get_project_scores(project)
        details_data = [
            ['Case ID:', project.case_id, 'Handover Date:', handover.handover_date.strftime('%Y-%m-%d') if handover.handover_date else 'N/A'],
            ['Owner Name:', project.owner_name, 'Division:', project.division],
            ['District:', project.district, 'Tehsil:', project.tehsil],
            ['HSE Score:', f"{scores['hse']['score']}%", 'ESS Score:', f"{scores['ess']['score']}%"],
            ['Quality Status:', project.quality_status, 'Handover Status:', handover.handover_status],
        ]

        t_details = Table(details_data, colWidths=[100, 160, 100, 160])
        t_details.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F3F4F6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#111827')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t_details)
        elements.append(Spacer(1, 16))

        # Utilities Table
        elements.append(Paragraph('<b>Utility Connection Status</b>', styles['Heading3']))
        elements.append(Spacer(1, 6))

        util_data = [
            ['Utility', 'Status'],
            ['Electricity', 'Connected' if handover.electricity_connected else 'Not Connected'],
            ['Sui Gas', 'Connected' if handover.gas_connected else 'Not Connected'],
            ['Drainage', 'Connected' if handover.drainage_connected else 'Not Connected'],
            ['Water Supply', 'Connected' if handover.water_supply_connected else 'Not Connected'],
        ]
        t_util = Table(util_data, colWidths=[260, 260])
        t_util.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t_util)
        elements.append(Spacer(1, 20))

        # Signatures
        ben_sig = f"Signed by {handover.beneficiary_signed_by.get_full_name()} on {handover.beneficiary_signed_at.strftime('%Y-%m-%d')}" if handover.beneficiary_signed_at else "Pending Signature"
        eng_sig = f"Signed by {handover.engineer_signed_by.get_full_name()} on {handover.engineer_signed_at.strftime('%Y-%m-%d')}" if handover.engineer_signed_at else "Pending Signature"

        sig_data = [
            ['Beneficiary Signature', 'Field Engineer Signature'],
            [ben_sig, eng_sig],
        ]
        t_sig = Table(sig_data, colWidths=[260, 260])
        t_sig.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(t_sig)

        doc.build(elements)

        rel_path = f'/media/certificates/{filename}'
        handover.certificate_path = rel_path
        handover.certificate_generated_at = timezone.now()
        handover.save(update_fields=['certificate_path', 'certificate_generated_at', 'updated_at'])

        return rel_path

    @classmethod
    def sign_handover(cls, project, user, role, request=None):
        """Sign off on handover record by beneficiary or engineer."""
        if role not in ('beneficiary', 'engineer'):
            raise ValidationError('Role must be "beneficiary" or "engineer".')

        handover, _ = Handover.objects.get_or_create(project=project)

        now = timezone.now()
        if role == 'beneficiary':
            handover.beneficiary_signed_at = now
            handover.beneficiary_signed_by = user
        elif role == 'engineer':
            handover.engineer_signed_at = now
            handover.engineer_signed_by = user

        # If both have signed, attempt status transition to HANDED_OVER
        if handover.beneficiary_signed_at and handover.engineer_signed_at:
            eligibility = cls.check_handover_eligibility(project)
            if eligibility['eligible']:
                handover.handover_status = HandoverStatus.HANDED_OVER
                handover.handover_date = now
                cls.generate_completion_certificate(project, handover)
            else:
                handover.handover_status = HandoverStatus.PENDING_HANDOVER

        handover.save()

        log_audit(
            user=user,
            action='UPDATE',
            entity_type='handover_sign',
            entity_id=handover.id,
            after={'role': role, 'status': handover.handover_status},
            request=request,
        )

        return handover

    @classmethod
    def get_handover_summary(cls):
        """Get handover KPIs overall and grouped by division."""
        total_completed = Handover.objects.filter(handover_status=HandoverStatus.HANDED_OVER).count()
        pending_count = Handover.objects.filter(handover_status=HandoverStatus.PENDING_HANDOVER).count()
        under_const_count = Handover.objects.filter(handover_status=HandoverStatus.UNDER_CONSTRUCTION).count()

        # By division breakdown
        divisions = Project.objects.values('division').distinct()
        by_division = {}

        for div in divisions:
            d_name = div['division']
            if not d_name:
                continue
            by_division[d_name] = {
                'completed': Handover.objects.filter(project__division=d_name, handover_status=HandoverStatus.HANDED_OVER).count(),
                'pending': Handover.objects.filter(project__division=d_name, handover_status=HandoverStatus.PENDING_HANDOVER).count(),
                'under_construction': Handover.objects.filter(project__division=d_name, handover_status=HandoverStatus.UNDER_CONSTRUCTION).count(),
            }

        return {
            'total_handovers_completed': total_completed,
            'pending_handover_count': pending_count,
            'under_construction_count': under_const_count,
            'by_division': by_division,
        }

    @classmethod
    def get_handover_records(cls, filters=None):
        """Retrieve table of handover records with filters."""
        filters = filters or {}
        qs = Project.objects.select_related('handover', 'assigned_engineer').all()

        division = filters.get('division')
        district = filters.get('district')
        status_val = filters.get('handover_status')

        if division:
            qs = qs.filter(division__iexact=division)
        if district:
            qs = qs.filter(district__iexact=district)
        if status_val:
            qs = qs.filter(handover__handover_status=status_val)

        records = []
        for proj in qs:
            h = getattr(proj, 'handover', None)
            h_status = h.handover_status if h else HandoverStatus.UNDER_CONSTRUCTION
            h_date = h.handover_date if h else None

            # Current phase from current_milestone_no
            curr_no = proj.current_milestone_no or 1
            if curr_no <= 4:
                stage = 'Foundation'
            elif curr_no <= 6:
                stage = 'Plinth'
            elif curr_no <= 9:
                stage = 'Roof'
            else:
                stage = 'Finishing'

            records.append({
                'case_id': proj.case_id,
                'owner_name': proj.owner_name,
                'owner_cnic_hash': proj.owner_cnic_hash,
                'location': f'{proj.tehsil}, {proj.district}, {proj.division}',
                'division': proj.division,
                'stage': stage,
                'handover_date': h_date,
                'handover_status': h_status,
            })

        return records
