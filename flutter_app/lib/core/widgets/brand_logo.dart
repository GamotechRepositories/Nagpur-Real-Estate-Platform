import 'package:flutter/material.dart';

class BrandLogo extends StatelessWidget {
  final bool light;
  final bool showSubtitle;
  final double? width;
  final double? height;
  final double iconWidth;
  final double iconHeight;

  const BrandLogo({
    Key? key,
    this.light = true,
    this.showSubtitle = true,
    this.width,
    this.height,
    this.iconWidth = 140,
    this.iconHeight = 38,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final effectiveHeight = height ?? iconHeight;
    return Image.asset(
      'assets/images/app_logo.png',
      height: effectiveHeight,
      width: width,
      fit: BoxFit.contain,
    );
  }
}
