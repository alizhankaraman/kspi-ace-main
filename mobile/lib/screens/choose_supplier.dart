import 'package:flutter/material.dart';
import '../api/api_service.dart';
import 'chat_screen.dart';

class ChooseSupplierScreen extends StatelessWidget {
  final ApiService api;
  final List suppliers;

  const ChooseSupplierScreen({
    super.key,
    required this.api,
    required this.suppliers,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Choose Supplier")),
      body: ListView.builder(
        itemCount: suppliers.length,
        itemBuilder: (_, i) {
          final supplier = suppliers[i];
          return ListTile(
            title: Text(supplier["name"]),
            onTap: () async {
              final salesmanId =
                  await api.fetchSalesmanForSupplier(supplier["id"]);

              if (salesmanId != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        ChatScreen(api: api, salesmanId: salesmanId),
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("No salesman for this supplier")),
                );
              }
            },
          );
        },
      ),
    );
  }
}
