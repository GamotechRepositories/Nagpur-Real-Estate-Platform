import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../account/my_properties_screen.dart';

class PostPropertyScreen extends StatefulWidget {
  const PostPropertyScreen({Key? key}) : super(key: key);

  @override
  State<PostPropertyScreen> createState() => _PostPropertyScreenState();
}

class _PostPropertyScreenState extends State<PostPropertyScreen> {
  int _currentStep = 1;
  bool _loading = false;
  String _error = '';
  bool _success = false;

  // Form Fields
  String _purpose = 'BUY'; // 'BUY' | 'RENT'
  String _category = 'RESIDENTIAL'; // 'RESIDENTIAL' | 'COMMERCIAL' | 'PLOT'
  String _subtype = 'FLAT';

  final _titleController = TextEditingController(text: '3 BHK Luxury Apartment in Dharampeth');
  final _descController = TextEditingController(
    text: 'Spacious high-rise flat with panoramic city views, modern fittings, 24-hr water supply, and dedicated covered car parking.',
  );
  final _priceController = TextEditingController(text: '8500000');
  final _areaController = TextEditingController(text: '1450');
  final _addressController = TextEditingController(text: 'Near Coffee House, West High Court Road');
  final _pincodeController = TextEditingController(text: '440010');
  final _newImageController = TextEditingController();

  int _bedrooms = 3;
  int _bathrooms = 2;
  int _balconies = 1;
  int _floor = 4;
  int _totalFloors = 9;
  String _furnishing = 'SEMI_FURNISHED';
  String _possessionStatus = 'READY_TO_MOVE';
  String _facing = 'EAST';
  String _localityName = 'Dharampeth';

  final List<String> _amenities = [
    '24x7 Security & CCTV',
    'High Speed Lift',
    'Reserved Covered Parking',
    'Gymnasium & Fitness',
  ];

