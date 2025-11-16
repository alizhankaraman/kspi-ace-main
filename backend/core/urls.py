from django.contrib import admin
from django.urls import path, include

# Custom JWT view from users app
from users.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT (custom token view must be here, not inside users/)
    path('api/auth/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Users (ONLY ONCE — DO NOT DUPLICATE)
    path("api/users/", include("users.urls")),

    # Suppliers
    path('api/suppliers/', include('suppliers.urls')),

    # Products
    path('api/products/', include('products.urls')),

    # Orders
    path('api/orders/', include('orders.urls')),

    # Chat
    path("api/chat/", include("chat.urls")),

    # Complaints
    path("api/complaints/", include("complaint.urls")),
]
