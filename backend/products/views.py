from rest_framework import generics, permissions
from .models import Product
from .serializers import ProductSerializer
from users.permissions import IsOwnerOrManager, IsOwnerManagerOrReadOnly
from suppliers.models import LinkRequest
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Consumer can only see accepted request supplier products.
        if user.role == "consumer":
            accepted_suppliers = LinkRequest.objects.filter(
                consumer=user,
                status="accepted"
            ).values_list("supplier_id", flat=True)
            return Product.objects.filter(supplier_id__in=accepted_suppliers, is_available=True)

        # owner's products.
        elif user.role == "owner":
            return Product.objects.filter(supplier__owner=user)

        # Manager, sales products.
        elif user.role in ["manager", "sales"]:
            return Product.objects.filter(supplier=user.supplier)

        # none
        return Product.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if hasattr(user, "supplier") and user.supplier:
            supplier = user.supplier  # For managers and sales
        elif hasattr(user, "owned_suppliers"):
            supplier = user.owned_suppliers.first()  # for owners
        else:
            raise ValueError("The user doesn't have this supplier")

        if not supplier:
            raise ValueError("Supplier hasn't found.")

        serializer.save(supplier=supplier)



class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/products/<id>/     — get    the product
    PATCH /api/products/<id>/   — update the product
    DELETE /api/products/<id>/  — delete the product
    """
    serializer_class = ProductSerializer
    permission_classes = [IsOwnerManagerOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "role", None) == "owner":
            return Product.objects.filter(supplier__owner=user)

        elif getattr(user, "role", None) in ["manager", "sales"]:
            return Product.objects.filter(supplier=user.supplier)

        elif getattr(user, "role", None) == "consumer":
            accepted_supplier_ids = LinkRequest.objects.filter(
                consumer=user, status="accepted"
            ).values_list("supplier_id", flat=True)
            return Product.objects.filter(supplier_id__in=accepted_supplier_ids)

        return Product.objects.none()

    def partial_update(self, request, *args, **kwargs):
        product = self.get_object()
        user = request.user

        if user.role == "manager":
            allowed_fields = {"price", "stock"}
            update_data = {field: value for field, value in request.data.items() if field in allowed_fields}
            for field, value in update_data.items():
                setattr(product, field, value)
            product.save()
            return Response({"message": "Product updated by manager", "data": ProductSerializer(product).data}, status=status.HTTP_200_OK)

        elif user.role == "owner":
            return super().partial_update(request, *args, **kwargs)

        return Response({"detail": "You don't have permission to edit this product."}, status=status.HTTP_403_FORBIDDEN)

class ProductsBySupplierView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, supplier_id):
        products = Product.objects.filter(supplier_id=supplier_id)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)