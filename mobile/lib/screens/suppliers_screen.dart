import 'package:flutter/material.dart';
import '../api/api_service.dart';
import 'supplier_products_screen.dart';
import 'package:mobile/screens/login_screen.dart';
import 'create_complaint_screen.dart';

class SuppliersScreen extends StatefulWidget {
  final ApiService api;

  const SuppliersScreen({super.key, required this.api});

  @override
  State<SuppliersScreen> createState() => _SuppliersScreenState();
}

class _SuppliersScreenState extends State<SuppliersScreen> {
  List suppliers = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    loadSuppliers();
  }

  Future<void> loadSuppliers() async {
    try {
      final data = await widget.api.getMySuppliers();
      setState(() => suppliers = data);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to load suppliers: $e")),
      );
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(
        title: const Text("Your Suppliers"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await widget.api.logout();
            },
          ),
          IconButton(
            icon: Icon(Icons.report),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => CreateComplaintScreen(api: widget.api),
                ),
              );
            },
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: suppliers.length,
        itemBuilder: (context, i) {
          final s = suppliers[i];
          return ListTile(
            title: Text(s["name"]),
            subtitle: Text("Tap to view products"),
            trailing: const Icon(Icons.arrow_forward),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => SupplierProductsScreen(
                    api: widget.api,
                    supplierId: s["id"],
                    supplierName: s["name"],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
