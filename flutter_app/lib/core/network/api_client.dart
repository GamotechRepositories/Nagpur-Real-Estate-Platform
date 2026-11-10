import 'package:dio/dio.dart';
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
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

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

  void setBaseUrl(String newUrl) {
    _currentBaseUrl = newUrl;
    dio.options.baseUrl = newUrl;
  }

  String get baseUrl => _currentBaseUrl;
}