  final List<String> _images = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  ];

  final List<String> _nagpurLocalities = [
    'Dharampeth',
    'Civil Lines',
    'Ramdaspeth',
    'Manish Nagar',
    'Wardha Road',
    'Besa',
    'Shankar Nagar',
    'Sitabuldi',
    'Hingna Road',
    'Pratap Nagar',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _areaController.dispose();
    _addressController.dispose();
    _pincodeController.dispose();
    _newImageController.dispose();
    super.dispose();
  }

  Future<void> _submitProperty() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final payload = {
        'purpose': _purpose,
        'category': _category,
        'subtype': _subtype,
        'title': _titleController.text.trim(),
        'description': _descController.text.trim(),
        'price': num.tryParse(_priceController.text) ?? 0,
        'priceUnit': _purpose == 'RENT' ? 'Per Month' : 'Total',
        'priceNegotiable': true,
        'areaSqFt': num.tryParse(_areaController.text) ?? 0,
        'bedrooms': _bedrooms,
        'bathrooms': _bathrooms,
        'balconies': _balconies,
        'furnishing': _furnishing,
        'possessionStatus': _possessionStatus,
        'facing': _facing,
        'floor': _floor,
        'totalFloors': _totalFloors,
        'localityName': _localityName,
        'address': _addressController.text.trim(),
        'pincode': _pincodeController.text.trim(),
        'amenities': _amenities,
        'images': _images.map((url) => {'url': url, 'caption': 'Property Photo'}).toList(),
      };

      await ApiClient().dio.post('/properties', data: payload);

      setState(() {
        _loading = false;
        _success = true;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = 'Failed to submit property. Please ensure all fields are correct.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_success) {
      return Scaffold(
        backgroundColor: AppColors.ivory,
        appBar: AppBar(title: const Text('Submission Success')),
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
                  const Icon(Icons.check_circle, color: AppColors.verifiedGreen, size: 54),
                  const SizedBox(height: 14),
                  Text(
                    'Listing Submitted for Verification',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.navy),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your listing has been submitted to Nagpur Realty compliance moderators. It will go LIVE upon MahaRERA and title verification.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted, height: 1.4),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const MyPropertiesScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.navy,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                    child: const Text('View In My Listings'),
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
          'Post Property Free',
          style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          // Step Progress Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStepPill(1, 'Basic Info'),
                _buildStepPill(2, 'Specs'),
                _buildStepPill(3, 'Location'),
                _buildStepPill(4, 'Media'),
                _buildStepPill(5, 'Review'),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.beige),

          if (_error.isNotEmpty)
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Text(_error, style: GoogleFonts.inter(fontSize: 12, color: AppColors.errorRed)),
            ),

          // Steps Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: _buildStepContent(),
            ),
          ),

          // Bottom Navigation Buttons
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.beige)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  if (_currentStep > 1)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _currentStep--),
                        child: const Text('Back'),
                      ),
                    ),
                  if (_currentStep > 1) const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _loading
                          ? null
                          : () {
                              if (_currentStep < 5) {
                                setState(() => _currentStep++);
                              } else {
                                _submitProperty();
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.navy,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text(_currentStep < 5 ? 'Continue →' : 'Submit Property for Verification'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepPill(int step, String label) {
    final isActive = _currentStep == step;
    final isDone = _currentStep > step;

    return Column(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDone
                ? AppColors.verifiedGreen
                : isActive
                    ? AppColors.navy
                    : AppColors.ivoryDark,
          ),
          child: Center(
            child: isDone
                ? const Icon(Icons.check, size: 16, color: Colors.white)
                : Text(
                    '$step',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isActive ? Colors.white : AppColors.charcoalMuted,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 9.5,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? AppColors.navy : AppColors.charcoalMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 1:
        return _buildStep1BasicInfo();
      case 2:
        return _buildStep2Details();
      case 3:
        return _buildStep3Location();
      case 4:
        return _buildStep4Media();
      case 5:
        return _buildStep5Review();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildStep1BasicInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Purpose', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Row(
          children: [
            _buildChoiceChip('Sell (For Sale)', _purpose == 'BUY', () => setState(() => _purpose = 'BUY')),
            const SizedBox(width: 10),
            _buildChoiceChip('Rent (For Lease)', _purpose == 'RENT', () => setState(() => _purpose = 'RENT')),
          ],
        ),
        const SizedBox(height: 16),

        Text('Category', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Row(
          children: [
            _buildChoiceChip('Residential', _category == 'RESIDENTIAL', () => setState(() => _category = 'RESIDENTIAL')),
            const SizedBox(width: 8),
            _buildChoiceChip('Commercial', _category == 'COMMERCIAL', () => setState(() => _category = 'COMMERCIAL')),
            const SizedBox(width: 8),
            _buildChoiceChip('Plot / Land', _category == 'PLOT', () => setState(() => _category = 'PLOT')),
          ],
        ),
        const SizedBox(height: 16),

        Text('Property Title', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextField(
          controller: _titleController,
          decoration: const InputDecoration(hintText: 'e.g. 3 BHK Luxury Apartment in Dharampeth'),
        ),
        const SizedBox(height: 16),

        Text('Property Description', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextField(
          controller: _descController,
          maxLines: 4,
          decoration: const InputDecoration(hintText: 'Detailed description of the property, features and surroundings...'),
        ),
      ],
    );
  }

  Widget _buildStep2Details() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Price (₹)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(controller: _priceController, keyboardType: TextInputType.number),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Area (Sq.Ft)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(controller: _areaController, keyboardType: TextInputType.number),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Bedrooms (BHK)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<int>(
                    value: _bedrooms,
                    items: [1, 2, 3, 4, 5].map((b) => DropdownMenuItem(value: b, child: Text('$b BHK'))).toList(),
                    onChanged: (v) => setState(() => _bedrooms = v ?? 3),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Bathrooms', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<int>(
                    value: _bathrooms,
                    items: [1, 2, 3, 4].map((b) => DropdownMenuItem(value: b, child: Text('$b Baths'))).toList(),
                    onChanged: (v) => setState(() => _bathrooms = v ?? 2),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Furnishing', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _furnishing,
                    items: const [
                      DropdownMenuItem(value: 'UNFURNISHED', child: Text('Unfurnished')),
                      DropdownMenuItem(value: 'SEMI_FURNISHED', child: Text('Semi-Furnished')),
                      DropdownMenuItem(value: 'FULLY_FURNISHED', child: Text('Fully Furnished')),
                    ],
                    onChanged: (v) => setState(() => _furnishing = v ?? 'SEMI_FURNISHED'),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Facing', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _facing,
                    items: const [
                      DropdownMenuItem(value: 'EAST', child: Text('East')),
                      DropdownMenuItem(value: 'WEST', child: Text('West')),
                      DropdownMenuItem(value: 'NORTH', child: Text('North')),
                      DropdownMenuItem(value: 'SOUTH', child: Text('South')),
                    ],
                    onChanged: (v) => setState(() => _facing = v ?? 'EAST'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStep3Location() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Nagpur Locality', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _localityName,
          items: _nagpurLocalities
              .map((l) => DropdownMenuItem(value: l, child: Text(l)))
              .toList(),
          onChanged: (v) => setState(() => _localityName = v ?? 'Dharampeth'),
        ),
        const SizedBox(height: 16),

        Text('Street Address', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextField(
          controller: _addressController,
          decoration: const InputDecoration(hintText: 'e.g. Near Coffee House, West High Court Road'),
        ),
        const SizedBox(height: 16),

        Text('Pincode', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextField(
          controller: _pincodeController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: const InputDecoration(hintText: '440010', counterText: ''),
        ),
      ],
    );
  }

  Widget _buildStep4Media() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Property Photographs', style: GoogleFonts.playfairDisplay(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text('Add image URLs for this property listing', style: GoogleFonts.inter(fontSize: 11, color: AppColors.charcoalMuted)),
        const SizedBox(height: 14),

        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _newImageController,
                decoration: const InputDecoration(hintText: 'https://images.unsplash.com/...'),
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () {
                final url = _newImageController.text.trim();
                if (url.isNotEmpty) {
                  setState(() {
                    _images.add(url);
                    _newImageController.clear();
                  });
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.gold),
              child: const Text('Add'),
            ),
          ],
        ),
        const SizedBox(height: 16),

        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _images.length,
          itemBuilder: (context, index) {
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.beige),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Image.network(_images[index], width: 50, height: 50, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.image)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(_images[index], maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.errorRed),
                    onPressed: () => setState(() => _images.removeAt(index)),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildStep5Review() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Review Listing Details', style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
        const SizedBox(height: 14),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.beige),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_titleController.text, style: GoogleFonts.playfairDisplay(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('$_localityName, Nagpur - ${_pincodeController.text}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted)),
              const SizedBox(height: 12),
              const Divider(color: AppColors.beige),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Price:'),
                  Text('₹ ${_priceController.text}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Built-up Area:'),
                  Text('${_areaController.text} Sq.Ft', style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Configuration:'),
                  Text('$_bedrooms BHK • $_bathrooms Baths', style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Furnishing:'),
                  Text(_furnishing.replaceAll('_', ' '), style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildChoiceChip(String label, bool isSelected, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.navy : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isSelected ? AppColors.navy : AppColors.beige),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11.5,
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
