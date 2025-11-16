from django.urls import path
from .views import ProductListCreateView, ProductDetailView, ProductsBySupplierView

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product_list_create'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path("by-supplier/<int:supplier_id>/", ProductsBySupplierView.as_view()),
]
