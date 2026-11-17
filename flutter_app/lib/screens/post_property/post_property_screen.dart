import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/services/upload_service.dart';
import '../../core/widgets/app_network_image.dart';
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

  final List<String> _images = [];

  final ImagePicker _picker = ImagePicker();
  bool _isUploadingImage = false;
  String _uploadStatusText = '';
  bool _showManualUrlInput = false;

  Future<void> _pickAndUploadImage(ImageSource source) async {
    try {
      final XFile? picked = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );
      if (picked == null) return;

      setState(() {
        _isUploadingImage = true;
        _uploadStatusText = 'Uploading photo to AWS S3 & CloudFront CDN...';
      });

      final url = await UploadService.uploadImage(File(picked.path));

      setState(() {
        _images.add(url);
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Photo uploaded to CloudFront CDN successfully!'),
            backgroundColor: AppColors.primaryGreen,
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload failed: $e'),
            backgroundColor: AppColors.errorRed,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploadingImage = false;
          _uploadStatusText = '';
        });
      }
    }
  }

  Future<void> _pickAndUploadMultipleGallery() async {
    try {
      final List<XFile> pickedList = await _picker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );
      if (pickedList.isEmpty) return;

      setState(() {
        _isUploadingImage = true;
        _uploadStatusText = 'Uploading ${pickedList.length} photos to AWS S3 & CloudFront CDN...';
      });

      final files = pickedList.map((x) => File(x.path)).toList();
      final urls = await UploadService.uploadMultipleImages(
        files,
        onProgress: (current, total) {
          if (mounted) {
            setState(() {
              _uploadStatusText = 'Uploading $current of $total photos to CloudFront CDN...';
            });
          }
        },
      );

      setState(() {
        _images.addAll(urls);
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${urls.length} photos uploaded to CloudFront CDN successfully!'),
            backgroundColor: AppColors.primaryGreen,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload failed: $e'),
            backgroundColor: AppColors.errorRed,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploadingImage = false;
          _uploadStatusText = '';
        });
      }
    }
  }

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
        'coverImage': _images.isNotEmpty ? _images.first : '',
        'images': _images.asMap().entries.map((entry) => {
          'url': entry.value,
          'caption': entry.key == 0 ? 'Cover Photo' : 'Property Photo ${entry.key + 1}',
          'isCover': entry.key == 0,
        }).toList(),
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
        backgroundColor: AppColors.mainBackground,
        appBar: AppBar(
          backgroundColor: AppColors.primaryGreen,
          elevation: 0,
          title: const Text('Submission Success', style: TextStyle(color: Colors.white)),
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
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 54),
                  const SizedBox(height: 14),
                  Text(
                    'Listing Submitted for Verification',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 19, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your listing has been submitted to Nagpur Realty compliance moderators. It will go LIVE upon MahaRERA and title verification.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText, height: 1.4),
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
                      backgroundColor: AppColors.primaryGreen,
                      foregroundColor: Colors.white,
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
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          'Post Property Free',
          style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // Step Progress Bar (Zameen Green Style)
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
          const Divider(height: 1, color: AppColors.borderGrey),

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
            padding: EdgeInsets.fromLTRB(
              16,
              12,
              16,
              12 + MediaQuery.of(context).padding.bottom,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.borderGrey)),
            ),
            child: Row(
                children: [
                  if (_currentStep > 1)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _currentStep--),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.borderGrey),
                        ),
                        child: const Text('Back', style: TextStyle(color: AppColors.primaryText)),
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
                          : Text(
                              _currentStep < 5 ? 'Continue →' : 'Submit Property for Verification',
                              style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                ],
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
                ? AppColors.primaryGreen
                : isActive
                    ? AppColors.primaryGreen
                    : AppColors.lightGrey,
            border: Border.all(
              color: isActive || isDone ? AppColors.primaryGreen : AppColors.borderGrey,
            ),
          ),
          child: Center(
            child: isDone
                ? const Icon(Icons.check, size: 16, color: Colors.white)
                : Text(
                    '$step',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isActive ? Colors.white : AppColors.secondaryText,
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
            color: isActive ? AppColors.primaryGreen : AppColors.secondaryText,
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
        Text('Purpose', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
        const SizedBox(height: 6),
        Row(
          children: [
            _buildChoiceChip('Sell (For Sale)', _purpose == 'BUY', () => setState(() => _purpose = 'BUY')),
            const SizedBox(width: 10),
            _buildChoiceChip('Rent (For Lease)', _purpose == 'RENT', () => setState(() => _purpose = 'RENT')),
          ],
        ),
        const SizedBox(height: 16),

        Text('Category', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
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

        Text('Property Title', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
        const SizedBox(height: 6),
        TextField(
          controller: _titleController,
          decoration: const InputDecoration(
            hintText: 'e.g. 3 BHK Luxury Apartment in Dharampeth',
            fillColor: AppColors.lightGrey,
            filled: true,
          ),
        ),
        const SizedBox(height: 16),

        Text('Property Description', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
        const SizedBox(height: 6),
        TextField(
          controller: _descController,
          maxLines: 4,
          decoration: const InputDecoration(
            hintText: 'Detailed description of the property, features and surroundings...',
            fillColor: AppColors.lightGrey,
            filled: true,
          ),
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
                  Text('Price (₹)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _priceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(fillColor: AppColors.lightGrey, filled: true),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Area (Sq.Ft)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _areaController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(fillColor: AppColors.lightGrey, filled: true),
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
                  Text('Bedrooms (BHK)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<int>(
                    value: _bedrooms,
                    decoration: const InputDecoration(fillColor: AppColors.lightGrey, filled: true),
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
                  Text('Bathrooms', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<int>(
                    value: _bathrooms,
                    decoration: const InputDecoration(fillColor: AppColors.lightGrey, filled: true),
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
                  Text('Furnishing', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _furnishing,
                    decoration: const InputDecoration(fillColor: AppColors.lightGrey, filled: true),
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
                  Text('Facing', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _facing,
                    decoration: const InputDecoration(fillColor: AppColors.lightGrey, filled: true),
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
        Text('Nagpur Locality', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _localityName,
          decoration: const InputDecoration(fillColor: AppColors.lightGrey, filled: true),
          items: _nagpurLocalities
              .map((l) => DropdownMenuItem(value: l, child: Text(l)))
              .toList(),
          onChanged: (v) => setState(() => _localityName = v ?? 'Dharampeth'),
        ),
        const SizedBox(height: 16),

        Text('Street Address', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
        const SizedBox(height: 6),
        TextField(
          controller: _addressController,
          decoration: const InputDecoration(
            hintText: 'e.g. Near Coffee House, West High Court Road',
            fillColor: AppColors.lightGrey,
            filled: true,
          ),
        ),
        const SizedBox(height: 16),

        Text('Pincode', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
        const SizedBox(height: 6),
        TextField(
          controller: _pincodeController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: const InputDecoration(
            hintText: '440010',
            counterText: '',
            fillColor: AppColors.lightGrey,
            filled: true,
          ),
        ),
      ],
    );
  }

  Widget _buildStep4Media() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Property Photographs',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryText,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'High-quality photos get 5x more buyer leads',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.lightGreen,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.cloud_done_outlined, size: 14, color: AppColors.primaryGreen),
                  const SizedBox(width: 4),
                  Text(
                    'AWS S3 + CDN',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryGreen,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Primary Upload Box (AWS S3 & CloudFront CDN)
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.lightGreen.withOpacity(0.5),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.primaryGreen.withOpacity(0.4),
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryGreen.withOpacity(0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.cloud_upload_outlined,
                  size: 30,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Upload Real Property Photos',
                style: GoogleFonts.inter(
                  fontSize: 14.5,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Direct upload from your camera or gallery • Stored securely on AWS S3 & CloudFront CDN',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: AppColors.secondaryText,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 16),

              // Action Buttons: Camera & Gallery
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isUploadingImage ? null : () => _pickAndUploadImage(ImageSource.camera),
                      icon: const Icon(Icons.camera_alt_outlined, size: 18, color: AppColors.primaryGreen),
                      label: Text(
                        'Take Photo',
                        style: GoogleFonts.inter(
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.primaryGreen, width: 1.5),
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _isUploadingImage ? null : _pickAndUploadMultipleGallery,
                      icon: const Icon(Icons.photo_library_outlined, size: 18, color: Colors.white),
                      label: Text(
                        'Choose Gallery',
                        style: GoogleFonts.inter(
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Uploading Progress Indicator Banner
        if (_isUploadingImage) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.primaryGreen),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryGreen.withOpacity(0.08),
                  blurRadius: 8,
                ),
              ],
            ),
            child: Row(
              children: [
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: AppColors.primaryGreen,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _uploadStatusText,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryGreen,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 20),

        // Uploaded Images List Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Property Gallery (${_images.length} photos)',
              style: GoogleFonts.inter(
                fontSize: 13.5,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryText,
              ),
            ),
            Text(
              '1st photo is Cover',
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
            ),
          ],
        ),
        const SizedBox(height: 10),

        if (_images.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.borderGrey),
            ),
            child: Column(
              children: [
                Icon(Icons.image_not_supported_outlined, size: 36, color: Colors.grey.shade400),
                const SizedBox(height: 8),
                Text(
                  'No photos uploaded yet',
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                ),
                const SizedBox(height: 4),
                Text(
                  'Tap "Take Photo" or "Choose Gallery" above',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.primaryGreen, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _images.length,
            itemBuilder: (context, index) {
              final isCover = index == 0;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isCover ? AppColors.primaryGreen : AppColors.borderGrey,
                    width: isCover ? 1.5 : 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: AppNetworkImage(
                            imageUrl: _images[index],
                            width: 64,
                            height: 64,
                            fit: BoxFit.cover,
                          ),
                        ),
                        if (isCover)
                          Positioned(
                            top: 0,
                            left: 0,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: const BoxDecoration(
                                color: AppColors.primaryGreen,
                                borderRadius: BorderRadius.only(
                                  topLeft: Radius.circular(8),
                                  bottomRight: Radius.circular(6),
                                ),
                              ),
                              child: Text(
                                'COVER',
                                style: GoogleFonts.inter(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.lightGreen,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  isCover ? 'Cover Photo' : 'Photo ${index + 1}',
                                  style: GoogleFonts.inter(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primaryGreen,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.lightGrey,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'CloudFront CDN',
                                  style: GoogleFonts.inter(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.secondaryText,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _images[index],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.errorRed),
                      tooltip: 'Remove Photo',
                      onPressed: () => setState(() => _images.removeAt(index)),
                    ),
                  ],
                ),
              );
            },
          ),

        const SizedBox(height: 16),

        // Optional Manual Link Toggle
        InkWell(
          onTap: () => setState(() => _showManualUrlInput = !_showManualUrlInput),
          borderRadius: BorderRadius.circular(6),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              children: [
                Icon(
                  _showManualUrlInput ? Icons.keyboard_arrow_down : Icons.keyboard_arrow_right,
                  size: 18,
                  color: AppColors.secondaryText,
                ),
                const SizedBox(width: 4),
                Text(
                  'Or paste an external image URL manually',
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    color: AppColors.secondaryText,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ],
            ),
          ),
        ),

        if (_showManualUrlInput) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _newImageController,
                  decoration: InputDecoration(
                    hintText: 'https://...',
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    fillColor: AppColors.lightGrey,
                    filled: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: AppColors.borderGrey),
                    ),
                  ),
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
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                child: const Text('Add Link'),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildStep5Review() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Review Listing Details', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
        const SizedBox(height: 14),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
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
              Text(_titleController.text, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
              const SizedBox(height: 4),
              Text('$_localityName, Nagpur - ${_pincodeController.text}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText)),
              const SizedBox(height: 12),
              const Divider(color: AppColors.borderGrey),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Price:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText)),
                  Text('₹ ${_priceController.text}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryGreen, fontSize: 14)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Built-up Area:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText)),
                  Text('${_areaController.text} Sq.Ft', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryText, fontSize: 13)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Configuration:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText)),
                  Text('$_bedrooms BHK • $_bathrooms Baths', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryText, fontSize: 13)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Furnishing:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText)),
                  Text(_furnishing.replaceAll('_', ' '), style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryText, fontSize: 13)),
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
            color: isSelected ? AppColors.lightGreen : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isSelected ? AppColors.primaryGreen : AppColors.borderGrey, width: isSelected ? 1.5 : 1),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? AppColors.primaryGreen : AppColors.primaryText,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
