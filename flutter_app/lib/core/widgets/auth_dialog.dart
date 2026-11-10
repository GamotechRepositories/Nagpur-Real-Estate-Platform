import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../../providers/auth_provider.dart';

class AuthDialog extends StatefulWidget {
  const AuthDialog({Key? key}) : super(key: key);

  @override
  State<AuthDialog> createState() => _AuthDialogState();
}

class _AuthDialogState extends State<AuthDialog> {
  int _activeTab = 0; // 0: OTP, 1: Admin Email
  int _otpStep = 0; // 0: Request, 1: Verify

  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  final _otpController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  String _selectedRole = 'USER';
  String? _devOtp;
  String _errorMessage = '';

  @override
  void dispose() {
    _phoneController.dispose();
    _nameController.dispose();
    _otpController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRequestOtp() async {
    setState(() => _errorMessage = '');
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.length != 10) {
      setState(() => _errorMessage = 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final devCode = await auth.requestOtp(
        phone: cleanPhone,
        name: _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : null,
      );

      setState(() {
        _devOtp = devCode;
        if (devCode != null) {
          _otpController.text = devCode;
        }
        _otpStep = 1;
      });
    } catch (e) {
      setState(() => _errorMessage = 'Failed to send OTP. Please try again.');
    }
  }

  Future<void> _handleVerifyOtp() async {
    setState(() => _errorMessage = '');
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    final otp = _otpController.text.trim();

    if (otp.length != 6) {
      setState(() => _errorMessage = 'Please enter the complete 6-digit OTP');
      return;
    }

    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      await auth.verifyOtp(
        phone: cleanPhone,
        otp: otp,
        name: _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : null,
        role: _selectedRole,
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _errorMessage = 'Invalid or expired OTP. Please try again.');
    }
  }

  Future<void> _handleAdminLogin() async {
    setState(() => _errorMessage = '');
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please provide both email and password');
      return;
    }

    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      await auth.loginAdmin(email: email, password: password);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _errorMessage = 'Invalid email or password');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

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
              // Top Header with Close
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Nagpur Realty Sign In',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.navy,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Tab Switcher (OTP vs Admin)
              Container(
                decoration: BoxDecoration(
                  color: AppColors.ivoryDark,
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.all(3),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _activeTab = 0;
                          _errorMessage = '';
                        }),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _activeTab == 0 ? AppColors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                            boxShadow: _activeTab == 0
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.05),
                                      blurRadius: 4,
                                    )
                                  ]
                                : null,
                          ),
                          child: Center(
                            child: Text(
                              'Phone OTP',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: _activeTab == 0 ? AppColors.navy : AppColors.charcoalMuted,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _activeTab = 1;
                          _errorMessage = '';
                        }),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _activeTab == 1 ? AppColors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                            boxShadow: _activeTab == 1
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.05),
                                      blurRadius: 4,
                                    )
                                  ]
                                : null,
                          ),
                          child: Center(
                            child: Text(
                              'Staff / Admin',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: _activeTab == 1 ? AppColors.navy : AppColors.charcoalMuted,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Error banner
              if (_errorMessage.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    _errorMessage,
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.errorRed),
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // Content based on tab
              if (_activeTab == 0) ...[
                if (_otpStep == 0) ...[
                  // Phone Number Input
                  Text(
                    'Mobile Number (10 digits)',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    maxLength: 10,
                    decoration: const InputDecoration(
                      prefixText: '+91  ',
                      hintText: '9823000000',
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Optional Name Input
                  Text(
                    'Full Name (Optional)',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      hintText: 'e.g. Ramesh Sharma',
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Role Selection
                  Text(
                    'I am registering as:',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      _buildRoleChip('Buyer / Tenant', 'USER'),
                      const SizedBox(width: 8),
                      _buildRoleChip('Property Owner', 'OWNER'),
                      const SizedBox(width: 8),
                      _buildRoleChip('Agent', 'AGENT'),
                    ],
                  ),
                  const SizedBox(height: 20),

                  ElevatedButton(
                    onPressed: auth.isLoading ? null : _handleRequestOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.navy,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: auth.isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            'Request Secure OTP',
                            style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                          ),
                  ),
                ] else ...[
                  // OTP Verification Step
                  if (_devOtp != null) ...[
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.gold),
                      ),
                      child: Text(
                        'Development OTP Code: $_devOtp',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.goldDark,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  Text(
                    'Enter 6-Digit OTP sent to +91 ${_phoneController.text}',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.charcoalMuted,
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 8,
                    ),
                    decoration: const InputDecoration(
                      hintText: '123456',
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: auth.isLoading ? null : _handleVerifyOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.navy,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: auth.isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            'Verify & Continue',
                            style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                          ),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () => setState(() => _otpStep = 0),
                    child: Text(
                      'Change Phone Number',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.charcoalMuted,
                      ),
                    ),
                  ),
                ],
              ] else ...[
                // Admin Email / Password
                Text(
                  'Staff Email Address',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.charcoal,
                  ),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    hintText: 'admin@nagpurestate.com',
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Password',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.charcoal,
                  ),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    hintText: '••••••••',
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: auth.isLoading ? null : _handleAdminLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.navy,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: auth.isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          'Sign In to Staff Console',
                          style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                        ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleChip(String label, String value) {
    final isSelected = _selectedRole == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedRole = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.navy : AppColors.ivory,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isSelected ? AppColors.navy : AppColors.beige,
            ),
          ),
          child: Center(
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Colors.white : AppColors.charcoal,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

