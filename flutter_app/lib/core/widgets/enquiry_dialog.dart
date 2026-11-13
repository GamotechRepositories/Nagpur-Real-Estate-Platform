import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../network/api_client.dart';
import '../../models/property_model.dart';
import '../../providers/auth_provider.dart';

class EnquiryDialog extends StatefulWidget {
  final PropertyModel property;

  const EnquiryDialog({Key? key, required this.property}) : super(key: key);

  @override
  State<EnquiryDialog> createState() => _EnquiryDialogState();
}

class _EnquiryDialogState extends State<EnquiryDialog> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController(
    text: 'I am inquiring regarding acquisition details, documentation, and viewing arrangements for this residence.',
  );

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
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    setState(() => _error = '');
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.length != 10) {
      setState(() => _error = 'Please enter a valid 10-digit mobile number');
      return;
    }

    setState(() => _loading = true);
    try {
      await ApiClient().dio.post(
        '/enquiries',
        data: {
          'customerName': _nameController.text.trim().isNotEmpty
              ? _nameController.text.trim()
              : 'Valued Inquirer',
          'phoneNumber': cleanPhone,
          'email': _emailController.text.trim().isNotEmpty
              ? _emailController.text.trim()
              : null,
          'propertyId': widget.property.id,
          'message': _messageController.text.trim(),
          'budget': widget.property.price,
          'locality': widget.property.localityName,
          'leadSource': 'PROPERTY_ENQUIRY',
        },
      );

      setState(() {
        _loading = false;
        _success = true;
      });

      await Future.delayed(const Duration(seconds: 2));
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _loading = false;
        _error = 'Failed to submit inquiry. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Direct Property Enquiry',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryText,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20, color: AppColors.secondaryText),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              Text(
                widget.property.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
              ),
              const SizedBox(height: 14),

              if (_success) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.lightGreen,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 36),
                      const SizedBox(height: 8),
                      Text(
                        'Enquiry Transmitted Successfully',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryText,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Our Nagpur concierge has routed your details to the listing agent.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.secondaryText),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                if (_error.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Text(
                      _error,
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.errorRed),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],

                Text('Full Name', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryText)),
                const SizedBox(height: 4),
                TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    hintText: 'Enter your name',
                    fillColor: AppColors.lightGrey,
                    filled: true,
                  ),
                ),
                const SizedBox(height: 10),

                Text('Mobile Number', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryText)),
                const SizedBox(height: 4),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  decoration: const InputDecoration(
                    prefixText: '+91  ',
                    hintText: '9823000000',
                    counterText: '',
                    fillColor: AppColors.lightGrey,
                    filled: true,
                  ),
                ),
                const SizedBox(height: 10),

                Text('Email (Optional)', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryText)),
                const SizedBox(height: 4),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    hintText: 'you@example.com',
                    fillColor: AppColors.lightGrey,
                    filled: true,
                  ),
                ),
                const SizedBox(height: 10),

                Text('Message', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryText)),
                const SizedBox(height: 4),
                TextField(
                  controller: _messageController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: 'Your requirements or questions...',
                    fillColor: AppColors.lightGrey,
                    filled: true,
                  ),
                ),
                const SizedBox(height: 18),

                ElevatedButton(
                  onPressed: _loading ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    elevation: 0,
                  ),
                  child: _loading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text('Send Private Enquiry', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13.5)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
