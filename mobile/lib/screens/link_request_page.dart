import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class LinkRequestPage extends StatefulWidget {
  final String token;

  const LinkRequestPage({Key? key, required this.token}) : super(key: key);

  @override
  _LinkRequestPageState createState() => _LinkRequestPageState();
}

class _LinkRequestPageState extends State<LinkRequestPage> {
  List suppliers = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    fetchSuppliers();
  }

  Future<void> fetchSuppliers() async {
    final url = Uri.parse("http://10.0.2.2:8000/api/suppliers/"); 
    final res = await http.get(url, headers: {
      'Authorization': 'Bearer ${widget.token}',
    });

    if (res.statusCode == 200) {
      setState(() {
        suppliers = json.decode(res.body);
        loading = false;
      });
    } else {
      setState(() {
        loading = false;
      });
      debugPrint("Failed to load suppliers: ${res.statusCode}");
    }
  }

  Future<void> sendLinkRequest(int supplierId) async {
    final url = Uri.parse("http://10.0.2.2:8000/api/suppliers/links/create/");
    final res = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
      body: json.encode({'supplier': supplierId}),
    );

    if (res.statusCode == 201 || res.statusCode == 200) {
      final data = json.decode(res.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("✅ Request sent to ${data['link']['supplier_name']}")),
      );
    } else {
      debugPrint("Error sending link request: ${res.body}");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("❌ Failed to send request")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Link to Supplier")),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: suppliers.length,
              itemBuilder: (context, index) {
                final supplier = suppliers[index];
                return ListTile(
                  title: Text(supplier['name']),
                  subtitle: Text(supplier['is_active'] ? '🟢 Active' : '🔴 Inactive'),
                  trailing: ElevatedButton(
                    onPressed: supplier['is_active']
                        ? () => sendLinkRequest(supplier['id'])
                        : null,
                    child: Text("Send Request"),
                  ),
                );
              },
            ),
    );
  }
}
