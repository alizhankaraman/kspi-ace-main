import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/suppliers_screen.dart';
import 'api/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final api = ApiService();
  await api.loadTokens(); // Safe to call after binding init

  runApp(SupplierConsumerApp(api: api));
}

class SupplierConsumerApp extends StatelessWidget {
  final ApiService api;
  const SupplierConsumerApp({super.key, required this.api});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: api.loggedIn,
      builder: (context, isLoggedIn, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Supplier Consumer Platform',
          theme: ThemeData(
            primarySwatch: Colors.deepPurple,
            scaffoldBackgroundColor: Colors.white,
          ),
          home: isLoggedIn
              ? SuppliersScreen(api: api)
              : LoginScreen(api: api),
        );
      },
    );
  }
}
