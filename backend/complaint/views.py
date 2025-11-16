from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Complaint
from .serializers import ComplaintSerializer
from users.models import User


class ConsumerCreateComplaint(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ComplaintSerializer(data=request.data)

        if serializer.is_valid():
            complaint = serializer.save(consumer=request.user) 
            return Response(ComplaintSerializer(complaint).data, status=201)

        return Response(serializer.errors, status=400)


class SalesListComplaints(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "sales":
            return Response({"error": "Not a salesman"}, status=403)

        complaints = Complaint.objects.filter(status__in=["pending", "in_review"])
        return Response(ComplaintSerializer(complaints, many=True).data)


class SalesResolveComplaint(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, cid):
        if request.user.role != "sales":
            return Response({"error": "Only salesman can resolve"}, status=403)

        try:
            c = Complaint.objects.get(id=cid)
        except Complaint.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        c.status = "resolved"
        c.handler = request.user
        c.save()

        return Response(ComplaintSerializer(c).data)

class SalesEscalateComplaint(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, cid):
        if request.user.role != "sales":
            return Response({"error": "Only salesman can escalate"}, status=403)

        try:
            c = Complaint.objects.get(id=cid)
        except Complaint.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        c.status = "escalated"
        c.handler = request.user
        c.save()

        return Response(ComplaintSerializer(c).data)

class SalesActiveComplaints(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "sales":
            return Response({"error": "Not a salesman"}, status=403)

        qs = Complaint.objects.filter(status__in=["pending", "in_review"])
        return Response(ComplaintSerializer(qs, many=True).data)

class SalesAllComplaints(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "sales":
            return Response({"error": "Not a salesman"}, status=403)

        qs = Complaint.objects.filter(handler=request.user)
        return Response(ComplaintSerializer(qs, many=True).data)

class ManagerEscalatedComplaints(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["manager", "owner"]:
            return Response({"error": "Not allowed"}, status=403)

        qs = Complaint.objects.filter(status="escalated")
        return Response(ComplaintSerializer(qs, many=True).data)

class ManagerCloseComplaint(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, cid):
        if request.user.role not in ["manager", "owner"]:
            return Response({"error": "Only manager/owner can close complaints"}, status=403)

        try:
            c = Complaint.objects.get(id=cid)
        except Complaint.DoesNotExist:
            return Response({"error": "Complaint not found"}, status=404)

        # Only escalated complaints should be closable
        if c.status != "escalated":
            return Response({"error": "Only escalated complaints can be closed"}, status=400)

        c.status = "closed"
        c.handler = request.user
        c.save()

        return Response(ComplaintSerializer(c).data, status=200)

class ComplaintHistory(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Everyone sees only their relevant history
        user = request.user

        if user.role == "sales":
            qs = Complaint.objects.filter(status__in=["resolved", "closed"])
        elif user.role in ["manager", "owner"]:
            qs = Complaint.objects.all().exclude(status__in=["pending", "in_review"])
        else:
            # consumers only see their complaints
            qs = Complaint.objects.filter(consumer=user)

        qs = qs.order_by("-created_at")
        return Response(ComplaintSerializer(qs, many=True).data)
