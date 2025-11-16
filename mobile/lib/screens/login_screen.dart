import 'package:flutter/material.dart';
import '../api/api_service.dart';
import 'suppliers_screen.dart';

class LoginScreen extends StatefulWidget {
  final ApiService api;
  const LoginScreen({super.key, required this.api});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final usernameCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();
  bool loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextField(controller: usernameCtrl, decoration: const InputDecoration(hintText: "Username")),
              TextField(controller: passwordCtrl, obscureText: true, decoration: const InputDecoration(hintText: "Password")),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: loading ? null : login,
                child: Text(loading ? "Loading..." : "Login"),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> login() async {
    setState(() => loading = true);

    final success = await widget.api.login(
      usernameCtrl.text.trim(),
      passwordCtrl.text.trim(),
    );

    setState(() => loading = false);

    if (success) {
      print("🌟 LOGIN SUCCESS, loggedIn=${widget.api.loggedIn.value}");
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Login failed")),
      );
    }
  }
}
