import 'dart:io';
import 'package:dio/dio.dart';
import '../network/api_client.dart';
import '../constants/api_constants.dart';

class UploadService {
  UploadService._();

  /// Normalizes relative URLs (e.g. /uploads/...) to fully qualified URLs,
  /// while preserving absolute AWS S3 / CloudFront CDN URLs.
  static String normalizeUrl(String rawUrl) {
    final trimmed = rawUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    final base = ApiConstants.baseUrl.replaceAll('/api/v1', '');
    return '$base$trimmed';
  }

  /// Uploads a single image to AWS S3 & CloudFront Storage via backend
  static Future<String> uploadImage(File file, {String folder = 'properties'}) async {
    final fileName = file.path.split(Platform.pathSeparator).last;
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(
        file.path,
        filename: fileName,
      ),
      'folder': folder,
    });

    final res = await ApiClient().dio.post(
      '/upload/single',
      data: formData,
      options: Options(
        contentType: 'multipart/form-data',
      ),
    );

    final rawUrl = res.data?['data']?['url']?.toString();
    if (rawUrl != null && rawUrl.isNotEmpty) {
      return normalizeUrl(rawUrl);
    }
    throw Exception('Failed to get uploaded image URL');
  }

  /// Uploads multiple image files sequentially
  static Future<List<String>> uploadMultipleImages(
    List<File> files, {
    String folder = 'properties',
    Function(int current, int total)? onProgress,
  }) async {
    final List<String> uploadedUrls = [];
    for (int i = 0; i < files.length; i++) {
      if (onProgress != null) {
        onProgress(i + 1, files.length);
      }
      final url = await uploadImage(files[i], folder: folder);
      uploadedUrls.add(url);
    }
    return uploadedUrls;
  }
}
