import 'package:flutter/material.dart';
import '../api/api_service.dart';
import 'link_request_screen.dart';
import 'login_screen.dart';
import 'chat_screen.dart';
import 'choose_supplier.dart';

class ProductsScreen extends StatefulWidget {
  final ApiService api;

  const ProductsScreen({super.key, required this.api});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  List products = [];
  bool loading = true;
  Map<int, int> quantities = {};

  ApiService get api => widget.api;

  @override
  void initState() {
    super.initState();
    loadProducts();
  }

  Future<void> loadProducts() async {
    try {
      final data = await api.getProducts();
      setState(() => products = data);
      for (var p in data) {
        quantities[p["id"]] = 1;
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to load products: $e")),
      );
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> orderProduct(int productId, int quantity) async {
    try {
      await api.placeOrder(productId, quantity);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("✅ Order placed!")),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Order failed: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(
        title: const Text("Products"),
        actions: [
          IconButton(
            icon: const Icon(Icons.link),
            tooltip: "Link Supplier",
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => LinkRequestScreen(api: api),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: "Logout",
            onPressed: () async {
              await api.logout();  // Clear tokens
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (_) => LoginScreen(api: api),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.chat),
            onPressed: () async {
              final suppliers = await api.getMySuppliers();

              if (suppliers.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("No linked suppliers")),
                );
                return;
              }

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      ChooseSupplierScreen(api: api, suppliers: suppliers),
                ),
              );
            }
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, i) {
          final p = products[i]; 
          final qty = quantities[p["id"]] ?? 1;
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p["name"], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text("\$${p["price"]} — Stock: ${p["stock"]}"),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          if (qty > 1) {
                            setState(() => quantities[p["id"]] = qty - 1);
                          }
                        },
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                      Text("$qty", style: const TextStyle(fontSize: 16)),
                      IconButton(
                        onPressed: () {
                          if (qty < (p["stock"] ?? 1)) {
                            setState(() => quantities[p["id"]] = qty + 1);
                          }
                        },
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                      const Spacer(),

                      ElevatedButton(
                        onPressed: () => orderProduct(p["id"], qty),
                        child: const Text("Order"),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
          return ListTile(
            title: Text(p["name"]),
            subtitle: Text("\$${p["price"]} — Stock: ${p["stock"]}"),
            trailing: ElevatedButton(
              onPressed: () => orderProduct(p["id"], qty),
              child: const Text("Order"),
            ),
          );
        },
      ),
    );
  }
}
