class ApiConstants {
  ApiConstants._();

  // Smart base URL resolution:
  // - On Android Device with adb reverse or Android Emulator:
  //   With `adb reverse tcp:5000 tcp:5000`, physical phone can reach `http://localhost:5000/api/v1`
  //   Or via host IP `http://10.173.21.28:5000/api/v1`
  //   Default to localhost:5000 which works everywhere with adb reverse
  static String get baseUrl {
    // When running on physical device with adb reverse or desktop/web:
    return 'http://127.0.0.1:5000/api/v1';
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
