import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import 'loan_enquiry_screen.dart';

class EmiCalculatorScreen extends StatefulWidget {
  const EmiCalculatorScreen({Key? key}) : super(key: key);

  @override
  State<EmiCalculatorScreen> createState() => _EmiCalculatorScreenState();
}

class _EmiCalculatorScreenState extends State<EmiCalculatorScreen> {
  double _price = 8000000; // 80 Lakhs
  double _downPayment = 1600000; // 20% down
  double _interestRate = 8.5; // 8.5%
  double _tenureYears = 20; // 20 years

  final _inrFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹ ', decimalDigits: 0);

  @override
  Widget build(BuildContext context) {
    final loanAmount = max(0.0, _price - _downPayment);
    final r = _interestRate / 12 / 100;
    final n = _tenureYears * 12;

    int emi = 0;
    int totalPayable = 0;
    int totalInterest = 0;

    if (loanAmount > 0 && r > 0 && n > 0) {
      final factor = pow(1 + r, n);
      emi = (loanAmount * r * factor / (factor - 1)).round();
      totalPayable = (emi * n).round();
      totalInterest = totalPayable - loanAmount.round();
    }

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text(
          'Home Loan EMI Calculator',
          style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Calculator Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.beige),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Property Price Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Property Price', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                      Text(_inrFormat.format(_price), style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.navy)),
                    ],
                  ),
                  Slider(
                    value: _price,
                    min: 1000000,
                    max: 50000000,
                    divisions: 98,
                    activeColor: AppColors.gold,
                    onChanged: (val) {
                      setState(() {
                        _price = val;
                        if (_downPayment > _price) _downPayment = _price * 0.2;
                      });
                    },
                  ),
                  const SizedBox(height: 12),

                  // Down Payment Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Down Payment', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                      Text(_inrFormat.format(_downPayment), style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.navy)),
                    ],
                  ),
                  Slider(
                    value: _downPayment,
                    min: 0,
                    max: _price,
                    divisions: 50,
                    activeColor: AppColors.navyLight,
                    onChanged: (val) => setState(() => _downPayment = val),
                  ),
                  const SizedBox(height: 12),

                  // Interest Rate Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Interest Rate (p.a.)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                      Text('${_interestRate.toStringAsFixed(1)} %', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.navy)),
                    ],
                  ),
                  Slider(
                    value: _interestRate,
                    min: 6.0,
                    max: 15.0,
                    divisions: 18,
                    activeColor: AppColors.navy,
                    onChanged: (val) => setState(() => _interestRate = val),
                  ),
                  const SizedBox(height: 12),

                  // Tenure Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Loan Tenure', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                      Text('${_tenureYears.toInt()} Years', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.navy)),
                    ],
                  ),
                  Slider(
                    value: _tenureYears,
                    min: 5,
                    max: 30,
                    divisions: 25,
                    activeColor: AppColors.goldDark,
                    onChanged: (val) => setState(() => _tenureYears = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Results Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.navyDark,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Text(
                    'Monthly Payment (EMI)',
                    style: GoogleFonts.inter(fontSize: 12, color: Colors.white70),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _inrFormat.format(emi),
                    style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.goldLight),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white12),
                  const SizedBox(height: 12),

                  _buildResultRow('Principal Loan Amount', _inrFormat.format(loanAmount)),
                  const SizedBox(height: 8),
                  _buildResultRow('Total Interest Payable', _inrFormat.format(totalInterest)),
                  const SizedBox(height: 8),
                  _buildResultRow('Total Amount Payable', _inrFormat.format(totalPayable)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Loan Enquiry CTA
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoanEnquiryScreen()),
                );
              },
              icon: const Icon(Icons.account_balance),
              label: const Text('Apply for Preferential Mortgage Rates'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.navy,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
        Text(value, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
      ],
    );
  }
}

