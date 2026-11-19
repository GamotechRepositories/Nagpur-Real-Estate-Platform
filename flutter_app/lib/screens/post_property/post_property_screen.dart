import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/services/upload_service.dart';
import '../../core/widgets/app_network_image.dart';
import '../../models/project_model.dart';
import '../../providers/property_provider.dart';
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

  // 16 Nagpur Localities (Matching Admin NAGPUR_LOCALITIES exactly)
  final List<String> _nagpurLocalities = const [
    'Dharampeth',
    'Ramdaspeth',
    'Civil Lines',
    'Wardha Road',
    'Manish Nagar',
    'Besa',
    'Shankar Nagar',
    'Pratap Nagar',
    'Laxmi Nagar',
    'Hingna Road',
    'Khamla',
    'Sadar',
    'Sitabuldi',
    'Trimurti Nagar',
    'Narendra Nagar',
    'Koradi Road',
  ];

  // Available Projects for dropdown (matching admin projects dropdown)
  List<ProjectModel> _projectsList = [];
  String _selectedProjectId = '';

  // Step 1: Basic Information
  final _titleController = TextEditingController(text: '3 BHK Apartment in Dharampeth');
  String _purpose = 'BUY'; // 'BUY' | 'RENT'
  String _category = 'RESIDENTIAL'; // 'RESIDENTIAL' | 'COMMERCIAL' | 'PLOT' | 'AGRICULTURAL'
  String _subtype = 'FLAT'; // 'FLAT' | 'HOUSE_VILLA' | 'PLOT' | 'COMMERCIAL_SHOP' | 'COMMERCIAL_OFFICE' | 'PENTHOUSE'
  final _descController = TextEditingController(
    text: 'Spacious high-rise flat with panoramic city views, modern fittings, 24-hr water supply, and dedicated covered car parking.',
  );

  // Step 2: Pricing & Specs
  final _priceController = TextEditingController(text: '7500000');
  bool _priceNegotiable = false;
  final _areaController = TextEditingController(text: '1450');
  int _bedrooms = 2;
  int _bathrooms = 2;
  int _balconies = 1;
  int _floor = 2;
  int _totalFloors = 5;
  String _furnishing = 'SEMI_FURNISHED'; // 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED'
  String _possessionStatus = 'READY_TO_MOVE'; // 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION'
  String _facing = 'EAST';

  final List<String> _allAmenities = const [
    'Power Backup',
    'Lift',
    'Security Personnel',
    'Car Parking',
    'Gymnasium',
    'Swimming Pool',
    'Clubhouse',
    'Water Storage',
    'Park / Garden',
    'Intercom Facility',
  ];
  final List<String> _amenities = [
    'Power Backup',
    'Lift',
    'Security Personnel',
    'Car Parking',
  ];

  // Step 3: Location & Verification
  String _localityName = 'Dharampeth';
  final _pincodeController = TextEditingController(text: '440010');
  final _addressController = TextEditingController(text: 'Near Coffee House, West High Court Road');
  final _reraController = TextEditingController();

  // Step 4: Photos & Media (AWS S3 + CloudFront Ready)
  final List<String> _photos = [];
  String _floorPlanUrl = '';
  final ImagePicker _picker = ImagePicker();
  bool _isUploadingImage = false;
  String _uploadStatusText = '';
  bool _showManualUrlInput = false;
  final _manualUrlController = TextEditingController();
  final _manualFloorPlanController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProjects();
  }

  Future<void> _fetchProjects() async {
    try {
      final res = await ApiClient().dio.get('/projects?limit=100');
      final rawList = res.data?['data'] as List<dynamic>? ?? [];
      final parsed = rawList
          .map((p) => ProjectModel.fromJson(p as Map<String, dynamic>))
          .toList();

      if (mounted) {
        setState(() {
          _projectsList = parsed;
        });
      }
    } catch (_) {
      if (mounted) {
        final prov = Provider.of<PropertyProvider>(context, listen: false);
        setState(() {
          _projectsList = prov.projects;
        });
      }
    }
  }

  void _onProjectSelected(String? projId) {
    setState(() {
      _selectedProjectId = projId ?? '';
      if (_selectedProjectId.isNotEmpty) {
        final selProj = _projectsList.firstWhere(
          (p) => p.id == _selectedProjectId,
          orElse: () => ProjectModel(id: '', name: '', slug: '', image: ''),
        );
        if (selProj.id.isNotEmpty) {
          if (_nagpurLocalities.contains(selProj.localityName)) {
            _localityName = selProj.localityName;
          }
          if (selProj.pincode.isNotEmpty) {
            _pincodeController.text = selProj.pincode;
          }
          if (selProj.reraNumber.isNotEmpty) {
            _reraController.text = selProj.reraNumber;
          }
          if (selProj.address.isNotEmpty) {
            _addressController.text = selProj.address;
          } else {
            _addressController.text = '${selProj.name}, ${selProj.localityName}';
          }
        }
      }
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _areaController.dispose();
    _pincodeController.dispose();
    _addressController.dispose();
    _reraController.dispose();
    _manualUrlController.dispose();
    _manualFloorPlanController.dispose();
    super.dispose();
  }

  // Gallery Photos Upload (Camera & Multi-Gallery via AWS S3 / CloudFront)
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

      final url = await UploadService.uploadImage(File(picked.path), folder: 'properties');

      setState(() {
        _photos.add(url);
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
        folder: 'properties',
        onProgress: (current, total) {
          if (mounted) {
            setState(() {
              _uploadStatusText = 'Uploading $current of $total photos to CloudFront CDN...';
            });
          }
        },
      );

      setState(() {
        _photos.addAll(urls);
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

  // Floor Plan Upload (Single via AWS S3 / CloudFront)
  Future<void> _pickAndUploadFloorPlan(ImageSource source) async {
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
        _uploadStatusText = 'Uploading floor plan to CloudFront CDN...';
      });

      final url = await UploadService.uploadImage(File(picked.path), folder: 'floorplans');

      setState(() {
        _floorPlanUrl = url;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Floor plan uploaded successfully!'),
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
            content: Text('Floor plan upload failed: $e'),
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

  // Set selected photo as Cover Photo (index 0)
  void _makeCoverPhoto(int index) {
    if (index <= 0 || index >= _photos.length) return;
    setState(() {
      final photo = _photos.removeAt(index);
      _photos.insert(0, photo);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Set as primary Cover Photo!'),
        backgroundColor: AppColors.primaryGreen,
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 1),
      ),
    );
  }

  // Validation before step transition
  bool _validateStep(int step) {
    setState(() => _error = '');
    if (step == 1) {
      if (_titleController.text.trim().isEmpty) {
        setState(() => _error = 'Please enter a property title.');
        return false;
      }
      if (_descController.text.trim().isEmpty) {
        setState(() => _error = 'Please enter a property description.');
        return false;
      }
    } else if (step == 2) {
      final price = num.tryParse(_priceController.text);
      if (price == null || price <= 0) {
        setState(() => _error = 'Please enter a valid price in INR.');
        return false;
      }
      final area = num.tryParse(_areaController.text);
      if (area == null || area <= 0) {
        setState(() => _error = 'Please enter super built-up area in Sq.Ft.');
        return false;
      }
    } else if (step == 3) {
      if (_addressController.text.trim().isEmpty) {
        setState(() => _error = 'Please enter street address / landmark.');
        return false;
      }
      final pin = _pincodeController.text.trim();
      if (pin.isEmpty || pin.length != 6) {
        setState(() => _error = 'Please enter a valid 6-digit Nagpur pincode.');
        return false;
      }
    }
    return true;
  }

  // Final Submission matching Admin payload exactly
  Future<void> _submitProperty() async {
    if (!_validateStep(1) || !_validateStep(2) || !_validateStep(3)) return;

    setState(() {
      _loading = true;
      _error = '';
    });

    final cleanTitle = _titleController.text.trim();
    final cleanAddress = _addressController.text.trim().isNotEmpty
        ? _addressController.text.trim()
        : '$_localityName, Nagpur';
    final cleanDescription = _descController.text.trim().isNotEmpty
        ? _descController.text.trim()
        : '$cleanTitle located in $_localityName, Nagpur.';

    // Matches Admin AddPropertyPage.jsx payload EXACTLY
    final payload = {
      'title': cleanTitle,
      'purpose': _purpose,
      'category': _category,
      'subtype': _subtype,
      'project': _selectedProjectId.isNotEmpty ? _selectedProjectId : null,
      'description': cleanDescription,
      'price': num.tryParse(_priceController.text) ?? 0,
      'priceUnit': _purpose == 'RENT' ? 'Per Month' : 'Total',
      'priceNegotiable': _priceNegotiable,
      'areaSqFt': num.tryParse(_areaController.text) ?? 0,
      'areaUnit': 'Sq.Ft',
      'bedrooms': _bedrooms,
      'bathrooms': _bathrooms,
      'balconies': _balconies,
      'floor': _floor,
      'totalFloors': _totalFloors,
      'furnishing': _furnishing,
      'possessionStatus': _possessionStatus,
      'propertyAge': 'New',
      'facing': _facing,
      'amenities': _amenities,
      'reraNumber': _reraController.text.trim(),
      'address': cleanAddress,
      'localityName': _localityName,
      'pincode': _pincodeController.text.trim().isNotEmpty ? _pincodeController.text.trim() : '440010',
      'latitude': 21.1458,
      'longitude': 79.0882,
      'coverImage': _photos.isNotEmpty ? _photos.first : '',
      'images': _photos.asMap().entries.map((entry) => {
        'url': entry.value,
        'isCover': entry.key == 0,
        'caption': entry.key == 0 ? 'Cover Photo' : 'Property Photo ${entry.key + 1}',
      }).toList(),
      'floorPlanUrl': _floorPlanUrl.trim(),
    };

    try {
      await ApiClient().dio.post('/properties', data: payload);

      if (mounted) {
        setState(() {
          _loading = false;
          _success = true;
        });
      }
    } on DioException catch (e) {
      if (mounted) {
        final data = e.response?.data;
        String msg = 'Failed to submit property. Please verify your inputs.';
        if (data != null && data['details'] is List) {
          final list = (data['details'] as List)
              .map((d) => '${d['field'] ?? d['path']}: ${d['message']}')
              .join(' • ');
          msg = 'Validation Error: $list';
        } else if (data != null && data['message'] != null) {
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
          title: Text(
            'Submission Success',
            style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
          ),
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
                  Container(
                    width: 68,
                    height: 68,
                    decoration: const BoxDecoration(
                      color: AppColors.lightGreen,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 48),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Property Created Successfully',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your listing has been submitted for verification. It will be verified and published on Nagpur Realty.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.secondaryText, height: 1.4),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const MyPropertiesScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                      ),
                      child: Text(
                        'View in My Listings',
                        style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13.5),
                      ),
                    ),
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
          'Add Property',
          style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // Step Progress Bar (Zameen Green Style)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStepPill(1, 'Basic Info'),
                _buildStepPill(2, 'Pricing & Specs'),
                _buildStepPill(3, 'Location'),
                _buildStepPill(4, 'Media'),
                _buildStepPill(5, 'Review'),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderGrey),

          // Error Banner if any
          if (_error.isNotEmpty)
            Container(
              margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
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
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.errorRed),
                    ),
                  ),
                ],
              ),
            ),

          // Scrollable Steps Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: _buildStepContent(),
            ),
          ),

          // Bottom Action Navigation Bar
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
                    flex: 1,
                    child: OutlinedButton(
                      onPressed: () => setState(() {
                        _error = '';
                        _currentStep--;
                      }),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.borderGrey),
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(
                        'Back',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: AppColors.primaryText,
                        ),
                      ),
                    ),
                  ),
                if (_currentStep > 1) const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _loading
                        ? null
                        : () {
                            if (_validateStep(_currentStep)) {
                              if (_currentStep < 5) {
                                setState(() => _currentStep++);
                              } else {
                                _submitProperty();
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                    child: _loading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            _currentStep < 5 ? 'Continue →' : 'Save Property',
                            style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13.5),
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
            color: isDone || isActive ? AppColors.primaryGreen : AppColors.lightGrey,
            border: Border.all(
              color: isDone || isActive ? AppColors.primaryGreen : AppColors.borderGrey,
            ),
          ),
          child: Center(
            child: isDone
                ? const Icon(Icons.check, size: 15, color: Colors.white)
                : Text(
                    '$step',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                      color: isActive ? Colors.white : AppColors.secondaryText,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 3),
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
        return _buildStep2PricingAndSpecs();
      case 3:
        return _buildStep3LocationAndVerification();
      case 4:
        return _buildStep4Media();
      case 5:
        return _buildStep5Review();
      default:
        return const SizedBox.shrink();
    }
  }

  // ==========================================
  // STEP 1: BASIC INFORMATION (Matching Admin)
  // ==========================================
  Widget _buildStep1BasicInfo() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Basic Information',
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 14),

          // Property Title *
          _buildFieldLabel('Property Title *'),
          const SizedBox(height: 6),
          TextField(
            controller: _titleController,
            decoration: _inputDecoration('e.g. 3 BHK Apartment in Dharampeth'),
          ),
          const SizedBox(height: 16),

          // Purpose * (BUY / RENT)
          _buildFieldLabel('Purpose *'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _purpose,
            isExpanded: true,
            decoration: _inputDecoration('Select Purpose'),
            items: const [
              DropdownMenuItem(value: 'BUY', child: Text('Buy / Sale')),
              DropdownMenuItem(value: 'RENT', child: Text('Rent / Lease')),
            ],
            onChanged: (v) => setState(() => _purpose = v ?? 'BUY'),
          ),
          const SizedBox(height: 16),

          // Category * (RESIDENTIAL, COMMERCIAL, PLOT, AGRICULTURAL)
          _buildFieldLabel('Category *'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _category,
            isExpanded: true,
            decoration: _inputDecoration('Select Category'),
            items: const [
              DropdownMenuItem(value: 'RESIDENTIAL', child: Text('Residential')),
              DropdownMenuItem(value: 'COMMERCIAL', child: Text('Commercial')),
              DropdownMenuItem(value: 'PLOT', child: Text('Plot / Land')),
              DropdownMenuItem(value: 'AGRICULTURAL', child: Text('Agricultural')),
            ],
            onChanged: (v) => setState(() => _category = v ?? 'RESIDENTIAL'),
          ),
          const SizedBox(height: 16),

          // Subtype * (FLAT, HOUSE_VILLA, PLOT, COMMERCIAL_SHOP, COMMERCIAL_OFFICE, PENTHOUSE)
          _buildFieldLabel('Subtype *'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _subtype,
            isExpanded: true,
            decoration: _inputDecoration('Select Subtype'),
            items: const [
              DropdownMenuItem(value: 'FLAT', child: Text('Flat / Apartment')),
              DropdownMenuItem(value: 'HOUSE_VILLA', child: Text('Independent House / Villa')),
              DropdownMenuItem(value: 'PLOT', child: Text('Residential Plot')),
              DropdownMenuItem(value: 'COMMERCIAL_SHOP', child: Text('Commercial Shop')),
              DropdownMenuItem(value: 'COMMERCIAL_OFFICE', child: Text('Office Space')),
              DropdownMenuItem(value: 'PENTHOUSE', child: Text('Penthouse')),
            ],
            onChanged: (v) => setState(() => _subtype = v ?? 'FLAT'),
          ),
          const SizedBox(height: 16),

          // Description *
          _buildFieldLabel('Description *'),
          const SizedBox(height: 6),
          TextField(
            controller: _descController,
            maxLines: 4,
            decoration: _inputDecoration('Describe key highlights, floor layout, amenities, nearby points...'),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 2: PRICING & SPECS (Matching Admin)
  // ==========================================
  Widget _buildStep2PricingAndSpecs() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pricing & Specs',
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 14),

          // Total Price & Price Negotiable
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Total Price (INR ₹) *'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _priceController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('e.g. 7500000'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Negotiable?'),
                    const SizedBox(height: 6),
                    Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: AppColors.lightGrey,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.borderGrey),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _priceNegotiable ? 'Yes' : 'No',
                            style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold),
                          ),
                          Switch(
                            value: _priceNegotiable,
                            activeColor: AppColors.primaryGreen,
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            onChanged: (val) => setState(() => _priceNegotiable = val),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Super Built-up Area
          _buildFieldLabel('Super Built-up Area (Sq.Ft) *'),
          const SizedBox(height: 6),
          TextField(
            controller: _areaController,
            keyboardType: TextInputType.number,
            decoration: _inputDecoration('e.g. 1450'),
          ),
          const SizedBox(height: 16),

          // Bedrooms, Bathrooms, Balconies (3 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Bedrooms'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<int>(
                      value: _bedrooms,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: [0, 1, 2, 3, 4, 5, 6].map((b) => DropdownMenuItem(value: b, child: Text('$b'))).toList(),
                      onChanged: (v) => setState(() => _bedrooms = v ?? 2),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Bathrooms'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<int>(
                      value: _bathrooms,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: [0, 1, 2, 3, 4, 5].map((b) => DropdownMenuItem(value: b, child: Text('$b'))).toList(),
                      onChanged: (v) => setState(() => _bathrooms = v ?? 2),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Balconies'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<int>(
                      value: _balconies,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: [0, 1, 2, 3, 4].map((b) => DropdownMenuItem(value: b, child: Text('$b'))).toList(),
                      onChanged: (v) => setState(() => _balconies = v ?? 1),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Floor & Total Floors (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Floor Number'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<int>(
                      value: _floor,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: List.generate(31, (i) => i).map((f) => DropdownMenuItem(value: f, child: Text('$f'))).toList(),
                      onChanged: (v) => setState(() => _floor = v ?? 2),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Total Floors'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<int>(
                      value: _totalFloors,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: List.generate(40, (i) => i + 1).map((f) => DropdownMenuItem(value: f, child: Text('$f'))).toList(),
                      onChanged: (v) => setState(() => _totalFloors = v ?? 5),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Furnishing (Full Width Dropdown)
          _buildFieldLabel('Furnishing'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _furnishing,
            isExpanded: true,
            decoration: _inputDecoration(''),
            items: const [
              DropdownMenuItem(value: 'UNFURNISHED', child: Text('Unfurnished')),
              DropdownMenuItem(value: 'SEMI_FURNISHED', child: Text('Semi Furnished')),
              DropdownMenuItem(value: 'FURNISHED', child: Text('Furnished')),
            ],
            onChanged: (v) => setState(() => _furnishing = v ?? 'SEMI_FURNISHED'),
          ),
          const SizedBox(height: 16),

          // Possession Status (Full Width Dropdown - Prevents Overflow)
          _buildFieldLabel('Possession Status'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _possessionStatus,
            isExpanded: true,
            decoration: _inputDecoration(''),
            items: const [
              DropdownMenuItem(value: 'READY_TO_MOVE', child: Text('Ready to Move')),
              DropdownMenuItem(value: 'UNDER_CONSTRUCTION', child: Text('Under Construction')),
            ],
            onChanged: (v) => setState(() => _possessionStatus = v ?? 'READY_TO_MOVE'),
          ),
          const SizedBox(height: 16),

          // Facing Direction (Full Width Dropdown)
          _buildFieldLabel('Facing Direction'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _facing,
            isExpanded: true,
            decoration: _inputDecoration(''),
            items: const [
              DropdownMenuItem(value: 'EAST', child: Text('East Facing')),
              DropdownMenuItem(value: 'WEST', child: Text('West Facing')),
              DropdownMenuItem(value: 'NORTH', child: Text('North Facing')),
              DropdownMenuItem(value: 'SOUTH', child: Text('South Facing')),
              DropdownMenuItem(value: 'NORTH_EAST', child: Text('North-East Facing')),
              DropdownMenuItem(value: 'NORTH_WEST', child: Text('North-West Facing')),
              DropdownMenuItem(value: 'SOUTH_EAST', child: Text('South-East Facing')),
              DropdownMenuItem(value: 'SOUTH_WEST', child: Text('South-West Facing')),
            ],
            onChanged: (v) => setState(() => _facing = v ?? 'EAST'),
          ),
          const SizedBox(height: 16),

          // Amenities Multi-Select
          _buildFieldLabel('Amenities & Facilities'),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _allAmenities.map((amenity) {
              final isSelected = _amenities.contains(amenity);
              return FilterChip(
                label: Text(amenity),
                selected: isSelected,
                selectedColor: AppColors.lightGreen,
                checkmarkColor: AppColors.primaryGreen,
                labelStyle: GoogleFonts.inter(
                  fontSize: 11.5,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? AppColors.primaryGreen : AppColors.primaryText,
                ),
                backgroundColor: AppColors.lightGrey,
                side: BorderSide(
                  color: isSelected ? AppColors.primaryGreen : AppColors.borderGrey,
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                onSelected: (bool selected) {
                  setState(() {
                    if (selected) {
                      _amenities.add(amenity);
                    } else {
                      _amenities.remove(amenity);
                    }
                  });
                },
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ===================================================
  // STEP 3: LOCATION & VERIFICATION (Matching Admin)
  // ===================================================
  Widget _buildStep3LocationAndVerification() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Location & Verification',
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 14),

          // Belongs to a Builder Project? (Optional) - Matching Admin!
          _buildFieldLabel('Belongs to a Builder Project? (Optional)'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _selectedProjectId,
            isExpanded: true,
            decoration: _inputDecoration(''),
            items: [
              const DropdownMenuItem(
                value: '',
                child: Text('None / Standalone Independent Property'),
              ),
              ..._projectsList.map((proj) => DropdownMenuItem(
                    value: proj.id,
                    child: Text(
                      '${proj.name} — ${proj.localityName} ${proj.reraNumber.isNotEmpty ? '(RERA: ${proj.reraNumber})' : ''}',
                      overflow: TextOverflow.ellipsis,
                    ),
                  )),
            ],
            onChanged: _onProjectSelected,
          ),
          if (_selectedProjectId.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.check_circle_outline, size: 14, color: AppColors.primaryGreen),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    'Linked to project: ${_projectsList.firstWhere((p) => p.id == _selectedProjectId, orElse: () => ProjectModel(id: '', name: '', slug: '', image: '')).name}',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.primaryGreen, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),

          // Locality * (16 Nagpur Localities) & Pincode *
          Row(
            children: [
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Locality *'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _localityName,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: _nagpurLocalities
                          .map((loc) => DropdownMenuItem(
                                value: loc,
                                child: Text(loc, overflow: TextOverflow.ellipsis),
                              ))
                          .toList(),
                      onChanged: (v) => setState(() => _localityName = v ?? 'Dharampeth'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Pincode *'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _pincodeController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      decoration: _inputDecoration('440010').copyWith(counterText: ''),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Address / Landmark *
          _buildFieldLabel('Address / Landmark *'),
          const SizedBox(height: 6),
          TextField(
            controller: _addressController,
            decoration: _inputDecoration('e.g. Flat 402, Royal Palms, West High Court Road'),
          ),
          const SizedBox(height: 16),

          // MahaRERA Registration Number (Optional)
          _buildFieldLabel('MahaRERA Registration Number (Optional)'),
          const SizedBox(height: 6),
          TextField(
            controller: _reraController,
            decoration: _inputDecoration('e.g. P50500012345'),
          ),
        ],
      ),
    );
  }

  // ===================================================
  // STEP 4: PHOTOS & MEDIA (AWS S3 + CloudFront CDN)
  // ===================================================
  Widget _buildStep4Media() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Gallery Photos Section
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderGrey),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Property Photos & Media',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryText,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Upload real property photos (Hall, Bedrooms, Kitchen, Elevation)',
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.lightGreen,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'AWS S3 + CDN',
                      style: GoogleFonts.inter(
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Upload Buttons Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.lightGreen.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.cloud_upload_outlined, size: 36, color: AppColors.primaryGreen),
                    const SizedBox(height: 8),
                    Text(
                      'Upload Property Photos',
                      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'JPG, PNG, or WEBP up to 10MB each. The first photo is the Cover Photo.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.secondaryText),
                    ),
                    const SizedBox(height: 14),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ElevatedButton.icon(
                          onPressed: _isUploadingImage ? null : () => _pickAndUploadImage(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt_outlined, size: 16),
                          label: const Text('Take Photo'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryGreen,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          onPressed: _isUploadingImage ? null : _pickAndUploadMultipleGallery,
                          icon: const Icon(Icons.photo_library_outlined, size: 16),
                          label: const Text('Choose Gallery'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.primaryGreen,
                            side: const BorderSide(color: AppColors.primaryGreen),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              if (_isUploadingImage) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.lightGreen,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryGreen),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _uploadStatusText,
                          style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 14),

              // Uploaded Photos List
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Uploaded Gallery (${_photos.length} photos)',
                    style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                  ),
                  Text(
                    '★ Tap star to set Cover',
                    style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.secondaryText),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (_photos.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  decoration: BoxDecoration(
                    color: AppColors.lightGrey,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.borderGrey),
                  ),
                  child: Center(
                    child: Text(
                      'No photos uploaded yet',
                      style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.secondaryText),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _photos.length,
                  itemBuilder: (context, index) {
                    final isCover = index == 0;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isCover ? AppColors.primaryGreen : AppColors.borderGrey,
                          width: isCover ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: AppNetworkImage(
                              imageUrl: _photos[index],
                              width: 54,
                              height: 54,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    if (isCover)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                        margin: const EdgeInsets.only(right: 6),
                                        decoration: BoxDecoration(
                                          color: AppColors.primaryGreen,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          'COVER PHOTO',
                                          style: GoogleFonts.inter(fontSize: 8.5, fontWeight: FontWeight.bold, color: Colors.white),
                                        ),
                                      ),
                                    Text(
                                      'Photo ${index + 1}',
                                      style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  _photos[index],
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 10, color: AppColors.secondaryText),
                                ),
                              ],
                            ),
                          ),
                          if (!isCover)
                            IconButton(
                              icon: const Icon(Icons.star_outline, size: 20, color: Colors.amber),
                              tooltip: 'Make Cover',
                              onPressed: () => _makeCoverPhoto(index),
                            ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.errorRed),
                            tooltip: 'Delete',
                            onPressed: () => setState(() => _photos.removeAt(index)),
                          ),
                        ],
                      ),
                    );
                  },
                ),

              const SizedBox(height: 10),
              // Optional Manual Image URL link
              InkWell(
                onTap: () => setState(() => _showManualUrlInput = !_showManualUrlInput),
                child: Row(
                  children: [
                    Icon(
                      _showManualUrlInput ? Icons.arrow_drop_down : Icons.arrow_right,
                      size: 18,
                      color: AppColors.secondaryText,
                    ),
                    Text(
                      'Or add external image URL',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText, decoration: TextDecoration.underline),
                    ),
                  ],
                ),
              ),
              if (_showManualUrlInput) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _manualUrlController,
                        decoration: _inputDecoration('https://...'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        final val = _manualUrlController.text.trim();
                        if (val.isNotEmpty) {
                          setState(() {
                            _photos.add(val);
                            _manualUrlController.clear();
                          });
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Add'),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Floor Plan Upload Section (Matching Admin 2D/3D Floor Plan)
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderGrey),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '2D / 3D Floor Plan (Optional)',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Upload approved floor plan or architectural layout image',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
              ),
              const SizedBox(height: 12),

              if (_floorPlanUrl.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.lightGreen,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: AppNetworkImage(
                          imageUrl: _floorPlanUrl,
                          width: 50,
                          height: 50,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Floor Plan Attached',
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _floorPlanUrl,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(fontSize: 10, color: AppColors.secondaryText),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.errorRed),
                        onPressed: () => setState(() => _floorPlanUrl = ''),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],

              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: _isUploadingImage ? null : () => _pickAndUploadFloorPlan(ImageSource.gallery),
                    icon: const Icon(Icons.upload_file_outlined, size: 16),
                    label: Text(_floorPlanUrl.isEmpty ? 'Upload Floor Plan' : 'Replace Floor Plan'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primaryGreen,
                      side: const BorderSide(color: AppColors.primaryGreen),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // STEP 5: REVIEW & SUMMARY (Matching Admin)
  // ==========================================
  Widget _buildStep5Review() {
    final selProj = _projectsList.firstWhere(
      (p) => p.id == _selectedProjectId,
      orElse: () => ProjectModel(id: '', name: '', slug: '', image: ''),
    );

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Review Listing Details',
                style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.lightGreen,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _purpose == 'BUY' ? 'For Sale' : 'For Rent',
                  style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Title
          Text(
            _titleController.text.trim(),
            style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText),
          ),
          const SizedBox(height: 4),
          Text(
            '${_addressController.text.trim()}, $_localityName, Nagpur - ${_pincodeController.text.trim()}',
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.borderGrey),
          const SizedBox(height: 10),

          // Pricing
          _buildReviewRow('Price', '₹ ${_priceController.text.trim()} ${_purpose == 'RENT' ? '/month' : ''} ${_priceNegotiable ? '(Negotiable)' : ''}', isHighlight: true),
          _buildReviewRow('Built-up Area', '${_areaController.text.trim()} Sq.Ft'),
          _buildReviewRow('Category & Subtype', '$_category • $_subtype'),
          _buildReviewRow('Configuration', '$_bedrooms BHK • $_bathrooms Baths • $_balconies Balconies'),
          _buildReviewRow('Floor Level', 'Floor $_floor of $_totalFloors'),
          _buildReviewRow('Furnishing', _furnishing),
          _buildReviewRow('Possession Status', _possessionStatus == 'READY_TO_MOVE' ? 'Ready to Move' : 'Under Construction'),
          _buildReviewRow('Facing Direction', _facing),

          if (_selectedProjectId.isNotEmpty && selProj.id.isNotEmpty)
            _buildReviewRow('Builder Project', selProj.name),

          if (_reraController.text.trim().isNotEmpty)
            _buildReviewRow('MahaRERA Number', _reraController.text.trim()),

          _buildReviewRow('Gallery Photos', '${_photos.length} photos uploaded to CloudFront CDN'),
          _buildReviewRow('Floor Plan', _floorPlanUrl.isNotEmpty ? 'Attached' : 'Not provided'),

          const SizedBox(height: 12),
          const Divider(color: AppColors.borderGrey),
          const SizedBox(height: 10),

          Text(
            'Selected Amenities:',
            style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.primaryText),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: _amenities.map((a) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.lightGrey,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppColors.borderGrey),
                ),
                child: Text(
                  a,
                  style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.primaryText),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText)),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: isHighlight ? 14 : 12,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
              color: isHighlight ? AppColors.primaryGreen : AppColors.primaryText,
            ),
          ),
        ],
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
      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 11),
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
