from django.conf import settings
from django.db import models

from apps.common.enums import HandoverStatus


class Handover(models.Model):
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='handover',
    )
    handover_status = models.CharField(
        max_length=30,
        choices=HandoverStatus.choices,
        default=HandoverStatus.UNDER_CONSTRUCTION,
    )
    handover_date = models.DateTimeField(null=True, blank=True)
    occupant_count = models.IntegerField(null=True, blank=True)
    occupant_details = models.JSONField(default=dict, blank=True)
    electricity_connected = models.BooleanField(default=False)
    gas_connected = models.BooleanField(default=False)
    drainage_connected = models.BooleanField(default=False)
    water_supply_connected = models.BooleanField(default=False)

    beneficiary_signed_at = models.DateTimeField(null=True, blank=True)
    beneficiary_signed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='beneficiary_signatures',
    )
    engineer_signed_at = models.DateTimeField(null=True, blank=True)
    engineer_signed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='engineer_signatures',
    )

    certificate_path = models.CharField(max_length=500, blank=True)
    certificate_generated_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'Handover ({self.handover_status}) for Project {self.project.case_id}'
