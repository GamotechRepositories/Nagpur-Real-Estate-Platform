import 'dart:math';
import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  /// Format Indian Currency to Lakhs / Crores or comma separated Rupees
  static String formatIndianPrice(dynamic price, {String priceUnit = 'Total'}) {
    if (price == null) return 'Price on Request';
    final num? val = num.tryParse(price.toString());
    if (val == null || val <= 0) return 'Price on Request';

    final isRent = priceUnit.toLowerCase().contains('month') || priceUnit == 'RENT';
    final suffix = isRent ? ' / mo' : '';

    if (val >= 10000000) {
      final cr = (val / 10000000).toStringAsFixed(2).replaceAll(RegExp(r'\.00$'), '');
      return '₹ $cr Cr$suffix';
    }

    if (val >= 100000) {
      final lakh = (val / 100000).toStringAsFixed(2).replaceAll(RegExp(r'\.00$'), '');
      return '₹ $lakh Lac$suffix';
    }

    final indianFormat = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹ ',
      decimalDigits: 0,
    );
    return '${indianFormat.format(val)}$suffix';
  }

  /// Format Area with commas
  static String formatArea(dynamic area, {String unit = 'sq.ft'}) {
    if (area == null) return 'N/A';
    final num? val = num.tryParse(area.toString());
    if (val == null || val <= 0) return 'N/A';

    final formatter = NumberFormat('#,##,###', 'en_IN');
    return '${formatter.format(val)} $unit';
  }

  /// Approximate monthly EMI based on 8.5% interest over 20 years (80% loan)
  static String calculateEstimateEmi(dynamic price) {
    if (price == null) return 'N/A';
    final num? val = num.tryParse(price.toString());
    if (val == null || val <= 0) return 'N/A';

    final principal = val * 0.8;
    const monthlyRate = 8.5 / 12 / 100;
    const months = 240;
    final factor = pow(1 + monthlyRate, months);
    final emi = (principal * monthlyRate * factor / (factor - 1)).round();

    final formatter = NumberFormat('#,##,###', 'en_IN');
    return '₹ ${formatter.format(emi)}/mo';
  }

  /// Format Date to readable Indian standard (e.g. 15 Jan 2026)
  static String formatDate(String? dateString) {
    if (dateString == null || dateString.isEmpty) return '';
    try {
      final d = DateTime.parse(dateString);
      return DateFormat('d MMM yyyy').format(d);
    } catch (_) {
      return dateString;
    }
  }
}

