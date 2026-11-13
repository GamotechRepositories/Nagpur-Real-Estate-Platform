import 'package:flutter/foundation.dart';

class ApiConstants {
  ApiConstants._();

  // Production Render Live Backend URL
  static const String liveBaseUrl = 'https://nagpur-real-estate-platform.onrender.com/api/v1';

  // Local Development Backend URL (via USB / adb reverse tcp:5000 tcp:5000 or localhost)
  static const String localBaseUrl = 'http://127.0.0.1:5000/api/v1';

  // Smart base URL resolution:
  // - In release mode (production APK / live): always uses Render Live URL.
  // - In debug mode (USB debugging): defaults to local, but allows fallback to Render.
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
