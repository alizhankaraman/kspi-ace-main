from django.urls import path
from .views import (
    ConsumerCreateComplaint,
    SalesListComplaints,
    SalesResolveComplaint,
    SalesEscalateComplaint,
    ManagerEscalatedComplaints,
    ManagerCloseComplaint,
    ComplaintHistory,
)

urlpatterns = [
    path("create/", ConsumerCreateComplaint.as_view()),
    path("sales/list/", SalesListComplaints.as_view()),
    path("sales/<int:cid>/resolve/", SalesResolveComplaint.as_view()),
    path("sales/<int:cid>/escalate/", SalesEscalateComplaint.as_view()),
    path("manager/escalated/", ManagerEscalatedComplaints.as_view()),
    path("manager/close/<int:cid>/", ManagerCloseComplaint.as_view()),
    path("history/", ComplaintHistory.as_view()),
]
