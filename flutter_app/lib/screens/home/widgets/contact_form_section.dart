import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../providers/auth_provider.dart';

class ContactFormSection extends StatefulWidget {
  const ContactFormSection({super.key});

  @override
  State<ContactFormSection> createState() => _ContactFormSectionState();
}

class _ContactFormSectionState extends State<ContactFormSection> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _localityController = TextEditingController();
  final _messageController = TextEditingController();

  String _selectedInterest = 'BUYING';
  bool _isSubmitting = false;
  bool _isSubmitted = false;

  final List<Map<String, String>> _interestOptions = [
    {'id': 'BUYING', 'label': 'Buy Property', 'icon': '🏠'},
    {'id': 'SELLING', 'label': 'Sell Property', 'icon': '🏷️'},
    {'id': 'RENTING', 'label': 'Rent / Lease', 'icon': '🔑'},
    {'id': 'PLOT_LAND', 'label': 'Plot & Land', 'icon': '📐'},
    {'id': 'COMMERCIAL', 'label': 'Commercial', 'icon': '🏢'},
    {'id': 'GENERAL_ADVICE', 'label': 'Advisory', 'icon': '💬'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = Provider.of<AuthProvider>(context, listen: false).user;
      if (user != null) {
        if (user.name.isNotEmpty) {
          _nameController.text = user.name;
        }
        if (user.phone.isNotEmpty) {
          _phoneController.text = user.phone.replaceFirst(RegExp(r'^\+91'), '');
        }
        if (user.email != null && user.email!.isNotEmpty) {
          _emailController.text = user.email!;
        }
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _localityController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final response = await ApiClient().dio.post(
        ApiConstants.contact,
        data: {
          'fullName': _nameController.text.trim(),
          'phoneNumber': _phoneController.text.trim(),
          'email': _emailController.text.trim().isNotEmpty
              ? _emailController.text.trim()
              : null,
          'interestType': _selectedInterest,
          'locality': _localityController.text.trim().isNotEmpty
              ? _localityController.text.trim()
              : null,
          'message': _messageController.text.trim(),
          'source': 'APP_HOME_CONTACT_FORM',
        },
      );

      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _isSubmitted = true;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    response.data['message'] ??
                        'Inquiry submitted successfully! Our expert will call you shortly.',
                    style: GoogleFonts.plusJakartaSans(fontSize: 13),
                  ),
                ),
              ],
            ),
            backgroundColor: const Color(0xFF0F766E),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            margin: const EdgeInsets.all(16),
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Could not submit inquiry. Please try again or reach us directly on WhatsApp.',
              style: GoogleFonts.plusJakartaSans(fontSize: 13),
            ),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    }
  }

  void _resetForm() {
    setState(() {
      _isSubmitted = false;
      _messageController.clear();
      _localityController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primary,
                  AppColors.primary.withOpacity(0.88),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.contact_support_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Get in Touch with ZAMEEN',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'आमच्याशी संपर्क साधा • Nagpur Real Estate Helpdesk',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: Colors.white.withOpacity(0.88),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(18),
            child: _isSubmitted
                ? _buildSuccessView()
                : Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'I am interested in:',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryText,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Purpose / Category chips
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _interestOptions.map((opt) {
                            final isSelected = _selectedInterest == opt['id'];
                            return InkWell(
                              onTap: () {
                                setState(() => _selectedInterest = opt['id']!);
                              },
                              borderRadius: BorderRadius.circular(20),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 180),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary
                                      : const Color(0xFFF8FAFC),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected
                                        ? AppColors.primary
                                        : Colors.grey.shade300,
                                    width: isSelected ? 1.4 : 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(opt['icon']!, style: const TextStyle(fontSize: 12)),
                                    const SizedBox(width: 6),
                                    Text(
                                      opt['label']!,
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 11,
                                        fontWeight: isSelected
                                            ? FontWeight.w700
                                            : FontWeight.w500,
                                        color: isSelected
                                            ? Colors.white
                                            : AppColors.primaryText,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 16),

                        // Full Name
                        _buildInputField(
                          controller: _nameController,
                          label: 'Full Name / पूर्ण नाव *',
                          hint: 'Enter your name',
                          icon: Icons.person_outline_rounded,
                          validator: (v) {
                            if (v == null || v.trim().length < 2) {
                              return 'Please enter your name';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),

                        // Phone Number
                        _buildInputField(
                          controller: _phoneController,
                          label: 'Mobile Number / मोबाईल नंबर *',
                          hint: '10-digit mobile number',
                          icon: Icons.phone_android_rounded,
                          keyboardType: TextInputType.phone,
                          prefixText: '+91 ',
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(10),
                          ],
                          validator: (v) {
                            if (v == null || v.trim().length != 10) {
                              return 'Please enter a valid 10-digit number';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),

                        // Email (Optional) & Preferred Locality
                        Row(
                          children: [
                            Expanded(
                              child: _buildInputField(
                                controller: _emailController,
                                label: 'Email (Optional)',
                                hint: 'name@email.com',
                                icon: Icons.alternate_email_rounded,
                                keyboardType: TextInputType.emailAddress,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _buildInputField(
                                controller: _localityController,
                                label: 'Nagpur Locality',
                                hint: 'e.g. Besa, Wardha Rd',
                                icon: Icons.location_on_outlined,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Message / Requirement
                        _buildInputField(
                          controller: _messageController,
                          label: 'Requirement / संदेश *',
                          hint: 'E.g., Looking for a 2BHK flat near Wardha Road under ₹45 Lakhs...',
                          icon: Icons.edit_note_rounded,
                          maxLines: 3,
                          validator: (v) {
                            if (v == null || v.trim().length < 3) {
                              return 'Please write a brief requirement';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 18),

                        // Submit Button
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _isSubmitting ? null : _submitForm,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _isSubmitting
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.2,
                                      color: Colors.white,
                                    ),
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Submit Inquiry • चौकशी पाठवा',
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Quick Help Line / WhatsApp
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () async {
                                  final uri = Uri.parse('https://wa.me/919876543210?text=Hello%20ZAMEEN%2C%20I%20have%20an%20inquiry%20regarding%20Nagpur%20properties.');
                                  if (await canLaunchUrl(uri)) {
                                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                                  }
                                },
                                icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16, color: Color(0xFF0F766E)),
                                label: Text(
                                  'WhatsApp',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF0F766E),
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  side: BorderSide(color: Colors.teal.shade200),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () async {
                                  final uri = Uri.parse('tel:+919876543210');
                                  if (await canLaunchUrl(uri)) {
                                    await launchUrl(uri);
                                  }
                                },
                                icon: const Icon(Icons.phone_in_talk_rounded, size: 16, color: AppColors.primaryText),
                                label: Text(
                                  'Call Advisory',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primaryText,
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  side: BorderSide(color: Colors.grey.shade300),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    List<TextInputFormatter>? inputFormatters,
    String? Function(String?)? validator,
    String? prefixText,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.primaryText,
          ),
        ),
        const SizedBox(height: 5),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          validator: validator,
          maxLines: maxLines,
          style: GoogleFonts.plusJakartaSans(fontSize: 13, color: AppColors.primaryText),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.plusJakartaSans(fontSize: 12, color: Colors.grey.shade400),
            prefixText: prefixText,
            prefixStyle: GoogleFonts.plusJakartaSans(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primaryText),
            prefixIcon: maxLines == 1 ? Icon(icon, size: 18, color: Colors.grey.shade500) : null,
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: EdgeInsets.symmetric(
              horizontal: 12,
              vertical: maxLines > 1 ? 12 : 10,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessView() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.teal.shade50,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: Color(0xFF0F766E),
              size: 48,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'Inquiry Received Successfully!',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.primaryText,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            'आमच्या ZAMEEN तज्ञांची टीम लवकरच तुमच्याशी संपर्क साधेल.\nOur Nagpur real estate team will call you shortly to assist with your requirement.',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              height: 1.4,
              color: AppColors.secondaryText,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          OutlinedButton(
            onPressed: _resetForm,
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: Colors.grey.shade300),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            ),
            child: Text(
              'Submit Another Inquiry',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
