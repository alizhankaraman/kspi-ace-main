from django.urls import path
from .views import OrderListCreateView, OrderUpdateStatusView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/status/', OrderUpdateStatusView.as_view(), name='order-update-status'),
]
