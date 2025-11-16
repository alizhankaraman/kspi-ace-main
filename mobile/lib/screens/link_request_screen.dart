import 'package:flutter/material.dart';
import '../api/api_service.dart';

class LinkRequestScreen extends StatefulWidget {
  final ApiService api;

  const LinkRequestScreen({super.key, required this.api});

  @override
  State<LinkRequestScreen> createState() => _LinkRequestScreenState();
}

class _LinkRequestScreenState extends State<LinkRequestScreen> {
  List suppliers = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    loadSuppliers();
  }

  Future<void> loadSuppliers() async {
    try {
      final data = await widget.api.getSuppliers();
      setState(() {
        suppliers = data;
        loading = false;
      });
    } catch (e) {
      debugPrint("Error loading suppliers: $e");
      setState(() => loading = false);
    }
  }

  Future<void> sendRequest(int supplierId) async {
    final success = await widget.api.sendLinkRequest(supplierId);
    final snackBar = SnackBar(
      content: Text(success
          ? "✅ Request sent successfully!"
          : "❌ Failed to send request."),
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Link to Supplier")),
      body: loading
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            itemCount: suppliers.length,
            itemBuilder: (context, index) {
              final s = suppliers[index];
              return ListTile(
                title: Text(s['name']),
                subtitle: Text(
                  s['is_active'] ? "🟢 Active" : "🔴 Inactive",
                ),
                trailing: ElevatedButton(
                  onPressed: s['is_active']
                      ? () => sendRequest(s['id'])
                      : null,
                  child: const Text("Send Request"),
                ),
              );
            },
          ),
    );
  }
}
