from django.urls import path

from apps.reports.views import (
    DistrictExcelView,
    DPRView,
    GenerateReportView,
    HandoverReportView,
    ReportListView,
)

urlpatterns = [
    path('reports/dpr/', DPRView.as_view(), name='reports-dpr'),
    path('reports/district-excel/', DistrictExcelView.as_view(), name='reports-district-excel'),
    path('reports/', ReportListView.as_view(), name='reports-list'),
    path('reports/generate/', GenerateReportView.as_view(), name='reports-generate'),
    path('reports/handover/', HandoverReportView.as_view(), name='reports-handover'),
]
