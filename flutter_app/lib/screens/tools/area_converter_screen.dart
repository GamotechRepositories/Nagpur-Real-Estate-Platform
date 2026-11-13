import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';

const Map<String, double> kUnitFactorsToSqFt = {
  'sqft': 1.0,
  'sqmtr': 10.7639,
  'sqyd': 9.0,
  'guntha': 1089.0, // Nagpur Standard: 1 Guntha = 1,089 Sq.Ft
  'acre': 43560.0,
  'hectare': 107639.0,
};

const Map<String, String> kUnitLabels = {
  'sqft': 'Square Feet (Sq.Ft)',
  'sqmtr': 'Square Metre (Sq.M)',
  'sqyd': 'Square Yard / Gaj (Sq.Yd)',
  'guntha': 'Guntha (Nagpur Standard)',
  'acre': 'Acre',
  'hectare': 'Hectare',
};

class AreaConverterScreen extends StatefulWidget {
  const AreaConverterScreen({Key? key}) : super(key: key);

  @override
  State<AreaConverterScreen> createState() => _AreaConverterScreenState();
}

class _AreaConverterScreenState extends State<AreaConverterScreen> {
  final _inputController = TextEditingController(text: '1000');
  String _fromUnit = 'sqft';
  String _toUnit = 'guntha';

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  double _calculateConverted() {
    final val = double.tryParse(_inputController.text) ?? 0.0;
    final inSqFt = val * (kUnitFactorsToSqFt[_fromUnit] ?? 1.0);
    return inSqFt / (kUnitFactorsToSqFt[_toUnit] ?? 1.0);
  }

  @override
  Widget build(BuildContext context) {
    final result = _calculateConverted();

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          'Area Unit Converter',
          style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderGrey),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Enter Measurement', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _inputController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.lightGrey,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.borderGrey)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.borderGrey)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.primaryGreen, width: 1.5)),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 16),

                  Text('From Unit', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _fromUnit,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.lightGrey,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.borderGrey)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.borderGrey)),
                    ),
                    items: kUnitLabels.entries
                        .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (v) {
                      if (v != null) setState(() => _fromUnit = v);
                    },
                  ),
                  const SizedBox(height: 14),

                  Center(
                    child: Container(
                      decoration: const BoxDecoration(
                        color: AppColors.lightGreen,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.swap_vert, color: AppColors.primaryGreen, size: 26),
                        onPressed: () {
                          setState(() {
                            final temp = _fromUnit;
                            _fromUnit = _toUnit;
                            _toUnit = temp;
                          });
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),

                  Text('To Unit', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _toUnit,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.lightGrey,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.borderGrey)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.borderGrey)),
                    ),
                    items: kUnitLabels.entries
                        .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (v) {
                      if (v != null) setState(() => _toUnit = v);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Conversion Result Box (Zameen Style)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.lightGreen,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
              ),
              child: Column(
                children: [
                  Text(
                    'Equivalent Area',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.darkGreen),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${result.toStringAsFixed(3)} ${kUnitLabels[_toUnit]?.split('(').first.trim()}',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.primaryGreen),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '1 Guntha in Nagpur = 1,089 Sq.Ft (33 ft × 33 ft)',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
