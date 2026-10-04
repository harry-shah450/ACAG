from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.compliance.models import ESSCheck
from apps.compliance.services import ComplianceService


@receiver(post_save, sender=ESSCheck)
@receiver(post_delete, sender=ESSCheck)
def update_project_site_risk_flag(sender, instance, **kwargs):
    if instance and instance.visit and instance.visit.project:
        ComplianceService.update_site_risk_flag(instance.visit.project)
