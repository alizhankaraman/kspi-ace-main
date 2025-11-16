import 'package:flutter/material.dart';
import '../api/api_service.dart';

class CartScreen extends StatelessWidget {
  final ApiService api;
  final List cart;

  const CartScreen({super.key, required this.api, required this.cart});

  double _safePrice(dynamic value) {
    print("Parsing price: $value (${value.runtimeType})");
    try {
      return double.parse(value.toString());
    } catch (_) {
      print("FAILED TO PARSE PRICE, RETURNING 0");
      return 0.0;
    }
  }

  @override
  Widget build(BuildContext context) {
    print("CARTSCREEN BUILD STARTED");

    // 🛡 STOP: Show empty cart immediately
    if (cart.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text("Your Cart")),
        body: const Center(
          child: Text(
            "Your cart is empty",
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }

    // 🛡 SAFE TOTAL CALCULATION
    double total = 0;
    for (var item in cart) {
      print("Cart item: $item");
      final price = _safePrice(item["product"]["price"]);
      final qty = item["quantity"] ?? 1;
      total += price * qty;
    }

    print("TOTAL = $total");

    return Scaffold(
      appBar: AppBar(title: const Text("Order Summary")),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: cart.length,
              itemBuilder: (context, i) {
                final item = cart[i];
                final product = item["product"];
                final price = _safePrice(product["price"]);
                final qty = item["quantity"];

                return ListTile(
                  title: Text(product["name"]),
                  subtitle: Text("Qty: $qty"),
                  trailing: Text("\$${price.toStringAsFixed(2)}"),
                );
              },
            ),
          ),
          Text(
            "Total: \$${total.toStringAsFixed(2)}",
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          ElevatedButton(
            child: const Text("Confirm Order"),
            onPressed: () async {
              for (var item in cart) {
                final id = item["product"]["id"];
                final qty = item["quantity"] ?? 1;
                await api.placeOrder(id, qty);
              }

              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Order placed!")),
              );

              Navigator.pop(context);
              Navigator.pop(context);
            },
          )
        ],
      ),
    );
  }
}
