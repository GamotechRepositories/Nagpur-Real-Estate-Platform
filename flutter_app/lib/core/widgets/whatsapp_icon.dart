import 'package:flutter/material.dart';

/// Authentic WhatsApp brand icon widget using the official vector-rendered glyph.
class WhatsAppIcon extends StatelessWidget {
  final double size;
  final Color? color;
  final bool isBadge;

  const WhatsAppIcon({
    super.key,
    this.size = 18,
    this.color,
    this.isBadge = false,
  });

  /// Full circular green badge with white phone bubble inside
  const WhatsAppIcon.badge({
    super.key,
    this.size = 24,
  })  : color = null,
        isBadge = true;

  /// Pure white official WhatsApp icon glyph (ideal for WhatsApp green buttons)
  const WhatsAppIcon.white({
    super.key,
    this.size = 18,
  })  : color = Colors.white,
        isBadge = false;

  /// Pure green official WhatsApp icon glyph (ideal for white/light surfaces)
  const WhatsAppIcon.green({
    super.key,
    this.size = 18,
  })  : color = const Color(0xFF25D366),
        isBadge = false;

  @override
  Widget build(BuildContext context) {
    if (isBadge) {
      return Image.asset(
        'assets/images/whatsapp_badge.png',
        width: size,
        height: size,
        fit: BoxFit.contain,
      );
    }

    if (color == Colors.white) {
      return Image.asset(
        'assets/images/whatsapp_white.png',
        width: size,
        height: size,
        fit: BoxFit.contain,
      );
    }

    if (color == const Color(0xFF25D366) || color == null) {
      return Image.asset(
        'assets/images/whatsapp_green.png',
        width: size,
        height: size,
        fit: BoxFit.contain,
      );
    }

    // Color filtered custom tint
    return Image.asset(
      'assets/images/whatsapp_white.png',
      width: size,
      height: size,
      color: color,
      colorBlendMode: BlendMode.srcIn,
      fit: BoxFit.contain,
    );
  }
}
