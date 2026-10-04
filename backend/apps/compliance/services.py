from apps.common.enums import HSECheckAnswer
from apps.compliance.models import ESSCheck, HSECheck


class ComplianceService:
    @classmethod
    def calculate_hse_score(cls, visit_id):
        """Calculate HSE score and item breakdown for a visit."""
        checks = HSECheck.objects.filter(visit_id=visit_id)
        if not checks.exists():
            return {
                'score': None,
                'total_items': 0,
                'compliant_items': 0,
                'applicable_items': 0,
                'items': [],
            }

        total_items = checks.count()
        compliant_items = 0
        applicable_items = 0
        items = []

        for check in checks:
            ans = (check.answer or '').lower()
            is_na = ans in ('na', 'n/a')
            is_compliant = ans in ('yes', 'y')

            if not is_na:
                applicable_items += 1
                if is_compliant:
                    compliant_items += 1

            items.append({
                'item_key': check.item_key,
                'display_name': check.get_item_key_display(),
                'answer': check.answer,
                'is_compliant': is_compliant,
                'remarks': check.remarks,
                'photo_path': check.photo_path,
            })

        if applicable_items > 0:
            score = round((compliant_items / applicable_items) * 100.0, 2)
        else:
            score = 100.0

        return {
            'score': score,
            'total_items': total_items,
            'compliant_items': compliant_items,
            'applicable_items': applicable_items,
            'items': items,
        }

    @classmethod
    def calculate_ess_score(cls, visit_id):
        """Calculate ESS score and item breakdown for a visit."""
        ess_check = ESSCheck.objects.filter(visit_id=visit_id).first()
        if not ess_check:
            return {
                'score': None,
                'total_items': 4,
                'compliant_items': 0,
                'items': [],
            }

        fields_meta = [
            ('trees_requiring_permission', 'Trees requiring permission'),
            ('near_settlements', 'Proximity to settlements'),
            ('near_drainage_nullah', 'Proximity to drainage/nullah'),
            ('blocks_right_of_way', 'Blocks right of way'),
        ]

        compliant_items = 0
        items = []

        for field_name, display_name in fields_meta:
            val = getattr(ess_check, field_name)
            is_compliant = (val is False)
            if is_compliant:
                compliant_items += 1

            items.append({
                'field': field_name,
                'display_name': display_name,
                'value': val,
                'is_compliant': is_compliant,
                'remarks': ess_check.remarks,
                'photo_path': ess_check.photo_path,
            })

        score = round((compliant_items / 4.0) * 100.0, 2)

        return {
            'score': score,
            'total_items': 4,
            'compliant_items': compliant_items,
            'items': items,
        }

    @classmethod
    def get_project_scores(cls, project):
        """Get HSE and ESS scores for the project's latest visit."""
        latest_visit = project.visits.order_by('-created_at', '-visit_date').first()
        if not latest_visit:
            return {
                'hse': None,
                'ess': None,
                'visit_no': None,
                'visit_display': None,
                'visit_date': None,
                'has_checks': False,
            }

        hse_res = cls.calculate_hse_score(latest_visit.id)
        ess_res = cls.calculate_ess_score(latest_visit.id)

        return {
            'hse': hse_res,
            'ess': ess_res,
            'visit_no': latest_visit.visit_no,
            'visit_display': latest_visit.get_visit_no_display(),
            'visit_date': latest_visit.visit_date,
            'has_checks': True,
        }

    @classmethod
    def get_compliance_trend(cls, project):
        """Get compliance score trends across all visits for a project."""
        visits = project.visits.order_by('created_at', 'visit_date')
        trend = []

        for visit in visits:
            hse_res = cls.calculate_hse_score(visit.id)
            ess_res = cls.calculate_ess_score(visit.id)

            trend.append({
                'visit_no': visit.visit_no,
                'visit_display': visit.get_visit_no_display(),
                'visit_date': visit.visit_date,
                'hse_score': hse_res['score'],
                'ess_score': ess_res['score'],
            })

        return trend

    @classmethod
    def update_site_risk_flag(cls, project):
        """Check latest ESS check for project and set site_risk_flag accordingly."""
        latest_ess = ESSCheck.objects.filter(visit__project=project).order_by('-visit__created_at', '-visit__visit_date').first()

        if not latest_ess:
            project.site_risk_flag = False
            project.save(update_fields=['site_risk_flag', 'updated_at'])
            return {'site_risk_flag': False, 'reason': 'No ESS check recorded'}

        fields = [
            ('trees_requiring_permission', 'trees_requiring_permission'),
            ('near_settlements', 'near_settlements'),
            ('near_drainage_nullah', 'near_drainage_nullah'),
            ('blocks_right_of_way', 'blocks_right_of_way'),
        ]

        adverse_items = [display for field, display in fields if getattr(latest_ess, field) is True]

        if len(adverse_items) > 0:
            project.site_risk_flag = True
            reason = f"Adverse ESS check item(s): {', '.join(adverse_items)}"
        else:
            project.site_risk_flag = False
            reason = 'All ESS items favorable'

        project.save(update_fields=['site_risk_flag', 'updated_at'])
        return {'site_risk_flag': project.site_risk_flag, 'reason': reason}

    @classmethod
    def get_project_compliance_summary(cls, project):
        """Get overall compliance summary including statuses, risk flag, and latest scores."""
        scores = cls.get_project_scores(project)
        latest_visit_date = scores['visit_date'] if scores.get('has_checks') else None
        hse_score = scores['hse']['score'] if scores.get('hse') else None
        ess_score = scores['ess']['score'] if scores.get('ess') else None

        return {
            'plans_status': project.plans_status,
            'environment_status': project.environment_status,
            'quality_status': project.quality_status,
            'site_risk_flag': project.site_risk_flag,
            'hse_score': hse_score,
            'ess_score': ess_score,
            'latest_visit_date': latest_visit_date,
        }
