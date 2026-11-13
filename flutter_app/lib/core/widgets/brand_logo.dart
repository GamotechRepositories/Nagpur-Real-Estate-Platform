import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class SkylinePainter extends CustomPainter {
  final bool light;

  SkylinePainter({this.light = true});

  @override
  void paint(Canvas canvas, Size size) {
    final primaryColor = light ? Colors.white : AppColors.primaryGreen;
    final accentColor = light ? Colors.white.withOpacity(0.7) : AppColors.darkGreen;
    final windowColor = light ? AppColors.primaryGreen.withOpacity(0.4) : Colors.white.withOpacity(0.6);

    final fillPaint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;

    final accentPaint = Paint()
      ..color = accentColor
      ..style = PaintingStyle.fill;

    final windowPaint = Paint()
      ..color = windowColor
      ..style = PaintingStyle.fill;

    final scaleX = size.width / 52.0;
    final scaleY = size.height / 38.0;

    canvas.scale(scaleX, scaleY);

    // Left building
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(2, 16, 8, 19),
        const Radius.circular(1.0),
      ),
      fillPaint,
    );
    canvas.drawRect(const Rect.fromLTWH(4, 19, 4, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(4, 24, 4, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(4, 29, 4, 2.5), windowPaint);

    // Second building (angled roof peak)
    final path2 = Path()
      ..moveTo(11, 12)
      ..lineTo(17.5, 7)
      ..lineTo(17.5, 35)
      ..lineTo(11, 35)
      ..close();
    canvas.drawPath(path2, accentPaint);
    canvas.drawRect(const Rect.fromLTWH(13, 12, 2.5, 3), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(13, 17, 2.5, 3), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(13, 22, 2.5, 3), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(13, 27, 2.5, 3), windowPaint);

    // Center high-rise tower with stepped peak
    final path3 = Path()
      ..moveTo(22, 2)
      ..lineTo(26.5, 2)
      ..lineTo(26.5, 5)
      ..lineTo(29.5, 5)
      ..lineTo(29.5, 35)
      ..lineTo(19, 35)
      ..lineTo(19, 5)
      ..lineTo(22, 5)
      ..close();
    canvas.drawPath(path3, fillPaint);
    canvas.drawRect(const Rect.fromLTWH(21, 8, 6.5, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(21, 13, 6.5, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(21, 18, 6.5, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(21, 23, 6.5, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(21, 28, 6.5, 2.5), windowPaint);

    // Fourth building (angled roof)
    final path4 = Path()
      ..moveTo(31, 9)
      ..lineTo(38, 4)
      ..lineTo(38, 35)
      ..lineTo(31, 35)
      ..close();
    canvas.drawPath(path4, accentPaint);
    canvas.drawRect(const Rect.fromLTWH(33, 11, 3, 3), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(33, 16, 3, 3), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(33, 21, 3, 3), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(33, 26, 3, 3), windowPaint);

    // Right building
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(39.5, 14, 10.5, 21),
        const Radius.circular(1.0),
      ),
      fillPaint,
    );
    canvas.drawRect(const Rect.fromLTWH(41.5, 17, 3, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(41.5, 22, 3, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(41.5, 27, 3, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(45.5, 17, 3, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(45.5, 22, 3, 2.5), windowPaint);
    canvas.drawRect(const Rect.fromLTWH(45.5, 27, 3, 2.5), windowPaint);

    // Ground base bar
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(0, 34.5, 52, 2.5),
        const Radius.circular(1),
      ),
      fillPaint,
    );
  }

  @override
  bool shouldRepaint(covariant SkylinePainter oldDelegate) => oldDelegate.light != light;
}

class BrandLogo extends StatelessWidget {
  final bool light;
  final bool showSubtitle;
  final double iconWidth;
  final double iconHeight;

  const BrandLogo({
    Key? key,
    this.light = true,
    this.showSubtitle = true,
    this.iconWidth = 36,
    this.iconHeight = 26,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        CustomPaint(
          size: Size(iconWidth, iconHeight),
          painter: SkylinePainter(light: light),
        ),
        const SizedBox(width: 8),
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Nagpur',
                  style: GoogleFonts.inter(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: light ? Colors.white : AppColors.primaryText,
                    height: 1.1,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  'Realty',
                  style: GoogleFonts.inter(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: light ? AppColors.lightGreen : AppColors.primaryGreen,
                    height: 1.1,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
            if (showSubtitle)
              Text(
                'REAL ESTATE MARKETPLACE',
                style: GoogleFonts.inter(
                  fontSize: 7.5,
                  fontWeight: FontWeight.w700,
                  color: light ? Colors.white70 : AppColors.secondaryText,
                  letterSpacing: 1.1,
                ),
              ),
          ],
        ),
      ],
    );
  }
}
