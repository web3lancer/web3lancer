import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/signin_screen.dart';
import 'utils/theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Later you can add provider after fixing the dependencies
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // For now, hardcode these values without using Provider
    final bool isAuthenticated = false;
    final bool isLoading = false;

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Web3Lancer',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home:
          isLoading
              ? _buildLoadingScreen()
              : isAuthenticated
              ? const HomeScreen()
              : SignInScreen(),
      routes: {
        '/home': (context) => const HomeScreen(),
        '/signin': (context) => SignInScreen(),
        '/signup': (context) => SignUpScreen(),
      },
    );
  }

  Widget _buildLoadingScreen() {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Image.asset('assets/web3lancer.jpg', width: 100, height: 100),
            SizedBox(height: 24),
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading Web3Lancer...'),
          ],
        ),
      ),
    );
  }
}
