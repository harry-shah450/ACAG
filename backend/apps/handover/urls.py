from django.urls import path

from apps.handover.views import (
    CertificateView,
    HandoverEligibilityView,
    HandoverRecordsView,
    HandoverSummaryView,
    ProjectHandoverView,
    SignHandoverView,
)

urlpatterns = [
    path('handover/summary/', HandoverSummaryView.as_view(), name='handover-summary'),
    path('handover/records/', HandoverRecordsView.as_view(), name='handover-records'),
    path('projects/<int:id>/handover/', ProjectHandoverView.as_view(), name='project-handover'),
    path('projects/<int:id>/handover/sign/', SignHandoverView.as_view(), name='project-handover-sign'),
    path('projects/<int:id>/handover/eligible/', HandoverEligibilityView.as_view(), name='project-handover-eligible'),
    path('projects/<int:id>/certificate/', CertificateView.as_view(), name='project-certificate'),
]
