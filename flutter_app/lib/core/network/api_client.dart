import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../storage/local_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late Dio dio;
  String _currentBaseUrl = ApiConstants.baseUrl;

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: _currentBaseUrl,
        connectTimeout: const Duration(seconds: 12),
        receiveTimeout: const Duration(seconds: 12),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Initialize with stored preference if available
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
          if (!kReleaseMode &&
              _currentBaseUrl == ApiConstants.localBaseUrl &&
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
