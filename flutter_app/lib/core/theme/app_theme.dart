import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.mainBackground,
      primaryColor: AppColors.primaryOrange,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryOrange,       // #FF792B (Primary Brand, Buttons, Headings)
        onPrimary: AppColors.white,
        secondary: AppColors.secondaryGreen,    // #4B8708 (Secondary Color, Borders, Highlights)
        onSecondary: AppColors.white,
        surface: AppColors.white,
        onSurface: AppColors.primaryText,
        error: AppColors.errorRed,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primaryOrange, // #FF792B
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: AppColors.white),
        titleTextStyle: TextStyle(
          color: AppColors.white,
          fontSize: 17,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.borderGrey, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryOrange, // #FF792B (Buttons)
          foregroundColor: AppColors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primaryOrange,
          side: const BorderSide(color: AppColors.secondaryGreen, width: 1.2), // #4B8708 (Borders)
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightGrey,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.borderGrey),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.borderGrey),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.secondaryGreen, width: 1.8), // #4B8708 (Highlight border)
        ),
        hintStyle: GoogleFonts.inter(
          color: AppColors.secondaryText,
          fontSize: 13,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.lightGrey,
        selectedColor: AppColors.lightOrange,
        secondarySelectedColor: AppColors.primaryOrange,
        labelStyle: GoogleFonts.inter(fontSize: 12, color: AppColors.primaryText),
        secondaryLabelStyle: GoogleFonts.inter(fontSize: 12, color: AppColors.primaryOrange, fontWeight: FontWeight.bold),
        side: const BorderSide(color: AppColors.secondaryGreen), // #4B8708 (Borders)
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderGrey,
        thickness: 1,
        space: 1,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.inter(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryOrange, // #FF792B (Headings)
        ),
        displayMedium: GoogleFonts.inter(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryOrange, // #FF792B (Headings)
        ),
        displaySmall: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryText,
        ),
        headlineMedium: GoogleFonts.inter(
          fontSize: 17,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryOrange, // #FF792B (Headings)
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: AppColors.primaryText,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.primaryText,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 14,
          color: AppColors.primaryText,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          color: AppColors.primaryText,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 11,
          color: AppColors.secondaryText,
        ),
      ),
    );
  }
}
