from django.urls import path
from .views import ChatHistoryView, SendMessageView

urlpatterns = [
    path("history/<int:user_id>/", ChatHistoryView.as_view()),
    path("send/", SendMessageView.as_view()),
]
