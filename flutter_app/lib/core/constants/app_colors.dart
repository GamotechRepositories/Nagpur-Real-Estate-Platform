import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary Brand Colors:
  // Orange: #FF792B -> Primary Brand, Buttons, Headings
  // Green:  #4B8708 -> Secondary Color, Borders, Highlights
  static const Color orange = Color(0xFFFF792B);
  static const Color primaryOrange = Color(0xFFFF792B);
  static const Color green = Color(0xFF4B8708);
  static const Color secondaryGreen = Color(0xFF4B8708);

  // Primary Brand (Orange #FF792B)
  static const Color primary = primaryOrange;
  static const Color darkOrange = Color(0xFFE56214);
  static const Color lightOrange = Color(0xFFFFF2EB);

  // Secondary Highlights & Borders (Green #4B8708)
  static const Color secondary = secondaryGreen;
  static const Color darkGreen = Color(0xFF3C6D06);
  static const Color lightGreen = Color(0xFFF1F8EB);
  static const Color borderGreen = secondaryGreen;
  static const Color highlightGreen = secondaryGreen;

  // Primary Theme mappings (Mapped to Orange #FF792B for seamless app-wide primary styling)
  static const Color primaryGreen = primaryOrange; // Orange #FF792B: Buttons, Main Brand & Headings
  static const Color accentGreen = secondaryGreen;  // Green #4B8708: Secondary Accents & Highlights

  // Base Neutrals
  static const Color white = Color(0xFFFFFFFF);
  static const Color mainBackground = Color(0xFFFFFFFF);
  static const Color lightGrey = Color(0xFFF7F7F7);
  static const Color borderGrey = Color(0xFFE6E6E6);
  static const Color primaryText = Color(0xFF242424);
  static const Color secondaryText = Color(0xFF858585);
  static const Color mutedText = Color(0xFFA0A0A0);

  // Functional Status Colors
  static const Color verifiedGreen = secondaryGreen; // Green #4B8708
  static const Color whatsappGreen = Color(0xFF25D366);
  static const Color errorRed = Color(0xFFDC2626);
  static const Color black = Color(0xFF000000);

  // Aliases for smooth migration & backward compatibility
  static const Color navy = primaryText;
  static const Color navyLight = secondaryText;
  static const Color navyDark = primaryOrange;
  static const Color navyDeep = darkOrange;

  static const Color ivory = mainBackground;
  static const Color ivoryLight = lightGrey;
  static const Color ivoryDark = lightGrey;

  static const Color gold = primaryOrange;
  static const Color goldLight = lightOrange;
  static const Color goldDark = darkOrange;
  static const Color goldSubtle = lightOrange;

  static const Color charcoal = primaryText;
  static const Color charcoalLight = secondaryText;
  static const Color charcoalMuted = secondaryText;

  static const Color beige = borderGrey;
  static const Color beigeLight = lightGrey;
  static const Color beigeDark = borderGrey;
}
