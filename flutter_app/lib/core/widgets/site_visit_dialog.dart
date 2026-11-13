import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../network/api_client.dart';
import '../../models/property_model.dart';
import '../../providers/auth_provider.dart';

class SiteVisitDialog extends StatefulWidget {
  final PropertyModel property;

  const SiteVisitDialog({Key? key, required this.property}) : super(key: key);

  @override
  State<SiteVisitDialog> createState() => _SiteVisitDialogState();
}

class _SiteVisitDialogState extends State<SiteVisitDialog> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  final List<String> _timeSlots = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
  ];
  String _selectedSlot = '10:00 AM - 12:00 PM';

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
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primaryGreen,
              onPrimary: Colors.white,
              onSurface: AppColors.primaryText,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
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
        '/site-visits',
        data: {
          'propertyId': widget.property.id,
          'customerName': _nameController.text.trim().isNotEmpty
              ? _nameController.text.trim()
              : 'Valued Visitor',
          'phoneNumber': cleanPhone,
          'email': _emailController.text.trim().isNotEmpty
              ? _emailController.text.trim()
              : null,
          'preferredDate': DateFormat('yyyy-MM-dd').format(_selectedDate),
          'preferredTimeSlot': _selectedSlot,
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
        _error = 'Failed to schedule site visit. Please try again.';
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
                    'Book In-Person Site Visit',
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
                'Accompanied inspection with assigned Nagpur agent',
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
                        'Site Visit Booked!',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryText,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Our representative will meet you at the property at the scheduled time.',
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

                // Date Selection
                Text('Preferred Date', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryText)),
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: _selectDate,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.lightGrey,
                      border: Border.all(color: AppColors.borderGrey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          DateFormat('EEEE, d MMMM yyyy').format(_selectedDate),
                          style: GoogleFonts.inter(fontSize: 13, color: AppColors.primaryText),
                        ),
                        const Icon(Icons.calendar_month, size: 18, color: AppColors.primaryGreen),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Time Slot Selection
                Text('Time Slot', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryText)),
                const SizedBox(height: 4),
                DropdownButtonFormField<String>(
                  value: _selectedSlot,
                  decoration: const InputDecoration(
                    contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    fillColor: AppColors.lightGrey,
                    filled: true,
                  ),
                  items: _timeSlots
                      .map((slot) => DropdownMenuItem(value: slot, child: Text(slot, style: GoogleFonts.inter(fontSize: 13))))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedSlot = val);
                  },
                ),
                const SizedBox(height: 10),

                Text('Your Name', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryText)),
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
                      : Text('Confirm Inspection Appointment', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13.5)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
