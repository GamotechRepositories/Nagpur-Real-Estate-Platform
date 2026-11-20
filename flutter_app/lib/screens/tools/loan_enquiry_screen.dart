import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../providers/auth_provider.dart';

class LoanEnquiryScreen extends StatefulWidget {
  final double? initialLoanAmount;
  final double? initialPropertyPrice;
  final String? propertyId;

  const LoanEnquiryScreen({
    super.key,
    this.initialLoanAmount,
    this.initialPropertyPrice,
    this.propertyId,
  });

  @override
  State<LoanEnquiryScreen> createState() => _LoanEnquiryScreenState();
}

class _LoanEnquiryScreenState extends State<LoanEnquiryScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _incomeController = TextEditingController(text: '120000');
  late final TextEditingController _loanRequiredController;
  final _propertyPriceController = TextEditingController();
  final _notesController = TextEditingController();

  String _employmentType = 'SALARIED';
  String _preferredBank = 'Any / Best Rate';
  bool _loading = false;
  bool _success = false;
  String _error = '';
  String _successApplicationId = '';

  final List<String> _bankOptions = const [
    'Any / Best Rate',
    'State Bank of India (SBI)',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Bank of Baroda',
    'Punjab National Bank',
  ];

  @override
  void initState() {
    super.initState();
    final loanAmt = widget.initialLoanAmount != null && widget.initialLoanAmount! > 0
        ? widget.initialLoanAmount!.round().toString()
        : '5000000';
    _loanRequiredController = TextEditingController(text: loanAmt);

    if (widget.initialPropertyPrice != null && widget.initialPropertyPrice! > 0) {
      _propertyPriceController.text = widget.initialPropertyPrice!.round().toString();
    }

    final user = Provider.of<AuthProvider>(context, listen: false).user;
    if (user != null) {
      _nameController.text = user.name;
      String cleanP = user.phone.replaceAll(RegExp(r'[^0-9]'), '');
      if (cleanP.startsWith('91') && cleanP.length == 12) {
        cleanP = cleanP.substring(2);
      }
      _phoneController.text = cleanP;
      if (user.email != null && user.email!.isNotEmpty) {
        _emailController.text = user.email!;
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _incomeController.dispose();
    _loanRequiredController.dispose();
    _propertyPriceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  String _formatIndianCurrency(num val) {
    if (val >= 10000000) {
      final cr = val / 10000000;
      return '₹ ${cr.toStringAsFixed(cr % 1 == 0 ? 0 : 2)} Crore';
    } else if (val >= 100000) {
      final lk = val / 100000;
      return '₹ ${lk.toStringAsFixed(lk % 1 == 0 ? 0 : 2)} Lakh';
    } else if (val >= 1000) {
      final th = val / 1000;
      return '₹ ${th.toStringAsFixed(th % 1 == 0 ? 0 : 1)} K';
    }
    return '₹ $val';
  }

  Future<void> _submitLoanEnquiry() async {
    setState(() => _error = '');

    // Validate Name
    final name = _nameController.text.trim();
    if (name.isEmpty || name.length < 2) {
      setState(() => _error = 'Please enter your full name (minimum 2 characters).');
      return;
    }

    // Validate Indian Phone Number
    String cleanPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('91') && cleanPhone.length == 12) {
      cleanPhone = cleanPhone.substring(2);
    }
    if (cleanPhone.length != 10 || !RegExp(r'^[6789]\d{9}$').hasMatch(cleanPhone)) {
      setState(() => _error = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    // Validate Monthly Income
    final income = num.tryParse(_incomeController.text.trim());
    if (income == null || income <= 0) {
      setState(() => _error = 'Please enter a valid monthly net income in INR.');
      return;
    }

    // Validate Loan Required
    final loanAmt = num.tryParse(_loanRequiredController.text.trim());
    if (loanAmt == null || loanAmt <= 0) {
      setState(() => _error = 'Please enter the loan amount required in INR.');
      return;
    }

    // Validate Email format if entered
    final email = _emailController.text.trim();
    if (email.isNotEmpty && !RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      setState(() => _error = 'Please enter a valid email address, or leave it blank.');
      return;
    }

    setState(() => _loading = true);

    try {
      final payload = <String, dynamic>{
        'applicantName': name,
        'phoneNumber': cleanPhone,
        'employmentType': _employmentType,
        'monthlyIncome': income,
        'loanAmountRequired': loanAmt,
        'preferredBank': _preferredBank,
      };

      if (email.isNotEmpty) {
        payload['email'] = email;
      }

      final propVal = num.tryParse(_propertyPriceController.text.trim());
      if (propVal != null && propVal > 0) {
        payload['propertyEstimatedValue'] = propVal;
      }

      if (widget.propertyId != null && widget.propertyId!.isNotEmpty) {
        payload['selectedProperty'] = widget.propertyId;
      }

      if (_notesController.text.trim().isNotEmpty) {
        payload['notes'] = _notesController.text.trim();
      }

      final res = await ApiClient().dio.post(
        '/tools/loan-request',
        data: payload,
      );

      final appId = res.data?['data']?['_id']?.toString() ?? '';

      if (mounted) {
        setState(() {
          _loading = false;
          _success = true;
          _successApplicationId = appId;
        });
      }
    } on DioException catch (e) {
      if (mounted) {
        String msg = 'Failed to submit loan enquiry. Please verify the information.';
        final data = e.response?.data;
        if (data != null && data['message'] != null) {
          msg = data['message'].toString();
        }
        setState(() {
          _loading = false;
          _error = msg;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Submission failed: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_success) {
      return Scaffold(
        backgroundColor: AppColors.mainBackground,
        appBar: AppBar(
          backgroundColor: AppColors.primaryGreen,
          elevation: 0,
          title: const Text('Application Submitted', style: TextStyle(color: Colors.white)),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderGrey),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      color: AppColors.lightGreen,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 44),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Home Loan Application Submitted!',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                  ),
                  const SizedBox(height: 8),
                  if (_successApplicationId.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.lightGrey,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Ref ID: $_successApplicationId',
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.secondaryText),
                      ),
                    ),
                  const SizedBox(height: 12),
                  Text(
                    'Our banking advisory team in Nagpur has received your request. An authorized loan officer from $_preferredBank will contact you on ${_phoneController.text.trim()} within 24 hours with pre-approved rates.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.secondaryText, height: 1.45),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                      ),
                      child: const Text('Back to Tools', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    final incomeNum = num.tryParse(_incomeController.text.trim()) ?? 0;
    final loanNum = num.tryParse(_loanRequiredController.text.trim()) ?? 0;

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          'Apply For Home Loan',
          style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(16, 16, 16, 36 + MediaQuery.of(context).padding.bottom),
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderGrey),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.lightGreen,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.account_balance, color: AppColors.primaryGreen, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Pre-Approved Home Loans',
                          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                        ),
                        Text(
                          'Get competitive interest rates starting at 8.40% p.a.',
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: AppColors.borderGrey),
              const SizedBox(height: 12),

              // Error Banner
              if (_error.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.error_outline, size: 16, color: AppColors.errorRed),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _error,
                          style: GoogleFonts.inter(fontSize: 12, color: AppColors.errorRed, height: 1.3),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Applicant Name
              _buildFieldLabel('Applicant Full Name *'),
              const SizedBox(height: 6),
              TextField(
                controller: _nameController,
                decoration: _inputDecoration('e.g. Ramesh Sharma'),
              ),
              const SizedBox(height: 14),

              // Mobile Number
              _buildFieldLabel('Mobile Calling Number (10 digits) *'),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                maxLength: 10,
                decoration: _inputDecoration('9823000000').copyWith(
                  prefixText: '+91  ',
                  counterText: '',
                  prefixIcon: const Icon(Icons.phone_outlined, size: 18, color: AppColors.secondaryText),
                ),
              ),
              const SizedBox(height: 14),

              // Email Address
              _buildFieldLabel('Email Address (Optional)'),
              const SizedBox(height: 6),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: _inputDecoration('contact@example.com').copyWith(
                  prefixIcon: const Icon(Icons.email_outlined, size: 18, color: AppColors.secondaryText),
                ),
              ),
              const SizedBox(height: 14),

              // Employment Type
              _buildFieldLabel('Employment Type *'),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _employmentType,
                isExpanded: true,
                decoration: _inputDecoration('Select Employment Type'),
                items: const [
                  DropdownMenuItem(value: 'SALARIED', child: Text('Salaried Professional / Govt / MNC')),
                  DropdownMenuItem(value: 'SELF_EMPLOYED_BUSINESS', child: Text('Self-Employed / Business Owner')),
                  DropdownMenuItem(value: 'SELF_EMPLOYED_PROFESSIONAL', child: Text('Self-Employed Professional (Doctor, CA, etc.)')),
                ],
                onChanged: (v) => setState(() => _employmentType = v ?? 'SALARIED'),
              ),
              const SizedBox(height: 14),

              // Monthly Net Income
              _buildFieldLabel('Monthly Net Take-Home Income (INR ₹) *'),
              const SizedBox(height: 6),
              TextField(
                controller: _incomeController,
                keyboardType: TextInputType.number,
                onChanged: (_) => setState(() {}),
                decoration: _inputDecoration('e.g. 120000').copyWith(
                  prefixIcon: const Icon(Icons.currency_rupee, size: 18, color: AppColors.secondaryText),
                ),
              ),
              if (incomeNum > 0) ...[
                const SizedBox(height: 4),
                Text(
                  _formatIndianCurrency(incomeNum),
                  style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                ),
              ],
              const SizedBox(height: 14),

              // Loan Amount Required
              _buildFieldLabel('Loan Amount Required (INR ₹) *'),
              const SizedBox(height: 6),
              TextField(
                controller: _loanRequiredController,
                keyboardType: TextInputType.number,
                onChanged: (_) => setState(() {}),
                decoration: _inputDecoration('e.g. 5000000').copyWith(
                  prefixIcon: const Icon(Icons.currency_rupee, size: 18, color: AppColors.secondaryText),
                ),
              ),
              if (loanNum > 0) ...[
                const SizedBox(height: 4),
                Text(
                  _formatIndianCurrency(loanNum),
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                ),
              ],
              const SizedBox(height: 14),

              // Preferred Bank
              _buildFieldLabel('Preferred Banking Partner'),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _preferredBank,
                isExpanded: true,
                decoration: _inputDecoration('Select Preferred Bank'),
                items: _bankOptions.map((bank) => DropdownMenuItem(value: bank, child: Text(bank, overflow: TextOverflow.ellipsis))).toList(),
                onChanged: (v) => setState(() => _preferredBank = v ?? 'Any / Best Rate'),
              ),
              const SizedBox(height: 14),

              // Notes / Message
              _buildFieldLabel('Special Instructions / Notes (Optional)'),
              const SizedBox(height: 6),
              TextField(
                controller: _notesController,
                maxLines: 2,
                decoration: _inputDecoration('e.g. Looking for 20 years tenure with fast sanction'),
              ),
              const SizedBox(height: 24),

              // Submit Button
              ElevatedButton(
                onPressed: _loading ? null : _submitLoanEnquiry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  elevation: 0,
                ),
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text('Submit Loan Application', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: AppColors.primaryText,
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      fillColor: AppColors.lightGrey,
      filled: true,
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
        borderSide: const BorderSide(color: AppColors.primaryGreen, width: 1.5),
      ),
    );
  }
}
