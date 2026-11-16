import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConstants {
  ApiConstants._();

  static const String _apiPrefix = '/api/v1';
  static const String _defaultLiveRoot =
      'https://nagpur-real-estate-platform.onrender.com';
  static const String _defaultLocalRoot = 'http://127.0.0.1:5000';

  static String _normalizeApiBase(String root) {
    final trimmed = root.trim().replaceAll(RegExp(r'/+$'), '');
    if (trimmed.endsWith(_apiPrefix)) return trimmed;
    return '$trimmed$_apiPrefix';
  }

  /// Production Render live backend URL (from `.env` → `API_BASE_URL`).
  static String get liveBaseUrl {
    final fromEnv = dotenv.env['API_BASE_URL'];
    if (fromEnv != null && fromEnv.isNotEmpty) {
      return _normalizeApiBase(fromEnv);
    }
    return _normalizeApiBase(_defaultLiveRoot);
  }

  /// Local development backend URL (from `.env` → `LOCAL_API_BASE_URL`).
  static String get localBaseUrl {
    final fromEnv = dotenv.env['LOCAL_API_BASE_URL'];
    if (fromEnv != null && fromEnv.isNotEmpty) {
      return _normalizeApiBase(fromEnv);
    }
    return _normalizeApiBase(_defaultLocalRoot);
  }

  // Smart base URL resolution:
  // - In release mode (production APK / live): always uses Render Live URL.
  // - In debug mode (USB debugging): defaults to local, but allows fallback to Render.
  // - Override with --dart-define=API_URL=...
  static String get baseUrl {
    const customUrl = String.fromEnvironment('API_URL');
    if (customUrl.isNotEmpty) return customUrl;

    if (kReleaseMode) {
      return liveBaseUrl;
    }
    return localBaseUrl;
  }

  // Auth endpoints
  static const String requestOtp = '/auth/otp/request';
  static const String verifyOtp = '/auth/otp/verify';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String updateProfile = '/auth/profile';

  // Properties endpoints
  static const String properties = '/properties';
  static const String propertyDetails = '/properties/details';
  static const String similarProperties = '/properties';

  // Saved / Wishlist endpoints
  static const String savedProperties = '/me/saved/properties';

  // Taxonomy & Discovery endpoints
  static const String localities = '/localities';
  static const String projects = '/projects';
  static const String agents = '/agents';
  static const String content = '/content';

  // Leads & Visits endpoints
  static const String enquiries = '/enquiries';
  static const String siteVisits = '/site-visits';
  static const String loanRequest = '/tools/loan-request';
}
