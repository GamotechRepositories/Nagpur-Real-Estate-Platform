import 'package:flutter/material.dart';
import '../core/network/api_client.dart';
import '../core/storage/local_storage.dart';
import '../models/user_model.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  final Set<String> _savedPropertyIds = {};

  UserModel? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;
  bool get isLoading => _isLoading;
  Set<String> get savedPropertyIds => _savedPropertyIds;

  AuthProvider() {
    _initFromStorage();
  }

  Future<void> _initFromStorage() async {
    _token = await LocalStorage.getToken();
    final userMap = await LocalStorage.getUser();
    if (userMap != null) {
      _user = UserModel.fromJson(userMap);
    }
    notifyListeners();

    if (isAuthenticated) {
      await fetchCurrentUser();
      await fetchSavedProperties();
    }
  }

  Future<String?> requestOtp({required String phone, String? name}) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiClient().dio.post(
        '/auth/otp/request',
        data: {
          'phone': phone,
          if (name != null && name.isNotEmpty) 'name': name,
        },
      );
      _isLoading = false;
      notifyListeners();

      // Return devOtp if provided in development mode
      return res.data?['data']?['devOtp']?.toString();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> verifyOtp({
    required String phone,
    required String otp,
    String? name,
    String role = 'USER',
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiClient().dio.post(
        '/auth/otp/verify',
        data: {
          'phone': phone,
          'otp': otp,
          if (name != null && name.isNotEmpty) 'name': name,
          'role': role,
        },
      );

      final data = res.data?['data'];
      if (data != null) {
        _token = data['accessToken']?.toString();
        if (data['user'] != null) {
          _user = UserModel.fromJson(data['user']);
          await LocalStorage.saveUser(data['user']);
        }
        if (_token != null) {
          await LocalStorage.saveToken(_token!);
        }
      }
      _isLoading = false;
      notifyListeners();
      await fetchSavedProperties();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> loginAdmin({required String email, required String password}) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiClient().dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      final data = res.data?['data'];
      if (data != null) {
        _token = data['accessToken']?.toString();
        if (data['user'] != null) {
          _user = UserModel.fromJson(data['user']);
          await LocalStorage.saveUser(data['user']);
        }
        if (_token != null) {
          await LocalStorage.saveToken(_token!);
        }
      }
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> fetchCurrentUser() async {
    try {
      final res = await ApiClient().dio.get('/auth/me');
      final data = res.data?['data'];
      if (data != null) {
        _user = UserModel.fromJson(data);
        await LocalStorage.saveUser(data);
        notifyListeners();
      }
    } catch (e) {
      // If unauthorized, clean up
    }
  }

  Future<void> fetchSavedProperties() async {
    if (!isAuthenticated) return;
    try {
      final res = await ApiClient().dio.get('/me/saved/properties');
      final list = res.data?['data'] as List<dynamic>? ?? [];
      _savedPropertyIds.clear();
      for (final item in list) {
        final id = item['_id']?.toString() ?? item['id']?.toString();
        if (id != null) _savedPropertyIds.add(id);
      }
      notifyListeners();
    } catch (_) {}
  }

  bool isPropertySaved(String propertyId) {
    return _savedPropertyIds.contains(propertyId);
  }

  Future<void> toggleSavedProperty(String propertyId) async {
    if (!isAuthenticated) return;

    final wasSaved = _savedPropertyIds.contains(propertyId);
    if (wasSaved) {
      _savedPropertyIds.remove(propertyId);
    } else {
      _savedPropertyIds.add(propertyId);
    }
    notifyListeners();

    try {
      if (wasSaved) {
        await ApiClient().dio.delete('/me/saved/properties/$propertyId');
      } else {
        await ApiClient().dio.post('/me/saved/properties/$propertyId');
      }
    } catch (e) {
      // Revert on error
      if (wasSaved) {
        _savedPropertyIds.add(propertyId);
      } else {
        _savedPropertyIds.remove(propertyId);
      }
      notifyListeners();
    }
  }

  Future<void> logout() async {
    try {
      await ApiClient().dio.post('/auth/logout');
    } catch (_) {}
    _user = null;
    _token = null;
    _savedPropertyIds.clear();
    await LocalStorage.clearAll();
    notifyListeners();
  }
}

