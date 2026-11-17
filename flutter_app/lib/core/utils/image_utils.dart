import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

/// Validates whether a given URL is a legitimate HTTP/HTTPS web image URL.
bool isValidImageUrl(String? url) {
  if (url == null) return false;
  final trimmed = url.trim();
  if (trimmed.isEmpty) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/// Safely creates a [CachedNetworkImageProvider] only when the URL is non-empty
/// and valid. Returns `null` instead of throwing `ArgumentError: No host specified`.
ImageProvider? safeImageProvider(String? url, {String? fallbackUrl}) {
  if (isValidImageUrl(url)) {
    return CachedNetworkImageProvider(url!.trim());
  }
  if (isValidImageUrl(fallbackUrl)) {
    return CachedNetworkImageProvider(fallbackUrl!.trim());
  }
  return null;
}

