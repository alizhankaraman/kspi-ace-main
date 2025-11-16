import 'dart:convert';
import 'package:flutter/material.dart';
import '../api/api_service.dart';
import 'package:web_socket_channel/web_socket_channel.dart'; 

class ChatScreen extends StatefulWidget {
  final ApiService api;
  final int salesmanId;

  const ChatScreen({
    super.key,
    required this.api,
    required this.salesmanId,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  WebSocketChannel? channel;
  List messages = [];
  final TextEditingController controller = TextEditingController();
  late String roomId;

  @override
  void initState() {
    super.initState();
    initChat();
  }

  Future<void> initChat() async {
    print("Chat init started...");

    if (widget.api.loggedInUserId == null) {
      print("loggedInUserId null — loading tokens...");
      await widget.api.loadTokens();
    }

    final userId = widget.api.loggedInUserId;
    if (userId == null) {
      print("STILL NULL → cannot open websocket");
      return;
    }

    roomId = "user_${userId}_sales_${widget.salesmanId}";
    final url = "ws://192.168.10.10:8000/ws/chat/$roomId/";

    print("Connecting to WebSocket → $url");

    try {
      channel = WebSocketChannel.connect(
        Uri.parse("ws://192.168.10.10:8000/ws/chat/$roomId/"),
      );


      channel!.stream.listen((msg) {
      final data = json.decode(msg);

      // ignore duplicates of my own message
      if (data["sender"] == widget.api.loggedInUserId) {
        return;
      }

      setState(() {
        messages.add({
          "content": data["message"] ?? data["content"] ?? "",
          "sender": data["sender"],
        });
      });
    });

      await loadHistory();
    } catch (e) {
      print("WebSocket error: $e");
    }
  }

  Future<void> loadHistory() async {
    final history =
        await widget.api.getChatHistory(widget.salesmanId);

    setState(() {
      messages = history.map((m) => {
        "content": m["content"] ?? m["message"] ?? "",
        "sender": m["sender"],
      }).toList();
    });
  }

  void sendMessage() {
    final text = controller.text.trim();
    if (text.isEmpty) return;

    final sender = widget.api.loggedInUserId;
    if (sender == null) return;

    // Prepare normalized message
    final msg = {"content": text, "sender": sender};

    // Add to UI instantly
    setState(() => messages.add(msg));

    // Send via WebSocket
    channel?.sink.add(json.encode({
      "message": text,
      "sender": sender,
    }));

    // Save to backend
    widget.api.sendMessage(widget.salesmanId, text);

    controller.clear();
  }


  @override
  void dispose() {
    channel?.sink.close();
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Chat")),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: messages.length,
              itemBuilder: (_, i) {
                final m = messages[i];
                final isMe = m["sender"] == widget.api.loggedInUserId;

                return Align(
                  alignment: isMe
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color:
                          isMe ? Colors.blue[300] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(m["content"]),
                  ),
                );
              },
            ),
          ),

          // Message input field
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  decoration:
                      const InputDecoration(hintText: "Type a message..."),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.send),
                onPressed: sendMessage,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
