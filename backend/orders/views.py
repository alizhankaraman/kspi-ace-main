from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer
from products.models import Product

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'consumer':
            return Order.objects.filter(consumer=user)
        elif user.role in ['manager', 'sales']:
            if user.supplier:
                return Order.objects.filter(product__supplier=user.supplier)
            return Order.objects.none()
        elif user.role == 'owner':
            suppliers = user.owned_suppliers.all()
            return Order.objects.filter(product__supplier__in=suppliers)
        return Order.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        product_id = self.request.data.get('product')
        quantity_raw = int(self.request.data.get('quantity', 1))

        # Ensure only consumers can order
        if user.role != "consumer":
            raise PermissionError("Only consumers can place orders.")

        try:
            quantity = int(quantity_raw)
        except (TypeError, ValueError):
            raise ValueError(f"Invalid quantity value: {quantity_raw}")

        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise ValueError("Product not found.")

        # Check stock
        if product.stock < quantity:
            raise ValueError("Not enough stock available.")

        total_price = product.price * quantity
        order = serializer.save(consumer=user, product=product, quantity=quantity, total_price=total_price)

        product.stock -= quantity
        product.save()
        return order

class OrderUpdateStatusView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user

        # Only sales, manager, owner can change the status of the order.
        if user.role not in ['manager', 'owner']:
            return Response({"detail": "You don't have permission to change status."}, status=403)

        status = request.data.get("status")
        allowed_statuses = ["confirmed", "shipped", "delivered", "cancelled"]

        if status not in allowed_statuses:
            return Response({"detail": "Invalid status value."}, status=400)

        # If cancel → restore stock
        if status == "cancelled" and order.status != "cancelled":
            product = order.product
            product.stock += order.quantity
            product.save()

        order.status = status
        order.save()

        return Response({
            "message": f"Order #{order.id} status updated to '{status}'.",
            "order": OrderSerializer(order).data
        })