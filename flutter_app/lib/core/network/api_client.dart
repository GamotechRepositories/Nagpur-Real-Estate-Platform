import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../storage/local_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late Dio dio;
  String _currentBaseUrl = ApiConstants.baseUrl;

  ApiClient._internal() {
    // In release mode (production APK), ALWAYS force live Render backend
    if (kReleaseMode) {
      _currentBaseUrl = ApiConstants.liveBaseUrl;
    }

    dio = Dio(
      BaseOptions(
        baseUrl: _currentBaseUrl,
        // Extended timeouts for Render free tier cold-start wakeup (up to 45s)
        connectTimeout: const Duration(seconds: 45),
        receiveTimeout: const Duration(seconds: 45),
        sendTimeout: const Duration(seconds: 45),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Resilient SSL Handshake configuration for Android release builds
    if (!kIsWeb && dio.httpClientAdapter is IOHttpClientAdapter) {
      (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
        final client = HttpClient();
        client.badCertificateCallback = (X509Certificate cert, String host, int port) {
          // Trust Render cloud domain, local hosts, and standard endpoints
          return host.contains('onrender.com') ||
              host.contains('127.0.0.1') ||
              host.contains('localhost') ||
              host.contains('10.0.2.2');
        };
        return client;
      };
    }

    // Initialize with stored preference if in debug mode
    _loadStoredBackend();

    // Request & Response Interceptors
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await LocalStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Automatic fallback: If local server (USB) is unavailable or connection refused/timeout,
          // automatically switch to the live Render backend so the app continues working seamlessly!
          if (_currentBaseUrl != ApiConstants.liveBaseUrl &&
              (error.type == DioExceptionType.connectionError ||
                  error.type == DioExceptionType.connectionTimeout)) {
            debugPrint(
              'Local backend unavailable at $_currentBaseUrl. Falling back to Render live backend: ${ApiConstants.liveBaseUrl}',
            );
            setBaseUrl(ApiConstants.liveBaseUrl);
            final retryOpts = error.requestOptions;
            retryOpts.baseUrl = ApiConstants.liveBaseUrl;
            try {
              final cloneReq = await dio.fetch(retryOpts);
              return handler.resolve(cloneReq);
            } catch (_) {
              // If even live fails, pass the original error
            }
          }

          // Token refresh logic if 401
          if (error.response?.statusCode == 401) {
            try {
              final refreshRes = await dio.post(ApiConstants.refresh);
              final newToken = refreshRes.data?['data']?['accessToken'];
              if (newToken != null) {
                await LocalStorage.saveToken(newToken.toString());
                final retryOpts = error.requestOptions;
                retryOpts.headers['Authorization'] = 'Bearer $newToken';
                final cloneReq = await dio.fetch(retryOpts);
                return handler.resolve(cloneReq);
              }
            } catch (_) {
              await LocalStorage.clearAll();
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<void> _loadStoredBackend() async {
    if (kReleaseMode) {
      // Release mode MUST always target the live Render cloud
      setBaseUrl(ApiConstants.liveBaseUrl);
      return;
    }
    try {
      final savedMode = await LocalStorage.getBackendMode();
      if (savedMode == 'live') {
        setBaseUrl(ApiConstants.liveBaseUrl);
      } else if (savedMode == 'local') {
        setBaseUrl(ApiConstants.localBaseUrl);
      }
    } catch (_) {}
  }

  void setBaseUrl(String newUrl) {
    _currentBaseUrl = newUrl;
    dio.options.baseUrl = newUrl;
  }

  void switchToLive() {
    setBaseUrl(ApiConstants.liveBaseUrl);
    LocalStorage.saveBackendMode('live');
  }

  void switchToLocal() {
    setBaseUrl(ApiConstants.localBaseUrl);
    LocalStorage.saveBackendMode('local');
  }

  bool get isLive => _currentBaseUrl == ApiConstants.liveBaseUrl;
  bool get isLocal => _currentBaseUrl == ApiConstants.localBaseUrl;

  String get baseUrl => _currentBaseUrl;
}
