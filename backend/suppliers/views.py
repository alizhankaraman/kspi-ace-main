from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Supplier, LinkRequest
from .serializers import SupplierSerializer, LinkRequestSerializer
from users.permissions import IsOwnerOrManager
import traceback
from users.models import User

from rest_framework import viewsets, permissions, generics
from .models import Supplier

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]

class DeactivateSupplierView(APIView):
    # Manager or owner can deactivate the supplier account
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def patch(self, request, supplier_id):
        try:
            supplier = Supplier.objects.get(id=supplier_id)
            supplier.is_active = False
            supplier.save()
            return Response({
                "message": f"Supplier '{supplier.name}' has been deactivated.",
                "supplier": SupplierSerializer(supplier).data
            }, status=status.HTTP_200_OK)
        except Supplier.DoesNotExist:
            return Response({"detail": "Supplier not found."}, status=status.HTTP_404_NOT_FOUND)
        
class ActivateSupplierView(APIView):
    # Activate the account, managers and owners only.
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def patch(self, request, supplier_id):
        try:
            supplier = Supplier.objects.get(id=supplier_id)
        except Supplier.DoesNotExist:
            return Response({"detail": "Supplier not found."}, status=status.HTTP_404_NOT_FOUND)

        supplier.is_active = True
        supplier.save()

        return Response({
            "message": f"Supplier '{supplier.name}' has been activated.",
            "supplier": SupplierSerializer(supplier).data
        }, status=status.HTTP_200_OK)
    
# Owner lists all employees from the supplier company.
class SupplierEmployeesView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def get(self, request, supplier_id=None):
        try:
            user = request.user

            supplier = None
            if supplier_id:
                supplier = Supplier.objects.filter(id=supplier_id).first()

            if not supplier:
                if user.role == "owner":
                    supplier = Supplier.objects.filter(owner=user).first()

                elif user.role in ["manager", "sales"]:
                    supplier = user.supplier

                else:
                    return Response({"detail": "Access denied."}, status=403)

            #if not supplier:
            #    return Response({"detail": "Supplier not found."}, status=404)

            employees = (
                User.objects.filter(supplier=supplier)
                .exclude(role="consumer")
                .values("id", "username", "email", "role", "is_active")
            )

            return Response({
                "supplier": supplier.name,
                "employees": list(employees)
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)

class MySupplierView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == "owner":
            supplier = Supplier.objects.filter(owner=user).first()

        elif user.role in ["manager", "sales"]:
            supplier = user.supplier

        else:
            return Response({"detail": "Not a supplier user."}, status=403)

        #if not supplier:
        #    return Response({"detail": "Supplier not found."}, status=404)

        return Response({
            "id": supplier.id,
            "name": supplier.name,
            "is_active": supplier.is_active,
            "owner": supplier.owner_id
        })
        
class EmployeeManageView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def patch(self, request, supplier_id, employee_id):
        try:
            supplier = Supplier.objects.get(id=supplier_id)
            employee = User.objects.get(id=employee_id, supplier=supplier)

            # Manager case, not enough rights.
            if request.user.role == 'manager' and employee.role in ['owner', 'manager']:
                return Response(
                    {"detail": "Managers cannot modify other managers or owners."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if request.user.role == 'sales':
                return Response(
                    {"detail": "Sales are not allowed to modify"},
                    status=status.HTTP_403_FORBIDDEN
                )

            if request.user.role == 'customer':
                return Response(
                    {"detail": "What are you doing here, sneaky guy?"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Status update.
            employee.is_active = not employee.is_active
            employee.save()

            status_str = "activated" if employee.is_active else "deactivated"

            return Response({
                "message": f"Employee '{employee.username}' has been {status_str}.",
                "employee": {
                    "id": employee.id,
                    "username": employee.username,
                    "role": employee.role,
                    "is_active": employee.is_active
                }
            })

        except Supplier.DoesNotExist:
            return Response({"detail": "Supplier not found."}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, supplier_id, employee_id):
        # Delete the employee, DANGEROUS PLACE
        try:
            supplier = Supplier.objects.get(id=supplier_id)
            employee = User.objects.get(id=employee_id, supplier=supplier)

            # If manager tries to delete (guy wants too much power)
            if request.user.role != 'owner':
                return Response(
                    {"detail": "Only owners have permission to delete!"},
                    status=status.HTTP_403_FORBIDDEN
                )

            username = employee.username
            employee.delete()

            return Response({
                "message": f"Employee '{username}' has been deleted successfully."
            }, status=status.HTTP_200_OK)

        except Supplier.DoesNotExist:
            return Response({"detail": "Supplier not found."}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)
        
class LinkRequestCreateView(generics.CreateAPIView):
    # Consumer >> request >> supplier.
    serializer_class = LinkRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'consumer':
            raise PermissionError("Only consumers can send link requests, you are not.")

        supplier_id = self.request.data.get('supplier')
        try:
            supplier = Supplier.objects.get(id=supplier_id)
        except Supplier.DoesNotExist:
            raise ValueError("Supplier not found.")

        serializer.save(consumer=user, supplier=supplier)

class LinkRequestListView(generics.ListAPIView):
    # get orders for manager and owner.
    serializer_class = LinkRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return LinkRequest.objects.filter(supplier__owner=user)
        elif user.role == 'manager':
            return LinkRequest.objects.filter(supplier__employees=user)
        elif user.role == 'consumer':
            return LinkRequest.objects.filter(consumer=user)
        return LinkRequest.objects.none()

class LinkRequestUpdateView(generics.UpdateAPIView):
    # reject or accept the link request.
    serializer_class = LinkRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = LinkRequest.objects.all()

    def patch(self, request, *args, **kwargs):
        link = self.get_object()
        user = request.user

        if user.role not in ['owner', 'manager']:
            return Response({"detail": "Permission denied."}, status=403)

        new_status = request.data.get('status')
        if new_status not in ['accepted', 'rejected', 'blocked']:
            return Response({"detail": "Invalid status."}, status=400)

        link.status = new_status
        link.save()
        return Response({
            "message": f"Link request has been {new_status}.",
            "link": LinkRequestSerializer(link).data
        })
