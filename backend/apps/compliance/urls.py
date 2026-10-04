from django.urls import path

from apps.compliance.views import (
    ProjectComplianceScoresView,
    ProjectComplianceSummaryView,
    ProjectComplianceTrendView,
    ProjectESSChecksView,
    ProjectHSEChecksView,
    SiteRiskRegisterView,
    UpdateComplianceStatusView,
)

urlpatterns = [
    path('compliance/projects/<int:id>/scores/', ProjectComplianceScoresView.as_view(), name='compliance-scores'),
    path('compliance/projects/<int:id>/hse/', ProjectHSEChecksView.as_view(), name='compliance-hse'),
    path('compliance/projects/<int:id>/ess/', ProjectESSChecksView.as_view(), name='compliance-ess'),
    path('compliance/projects/<int:id>/summary/', ProjectComplianceSummaryView.as_view(), name='compliance-summary'),
    path('compliance/projects/<int:id>/trend/', ProjectComplianceTrendView.as_view(), name='compliance-trend'),
    path('compliance/projects/<int:id>/status/', UpdateComplianceStatusView.as_view(), name='compliance-status'),
    path('compliance/site-risk/', SiteRiskRegisterView.as_view(), name='compliance-site-risk'),
]
