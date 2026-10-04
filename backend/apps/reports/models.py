from django.conf import settings
from django.db import models

from apps.common.enums import ReportScope


class Report(models.Model):
    REPORT_TYPES = (
        ('DPR', 'Daily Progress Report'),
        ('DISTRICT_EXCEL', 'District Excel Export'),
        ('HANDOVER_SUMMARY', 'Handover Summary Report'),
    )

    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    scope = models.CharField(
        max_length=20,
        choices=ReportScope.choices,
        default=ReportScope.ALL,
    )
    scope_value = models.CharField(max_length=100, blank=True, null=True)
    period_from = models.DateField(null=True, blank=True)
    period_to = models.DateField(null=True, blank=True)
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_reports',
    )
    file_path = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_report_type_display()} ({self.scope}) - {self.created_at.strftime("%Y-%m-%d")}'
