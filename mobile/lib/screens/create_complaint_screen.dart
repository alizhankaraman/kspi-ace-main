import 'package:flutter/material.dart';
import '../api/api_service.dart';

class CreateComplaintScreen extends StatefulWidget {
  final ApiService api;
  const CreateComplaintScreen({super.key, required this.api});

  @override
  State<CreateComplaintScreen> createState() => _CreateComplaintScreenState();
}

class _CreateComplaintScreenState extends State<CreateComplaintScreen> {
  final subjectCtrl = TextEditingController();
  final messageCtrl = TextEditingController();
  bool loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Create Complaint")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(controller: subjectCtrl, decoration: const InputDecoration(labelText: "Subject")),
            TextField(controller: messageCtrl, maxLines: 4, decoration: const InputDecoration(labelText: "Message")),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : submit,
              child: Text(loading ? "Submitting..." : "Submit Complaint"),
            )
          ],
        ),
      ),
    );
  }

  Future<void> submit() async {
    setState(() => loading = true);

    try {
      await widget.api.createComplaint(
        subjectCtrl.text.trim(),
        messageCtrl.text.trim(),
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Complaint submitted")),
      );

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }

    setState(() => loading = false);
  }
}
