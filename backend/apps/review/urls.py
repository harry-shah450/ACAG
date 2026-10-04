from django.urls import path

from apps.review.views import (
    AIAnalyzePhotoView,
    AIBatchAnalyzeView,
    ReviewDetailView,
    ReviewEligibilityView,
    ReviewHistoryView,
    ReviewQueueView,
    SubmitReviewView,
)

urlpatterns = [
    path('review/queue/', ReviewQueueView.as_view(), name='review-queue'),
    path('review/<int:projectId>/<int:milestoneNo>/', ReviewDetailView.as_view(), name='review-detail-submit'),
    path('review/<int:projectId>/<int:milestoneNo>/submit/', SubmitReviewView.as_view(), name='review-submit'),
    path('review/projects/<int:id>/history/', ReviewHistoryView.as_view(), name='review-history'),
    path('review/<int:projectId>/<int:milestoneNo>/eligible/', ReviewEligibilityView.as_view(), name='review-eligible'),
    path('ai/analyze-photo/', AIAnalyzePhotoView.as_view(), name='ai-analyze-photo'),
    path('ai/batch-analyze/', AIBatchAnalyzeView.as_view(), name='ai-batch-analyze'),
]
