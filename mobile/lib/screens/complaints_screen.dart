import 'package:flutter/material.dart';
import '../api/api_service.dart';

class ComplaintsScreen extends StatefulWidget {
  final ApiService api;
  const ComplaintsScreen({super.key, required this.api});

  @override
  State<ComplaintsScreen> createState() => _ComplaintsScreenState();
}

class _ComplaintsScreenState extends State<ComplaintsScreen> {
  List complaints = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    complaints = await widget.api.getComplaintsForSales();
    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(title: const Text("Complaints")),
      body: ListView.builder(
        itemCount: complaints.length,
        itemBuilder: (_, i) {
          final c = complaints[i];
          return Card(
            child: ListTile(
              title: Text(c["subject"]),
              subtitle: Text(c["message"]),
              trailing: PopupMenuButton(
                itemBuilder: (_) => [
                  const PopupMenuItem(value: "resolve", child: Text("Resolve")),
                  const PopupMenuItem(value: "escalate", child: Text("Escalate")),
                ],
                onSelected: (value) async {
                  if (value == "resolve") {
                    await widget.api.resolveComplaint(c["id"]);
                  } else {
                    await widget.api.escalateComplaint(c["id"]);
                  }
                  load(); // Refresh
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
