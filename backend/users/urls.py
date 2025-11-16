from django.urls import path
from .views import (
    MyTokenObtainPairView,
    MeView,
    ConsumerRegisterView,
    CreateManagerView,
    CreateSalesView,
    DeactivateUserView,
    GetSalesmanForSupplier,
    MySuppliersView,
    SupplierConsumersView
)

urlpatterns = [
    # AUTH
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("register/consumer/", ConsumerRegisterView.as_view(), name="register_consumer"),

    # USER
    path("me/", MeView.as_view()),

    # MANAGEMENT
    path("create-manager/", CreateManagerView.as_view()),
    path("create-sales/", CreateSalesView.as_view()),
    path("<int:user_id>/deactivate/", DeactivateUserView.as_view()),

    # SUPPLIER LINKS
    path("my-suppliers/", MySuppliersView.as_view()),
    path("salesman/<int:supplier_id>/", GetSalesmanForSupplier.as_view()),
    path("supplier/consumers/", SupplierConsumersView.as_view()),
]
