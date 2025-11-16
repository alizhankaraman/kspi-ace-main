from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChatMessage
from rest_framework.permissions import IsAuthenticated
from users.models import User
from .serializers import ChatMessageSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from chat.models import ChatMessage

class ChatHistoryView(APIView):
    def get(self, request, user_id):
        other_user_id = user_id
        messages = ChatMessage.objects.filter(
            sender__in=[request.user.id, other_user_id],
            receiver__in=[request.user.id, other_user_id]
        ).order_by("timestamp")

        return Response(ChatMessageSerializer(messages, many=True).data)

class SendMessageView(APIView):
    def post(self, request):
        sender = request.user
        receiver_id = request.data.get("receiver")
        content = request.data.get("content")

        if not receiver_id or not content:
            return Response({"error": "Invalid data"}, status=400)

        # Save in DB
        msg = ChatMessage.objects.create(
            sender=sender,
            receiver_id=receiver_id,
            content=content
        )

        # Broadcast to WebSocket
        channel_layer = get_channel_layer()

        room_id = f"user_{sender.id}_sales_{receiver_id}"
        reverse_room = f"user_{receiver_id}_sales_{sender.id}"

        async_to_sync(channel_layer.group_send)(
            room_id,
            {
                "type": "chat_message",
                "message": msg.content,
                "sender": msg.sender_id,
            }
        )

        # Also send to reverse chat room
        async_to_sync(channel_layer.group_send)(
            reverse_room,
            {
                "type": "chat_message",
                "message": msg.content,
                "sender": msg.sender_id,
            }
        )

        return Response(ChatMessageSerializer(msg).data, status=201)