from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from .permissions import IsOwner, IsOwnerOrManager
from .models import User
from suppliers.models import Supplier, LinkRequest
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

User = get_user_model()

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": request.user.id,
            "username": user.username,
            "email": user.email,
            "role": getattr(user, "role", None)
        }, status=200)

class ConsumerRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['role'] = 'consumer' 
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Consumer registered successfully, suii",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CreateManagerView(APIView):
    # Manager account creation endpoint, accessible only for owners
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request):
        data = request.data.copy()
        data["role"] = "manager" 
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_staff = True
            user.is_superuser = False
            user.supplier = request.user.supplier 
            user.save()
            return Response({
                "message": "Manager created successfully",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CreateSalesView(APIView):
    # Endpoint for creating a salesman account
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def post(self, request):
        data = request.data.copy()
        data["role"] = "sales"
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_staff = True
            user.is_superuser = False
            user.supplier = request.user.supplier 
            user.save()
            return Response({
                "message": "Sales account created successfully, suii",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeactivateUserView(APIView):
    # Owner -> delete managers, salesmans.
    # Manager -> delete salesmans.
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def patch(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Manager wants to delete higher than salesman 
        if request.user.role == 'manager' and target_user.role != 'sales':
            return Response({"detail": "Managers can only deactivate sales."}, status=status.HTTP_403_FORBIDDEN)

        target_user.is_active = False
        target_user.save()

        return Response({
            "message": f"User '{target_user.username}' has been deactivated.",
            "user": {
                "id": target_user.id,
                "username": target_user.username,
                "role": target_user.role,
                "is_active": target_user.is_active
            }
        }, status=status.HTTP_200_OK)

class GetSalesmanForSupplier(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, supplier_id):
        # Make sure the consumer is linked to this supplier
        is_linked = LinkRequest.objects.filter(
            consumer=request.user,
            supplier_id=supplier_id,
            status="accepted"
        ).exists()

        if not is_linked:
            return Response({"error": "Not linked to this supplier"}, status=403)

        salesman = User.objects.filter(
            role="sales",
            supplier_id=supplier_id
        ).first()

        if not salesman:
            return Response({"salesman_id": None, "message": "No sales managers"}, status=200)

        return Response({
            "salesman_id": salesman.id,
            "salesman_username": salesman.username
        })
    
class MySuppliersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        consumer = request.user

        links = LinkRequest.objects.filter(
            consumer=consumer,
            status="accepted"
        )

        suppliers = [
            {
                "id": link.supplier.id,
                "name": link.supplier.name,
            }
            for link in links
        ]

        return Response(suppliers)

class SupplierConsumersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Salesman must belong to a supplier
        if user.role != "sales" or not user.supplier:
            return Response({"error": "Not a salesman"}, status=403)

        supplier = user.supplier

        # Consumers with accepted link
        links = LinkRequest.objects.filter(
            supplier=supplier,
            status="accepted"
        )

        consumers = [
            {
                "id": link.consumer.id,
                "username": link.consumer.username,
            }
            for link in links
        ]

        return Response(consumers)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
