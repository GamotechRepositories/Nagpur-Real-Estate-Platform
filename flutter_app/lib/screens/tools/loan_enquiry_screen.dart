import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../providers/auth_provider.dart';

class LoanEnquiryScreen extends StatefulWidget {
  const LoanEnquiryScreen({Key? key}) : super(key: key);

  @override
  State<LoanEnquiryScreen> createState() => _LoanEnquiryScreenState();
}

class _LoanEnquiryScreenState extends State<LoanEnquiryScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _incomeController = TextEditingController(text: '120000');
  final _loanRequiredController = TextEditingController(text: '5000000');

  String _employmentType = 'SALARIED';
  bool _loading = false;
  bool _success = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    if (user != null) {
      _nameController.text = user.name;
      _phoneController.text = user.phone;
      if (user.email != null) _emailController.text = user.email!;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _incomeController.dispose();
    _loanRequiredController.dispose();
    super.dispose();
  }

  Future<void> _submitLoanEnquiry() async {
    setState(() => _error = '');
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.length != 10) {
      setState(() => _error = 'Please enter a valid 10-digit mobile number');
      return;
    }

    setState(() => _loading = true);
    try {
      await ApiClient().dio.post(
        '/tools/loan-request',
        data: {
          'applicantName': _nameController.text.trim().isNotEmpty
              ? _nameController.text.trim()
              : 'Valued Client',
          'phoneNumber': cleanPhone,
          'email': _emailController.text.trim().isNotEmpty
              ? _emailController.text.trim()
              : null,
          'employmentType': _employmentType,
          'monthlyIncome': num.tryParse(_incomeController.text) ?? 100000,
          'loanAmountRequired': num.tryParse(_loanRequiredController.text) ?? 5000000,
        },
      );

      setState(() {
        _loading = false;
        _success = true;
      });
    } catch (_) {
      setState(() {
        _loading = false;
        _error = 'Failed to submit loan enquiry. Please verify the information.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_success) {
      return Scaffold(
        backgroundColor: AppColors.ivory,
        appBar: AppBar(title: const Text('Application Submitted')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.beige),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle, color: AppColors.verifiedGreen, size: 52),
                  const SizedBox(height: 14),
                  Text(
                    'Mortgage Enquiry Received',
                    style: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.navy),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Our banking advisory desk will review your borrowing eligibility and contact you with preferential quotes from SBI, HDFC, and ICICI Bank.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted, height: 1.4),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Return to Tools'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text(
          'Institutional Loan Enquiry',
          style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.beige),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Pre-Approval & Preferential Rates',
                style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy),
              ),
              const SizedBox(height: 4),
              Text(
                'Connect with leading PSU and private bank mortgage executives in Nagpur',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.charcoalMuted),
              ),
              const SizedBox(height: 16),

              if (_error.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                  child: Text(_error, style: GoogleFonts.inter(fontSize: 12, color: AppColors.errorRed)),
                ),
                const SizedBox(height: 12),
              ],

              Text('Applicant Name', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              TextField(controller: _nameController, decoration: const InputDecoration(hintText: 'e.g. Ramesh Sharma')),
              const SizedBox(height: 12),

              Text('Mobile Number (10 digits)', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                maxLength: 10,
                decoration: const InputDecoration(prefixText: '+91  ', hintText: '9823000000', counterText: ''),
              ),
              const SizedBox(height: 12),

              Text('Employment Type', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              DropdownButtonFormField<String>(
                value: _employmentType,
                items: const [
                  DropdownMenuItem(value: 'SALARIED', child: Text('Salaried Professional')),
                  DropdownMenuItem(value: 'SELF_EMPLOYED', child: Text('Self-Employed / Business')),
                ],
                onChanged: (v) => setState(() => _employmentType = v ?? 'SALARIED'),
              ),
              const SizedBox(height: 12),

              Text('Monthly Net Income (₹)', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              TextField(controller: _incomeController, keyboardType: TextInputType.number),
              const SizedBox(height: 12),

              Text('Loan Amount Required (₹)', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              TextField(controller: _loanRequiredController, keyboardType: TextInputType.number),
              const SizedBox(height: 20),

              ElevatedButton(
                onPressed: _loading ? null : _submitLoanEnquiry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.navy,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Submit Mortgage Application'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

