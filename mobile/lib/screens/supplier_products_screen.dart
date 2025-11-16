import 'package:flutter/material.dart';
import '../api/api_service.dart';
import 'cart_screen.dart';
import 'chat_screen.dart';

class SupplierProductsScreen extends StatefulWidget {
  final ApiService api;
  final int supplierId;
  final String supplierName;

  const SupplierProductsScreen({
    super.key,
    required this.api,
    required this.supplierId,
    required this.supplierName,
  });

  @override
  State<SupplierProductsScreen> createState() => _SupplierProductsScreenState();
}

class _SupplierProductsScreenState extends State<SupplierProductsScreen> {
  List products = [];
  List cart = [];
  bool loading = true;
  String searchQuery = "";
  Map<int, int> quantities = {};

  @override
  void initState() {
    super.initState();
    loadProducts();
  }

  Future<void> loadProducts() async {
    print("👉 SupplierProductsScreen opened");
    print("👉 Loading products for supplier ID: ${widget.supplierId}");

    try {
      final data = await widget.api.getProductsBySupplier(widget.supplierId);

      print("✅ Products loaded:");
      print(data);

      setState(() {
        products = data;
        loading = false;

        for (var p in data) {
          quantities[p["id"]] = 1;
        }
      });

    } catch (e, stack) {
      print("❌ Failed loading supplier products: $e");
      print(stack);

      setState(() => loading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error loading products: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.supplierName)),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final filtered = products.where((p) {
      return p["name"].toLowerCase().contains(searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.supplierName),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            onPressed: () async {
              // Get this supplier's salesman
              final salesmanId = await widget.api.fetchSalesmanForSupplier(widget.supplierId);

              if (salesmanId == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("No salesman assigned to this supplier")),
                );
                return;
              }

              // Navigate to chat
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ChatScreen(
                    api: widget.api,
                    salesmanId: salesmanId,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(10),
            child: TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: "Search products...",
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() => searchQuery = value);
              },
            ),
          ),

          Expanded(
            child: ListView.builder(
              itemCount: filtered.length,
              itemBuilder: (context, i) {
                final p = filtered[i];
                final qty = quantities[p["id"]] ?? 1;

                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p["name"], 
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)
                        ),
                        Text("\$${p["price"]} — Stock: ${p["stock"]}"),
                        const SizedBox(height: 10),

                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove),
                              onPressed: () {
                                if (qty > 1) {
                                  setState(() => quantities[p["id"]] = qty - 1);
                                }
                              },
                            ),
                            Text("$qty"),
                            IconButton(
                              icon: const Icon(Icons.add),
                              onPressed: () {
                                setState(() => quantities[p["id"]] = qty + 1);
                              },
                            ),
                            const Spacer(),
                            ElevatedButton(
                              onPressed: () {
                                cart.add({
                                  "product": Map<String, dynamic>.from(p),
                                  "quantity": qty,
                                });
                              },
                              child: const Text("Add to Cart"),
                            )
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          ElevatedButton(
            child: const Text("Proceed to Buy"),
            onPressed: () {
              if (cart.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Your cart is empty")),
                );
                return;
              }

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => CartScreen(api: widget.api, cart: cart),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
