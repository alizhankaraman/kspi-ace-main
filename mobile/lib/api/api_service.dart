import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';

class ApiService {
  static const String baseUrl = "http://192.168.10.10:8000/api";

  String? accessToken;
  String? refreshToken;
  int? loggedInUserId;
  int? salesmanId;

  // Global login state
  final ValueNotifier<bool> loggedIn = ValueNotifier<bool>(false);

  Map<String, String> get headers => {
        "Content-Type": "application/json",
        if (accessToken != null) "Authorization": "Bearer $accessToken",
      };

  // ---------------- LOGIN ----------------
  Future<bool> login(String username, String password) async {
    final url = Uri.parse("$baseUrl/auth/token/");
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: json.encode({
        "username": username,
        "password": password,
      }),
    );

    print("RAW LOGIN RESPONSE:");
    print(response.body);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);

      accessToken = data["access"];
      refreshToken = data["refresh"];
      //loggedInUserId = int.tryParse(data["user_id"] ?? "");

      // print("Parsed user_id → $loggedInUserId");

      final rawUserId = data["user_id"];

      if (rawUserId is int) {
        loggedInUserId = rawUserId;
      } else if (rawUserId is String) {
        loggedInUserId = int.tryParse(rawUserId);
      } else {
        loggedInUserId = null;
      }

      print("Parsed user_id → $loggedInUserId");

      if (loggedInUserId == null) {
        print("❌ ERROR: user_id missing in login response");
        return false;
      }


      final prefs = await SharedPreferences.getInstance();
      await prefs.setString("accessToken", accessToken!);
      await prefs.setString("refreshToken", refreshToken!);
      await prefs.setInt("loggedInUserId", loggedInUserId!);

      loggedIn.value = true;
      return true;
    }

    print("❌ Login failed: ${response.body}");
    return false;
  }

  // ---------------- LOAD TOKENS ----------------
  Future<void> loadTokens() async {
    final prefs = await SharedPreferences.getInstance();

    accessToken = prefs.getString("accessToken");
    refreshToken = prefs.getString("refreshToken");
    loggedInUserId = prefs.getInt("loggedInUserId");

    print("Loaded access token: $accessToken");
    print("Loaded userId: $loggedInUserId");

    loggedIn.value = accessToken != null && loggedInUserId != null;
  }



  // ---------------- LOGOUT ----------------
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    accessToken = null;
    refreshToken = null;
    loggedInUserId = null;

    loggedIn.value = false;

    print("🔒 Logged out");
  }

  // ---------------- SUPPLIERS ----------------
  Future<List<dynamic>> getMySuppliers() async {
    final res = await http.get(
      Uri.parse("$baseUrl/users/my-suppliers/"),
      headers: headers,
    );
    if (res.statusCode == 200) return json.decode(res.body);
    throw Exception("Failed suppliers");
  }

  Future<bool> sendLinkRequest(int supplierId) async {
    final res = await http.post(
      Uri.parse("$baseUrl/suppliers/links/create/"),
      headers: headers,
      body: json.encode({"supplier": supplierId}),
    );
    return res.statusCode == 200 || res.statusCode == 201;
  }

  // ---------------- SALESMAN ----------------
  Future<int?> fetchSalesmanForSupplier(int supplierId) async {
    final res = await http.get(
      Uri.parse("$baseUrl/users/salesman/$supplierId/"),
      headers: headers,
    );
    if (res.statusCode == 200) {
      return json.decode(res.body)["salesman_id"];
    }
    return null;
  }

  // ---------------- PRODUCTS ----------------
  Future<List<dynamic>> getProductsBySupplier(int supplierId) async {
    final res = await http.get(
      Uri.parse("$baseUrl/products/by-supplier/$supplierId/"),
      headers: headers,
    );

    if (res.statusCode == 200) return json.decode(res.body);
    throw Exception("Failed to load supplier products");
  }

  Future<void> placeOrder(int productId, int qty) async {
    final res = await http.post(
      Uri.parse("$baseUrl/orders/"),
      headers: headers,
      body: json.encode({"product": productId, "quantity": qty}),
    );

    if (res.statusCode != 200 && res.statusCode != 201) {
      throw Exception("Order failed: ${res.body}");
    }
  }

  // ---------------- CHAT ----------------
  Future<List<dynamic>> getChatHistory(int otherUserId) async {
    final res = await http.get(
      Uri.parse("$baseUrl/chat/history/$otherUserId/"),
      headers: headers,
    );

    if (res.statusCode == 200) return json.decode(res.body);
    throw Exception("Failed chat history");
  }

  Future<void> sendMessage(int receiverId, String content) async {
    final res = await http.post(
      Uri.parse("$baseUrl/chat/send/"),
      headers: headers,
      body: json.encode({"receiver": receiverId, "content": content}),
    );

    if (res.statusCode != 200 && res.statusCode != 201) {
      print("❌ Failed to send message: ${res.body} (status: ${res.statusCode})");
      throw Exception("Failed to send message");
    }

    print("✅ Message sent successfully: ${res.body}");
  }

  // ---------------- COMPLAINTS ----------------

  Future<void> createComplaint(String subject, String message) async {
    final res = await http.post(
      Uri.parse("$baseUrl/complaints/create/"),
      headers: headers,
      body: json.encode({
        "subject": subject,
        "message": message,
      }),
    );

    if (res.statusCode != 201) {
      throw Exception("Failed to create complaint: ${res.body}");
    }
  }

  Future<List<dynamic>> getComplaintsForSales() async {
    final res = await http.get(
      Uri.parse("$baseUrl/complaints/sales/list/"),
      headers: headers,
    );
    if (res.statusCode == 200) return json.decode(res.body);
    throw Exception("Failed to load complaints");
  }

  Future<void> resolveComplaint(int id) async {
    await http.post(
      Uri.parse("$baseUrl/complaints/sales/$id/resolve/"),
      headers: headers,
    );
  }

  Future<void> escalateComplaint(int id) async {
    await http.post(
      Uri.parse("$baseUrl/complaints/sales/$id/escalate/"),
      headers: headers,
    );
  }

}
