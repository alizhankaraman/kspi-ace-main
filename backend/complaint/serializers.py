from rest_framework import serializers
from .models import Complaint
from users.models import User

class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]

class ComplaintSerializer(serializers.ModelSerializer):
    consumer = UserShortSerializer(read_only=True)
    handler = UserShortSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "subject",
            "message",
            "status",
            "created_at",
            "consumer",
            "handler",
        ]
