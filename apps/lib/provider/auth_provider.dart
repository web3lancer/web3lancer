import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  User? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isAuthenticated = false;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;

  AuthProvider() {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId');

      if (userId != null) {
        // Try to get current session
        final accountDetails = await _apiService.getCurrentSession();
        if (accountDetails != null) {
          _isAuthenticated = true;
          _currentUser = await _apiService.getUserProfile(userId);
        } else {
          _clearAuthData();
        }
      }
    } catch (e) {
      _errorMessage = e.toString();
      _clearAuthData();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signIn(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _apiService.signIn(email, password);
      _currentUser = user;
      _isAuthenticated = true;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('userId', user.id);
    } catch (e) {
      _errorMessage = 'Login failed: ${e.toString()}';
      _isAuthenticated = false;
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signUp(String name, String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _apiService.signUp(name, email, password);
      _currentUser = user;
      _isAuthenticated = true;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('userId', user.id);
    } catch (e) {
      _errorMessage = 'Registration failed: ${e.toString()}';
      _isAuthenticated = false;
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.signOut();
      _clearAuthData();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _clearAuthData() async {
    _currentUser = null;
    _isAuthenticated = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userId');
  }

  Future<void> connectWallet(
    String address,
    String blockchainType,
    String signature,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final wallet = await _apiService.verifyWalletSignature(
        address,
        blockchainType,
        signature,
      );
      if (_currentUser != null) {
        List<UserWallet> updatedWallets = List.from(_currentUser!.wallets);

        // Check if wallet already exists
        final existingIndex = updatedWallets.indexWhere(
          (w) => w.address == address && w.blockchainType == blockchainType,
        );

        if (existingIndex >= 0) {
          updatedWallets[existingIndex] = wallet;
        } else {
          updatedWallets.add(wallet);
        }

        // Update current user with new wallet
        _currentUser = User(
          id: _currentUser!.id,
          name: _currentUser!.name,
          email: _currentUser!.email,
          profileImageUrl: _currentUser!.profileImageUrl,
          bio: _currentUser!.bio,
          skills: _currentUser!.skills,
          wallets: updatedWallets,
          reviews: _currentUser!.reviews,
          completedProjects: _currentUser!.completedProjects,
          ongoingProjects: _currentUser!.ongoingProjects,
          reputation: _currentUser!.reputation,
          averageRating: _currentUser!.averageRating,
          createdAt: _currentUser!.createdAt,
          lastActive: _currentUser!.lastActive,
          isOnline: _currentUser!.isOnline,
          isVerified: _currentUser!.isVerified,
          kycVerified: _currentUser!.kycVerified,
        );
      }
    } catch (e) {
      _errorMessage = 'Failed to connect wallet: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
