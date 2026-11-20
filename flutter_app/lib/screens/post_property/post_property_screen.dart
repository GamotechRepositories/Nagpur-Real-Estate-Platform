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
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../account/my_properties_screen.dart';

class PostPropertyScreen extends StatefulWidget {
  const PostPropertyScreen({super.key});

  @override
  State<PostPropertyScreen> createState() => _PostPropertyScreenState();
}

class _PostPropertyScreenState extends State<PostPropertyScreen> {
  int _currentStep = 1;
  static const int _totalSteps = 6;
  bool _loading = false;
  String _error = '';
  bool _success = false;

  // -------------------------------------------------------------
  // ROLE SELECTOR (Owner / Broker / Builder - User Requested Feature)
  // -------------------------------------------------------------
  String _listedBy = 'Owner'; // 'Owner' | 'Agent' | 'Builder'

  // -------------------------------------------------------------
  // ALL 24 NAGPUR LOCALITIES (Matching Admin NAGPUR_LOCALITIES)
  // -------------------------------------------------------------
  static const List<String> _nagpurLocalities = [
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
    'Jaripatka',
    'Katol Road',
    'Medical Square',
    'Ghat Road',
    'Ayodhya Nagar',
    'Hudkeshwar',
    'Godhani',
    'Kamptee Road',
  ];

  // -------------------------------------------------------------
  // AMENITIES LISTS (Categorized matching Admin AddPropertyPage)
  // -------------------------------------------------------------
  static const List<String> _basicAmenities = [
    '24/7 Water Supply',
    'Power Backup',
    'Lift / Elevator',
    'Reserved Car Parking',
    'Visitor Parking',
    'Gated Community',
    'Security Personnel',
    'CCTV Surveillance',
    'Fire Safety Equipment',
    'Rainwater Harvesting',
  ];

  static const List<String> _lifestyleAmenities = [
    'Swimming Pool',
    'Gymnasium',
    'Clubhouse',
    'Landscaped Garden',
    "Children's Play Area",
    'Jogging Track',
    'Indoor Games Room',
    'Sports Facilities / Badminton Court',
    'Community Hall',
    'Yoga / Meditation Area',
  ];

  static const List<String> _interiorFeatures = [
    'Modular Kitchen',
    'Built-in Wardrobes',
    'Air Conditioning',
    'Balcony with City View',
    'Attached Bathrooms',
    'Pooja Room',
    'Servant Room',
    'Store Room',
    'False Ceiling with LED Lights',
    'Vastu Compliant',
    'Piped Gas Connection',
    'Wifi / Broadband',
  ];

  static const List<String> _suitableForOptions = [
    'Families',
    'Bachelors / Students',
    'Working Professionals',
    'Doctors / Clinics',
    'IT / Software Offices',
    'Investors',
    'Retail Businesses',
  ];

  // Projects dropdown
  List<ProjectModel> _projectsList = [];
  String _selectedProjectId = '';

  // Step 1: Role & Basic Information
  final _titleController = TextEditingController(text: '3 BHK Luxury Apartment');
  String _purpose = 'BUY'; // 'BUY' | 'RENT'
  String _category = 'RESIDENTIAL'; // 'RESIDENTIAL' | 'COMMERCIAL' | 'PLOT' | 'AGRICULTURAL'
  String _subtype = 'FLAT'; // 'FLAT' | 'HOUSE_VILLA' | 'PLOT' | 'COMMERCIAL_SHOP' | 'COMMERCIAL_OFFICE' | 'PENTHOUSE' | 'AGRICULTURAL_LAND' | 'WAREHOUSE'
  String _condition = 'Ready to Move'; // 'Ready to Move' | 'Under Construction' | 'New Launch' | 'Resale'
  String _ownershipType = 'Freehold'; // 'Freehold' | 'Leasehold' | 'Co-operative Society' | 'Power of Attorney'
  final _descController = TextEditingController(
    text: 'Spacious well-ventilated apartment with premium fittings, panoramic city views, 24-hr water supply, and dedicated covered car parking in prime Nagpur.',
  );
  final _propertyUspController = TextEditingController(text: 'Prime location, Vastu compliant, Near Metro');

  // Step 2: Pricing & Financials
  final _priceController = TextEditingController(text: '7500000');
  bool _priceNegotiable = false;
  final _pricePerSqFtController = TextEditingController();
  final _bookingAmountController = TextEditingController(text: '100000');
  final _maintenanceChargesController = TextEditingController(text: '2000');
  String _maintenanceFrequency = 'Monthly'; // 'Monthly' | 'Quarterly' | 'Yearly' | 'One Time'
  final _securityDepositController = TextEditingController(text: '0');
  String _brokerage = 'Zero Brokerage'; // 'Zero Brokerage' | '1 Month Rent' | '15 Days Rent' | '1% of Value' | '2% of Value' | 'Negotiable'
  bool _loanAvailable = true;

  // Step 3: Specifications & Layout
  final _areaController = TextEditingController(text: '1450'); // Super built-up
  final _carpetAreaController = TextEditingController(text: '1150');
  final _builtUpAreaController = TextEditingController(text: '1300');
  final _plotAreaController = TextEditingController(text: '0');
  final _roadWidthController = TextEditingController(text: '30');
  int _bedrooms = 3;
  int _bathrooms = 3;
  int _balconies = 2;
  int _floor = 4;
  int _totalFloors = 10;
  String _furnishing = 'SEMI_FURNISHED'; // 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED'
  String _possessionStatus = 'READY_TO_MOVE'; // 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION'
  String _propertyAge = '0-1 year'; // 'Under Construction' | '0-1 year' | '1-5 years' | '5-10 years' | '10+ years'
  String _facing = 'EAST'; // 'EAST' | 'NORTH' | 'NORTH_EAST' | 'WEST' | 'SOUTH' | 'SOUTH_EAST' | 'SOUTH_WEST' | 'NORTH_WEST'
  // Commercial-specific
  final _cabinsController = TextEditingController(text: '0');
  final _workstationsController = TextEditingController(text: '0');
  final _conferenceRoomsController = TextEditingController(text: '0');

  // Step 4: Location & Legal Approvals
  String _localityName = 'Dharampeth';
  final _subLocalityController = TextEditingController(text: 'Shivaji Nagar');
  final _addressController = TextEditingController(text: 'Near Coffee House, West High Court Road');
  final _landmarkController = TextEditingController(text: 'Opposite Children Park');
  final _pincodeController = TextEditingController(text: '440010');
  String _reraRegistered = 'Yes'; // 'Yes' | 'No'
  final _reraController = TextEditingController();
  String _approvedBy = 'NMC (Nagpur Municipal Corporation)'; // 'NMC (Nagpur Municipal Corporation)' | 'NIT (Nagpur Improvement Trust)' | 'NMRDA' | 'Gram Panchayat'
  final _bankLoanApprovedByController = TextEditingController(text: 'SBI, HDFC, ICICI, Axis Bank');

  // Step 5: Amenities & Media
  final List<String> _amenities = [
    '24/7 Water Supply',
    'Power Backup',
    'Lift / Elevator',
    'Reserved Car Parking',
    'Security Personnel',
    'CCTV Surveillance',
  ];
  final List<String> _suitableFor = ['Families', 'Working Professionals'];
  final List<String> _photos = [];
  String _floorPlanUrl = '';
  final _videoUrlController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  bool _isUploadingImage = false;
  String _uploadStatusText = '';
  bool _showManualUrlInput = false;
  final _manualUrlController = TextEditingController();
  final _manualFloorPlanController = TextEditingController();

  // Contact / Seller Details
  final _sellerNameController = TextEditingController();
  final _sellerPhoneController = TextEditingController();
  final _sellerWhatsappController = TextEditingController();
  final _sellerEmailController = TextEditingController();
  final _sellerNotesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProjects();
    _autoCalculatePricePerSqFt();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initUserContact();
    });
  }

  void _initUserContact() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final user = auth.user;
    if (user != null) {
      if (_sellerNameController.text.isEmpty && user.name.isNotEmpty) {
        _sellerNameController.text = user.name;
      }
      if (_sellerPhoneController.text.isEmpty && user.phone.isNotEmpty) {
        _sellerPhoneController.text = user.phone;
        _sellerWhatsappController.text = user.phone;
      }
      if (_sellerEmailController.text.isEmpty && user.email != null && user.email!.isNotEmpty) {
        _sellerEmailController.text = user.email!;
      }
    }
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
            _reraRegistered = 'Yes';
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

  void _autoCalculatePricePerSqFt() {
    final p = num.tryParse(_priceController.text);
    final a = num.tryParse(_areaController.text);
    if (p != null && a != null && a > 0 && p > 0) {
      final ppsq = (p / a).round();
      _pricePerSqFtController.text = '$ppsq';
    }
  }

  String _formatIndianPrice(num val) {
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

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _propertyUspController.dispose();
    _priceController.dispose();
    _pricePerSqFtController.dispose();
    _bookingAmountController.dispose();
    _maintenanceChargesController.dispose();
    _securityDepositController.dispose();
    _areaController.dispose();
    _carpetAreaController.dispose();
    _builtUpAreaController.dispose();
    _plotAreaController.dispose();
    _roadWidthController.dispose();
    _cabinsController.dispose();
    _workstationsController.dispose();
    _conferenceRoomsController.dispose();
    _subLocalityController.dispose();
    _addressController.dispose();
    _landmarkController.dispose();
    _pincodeController.dispose();
    _reraController.dispose();
    _bankLoanApprovedByController.dispose();
    _videoUrlController.dispose();
    _manualUrlController.dispose();
    _manualFloorPlanController.dispose();
    _sellerNameController.dispose();
    _sellerPhoneController.dispose();
    _sellerWhatsappController.dispose();
    _sellerEmailController.dispose();
    _sellerNotesController.dispose();
    super.dispose();
  }

  // -------------------------------------------------------------
  // IMAGE & MEDIA UPLOADS (AWS S3 & CloudFront CDN)
  // -------------------------------------------------------------
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
        _uploadStatusText = 'Uploading photo...';
      });

      final url = await UploadService.uploadImage(File(picked.path), folder: 'properties');

      setState(() {
        _photos.add(url);
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Photo uploaded successfully!'),
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
        _uploadStatusText = 'Uploading ${pickedList.length} photos...';
      });

      final files = pickedList.map((x) => File(x.path)).toList();
      final urls = await UploadService.uploadMultipleImages(
        files,
        folder: 'properties',
        onProgress: (current, total) {
          if (mounted) {
            setState(() {
              _uploadStatusText = 'Uploading $current of $total photos...';
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
            content: Text('${urls.length} photos uploaded successfully!'),
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
        _uploadStatusText = 'Uploading floor plan...';
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

  // -------------------------------------------------------------
  // STEP VALIDATION
  // -------------------------------------------------------------
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
    } else if (step == 3) {
      final area = num.tryParse(_areaController.text);
      if (area == null || area <= 0) {
        setState(() => _error = 'Please enter super built-up area in Sq.Ft.');
        return false;
      }
    } else if (step == 4) {
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

  // -------------------------------------------------------------
  // SUBMISSION TO /api/properties (Exact Admin Match + Role)
  // -------------------------------------------------------------
  Future<void> _submitProperty() async {
    for (int s = 1; s <= 4; s++) {
      if (!_validateStep(s)) {
        setState(() => _currentStep = s);
        return;
      }
    }

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
      'condition': _condition,
      'ownershipType': _ownershipType,
      'project': _selectedProjectId.isNotEmpty ? _selectedProjectId : null,
      'description': cleanDescription,
      'propertyUsp': _propertyUspController.text.trim(),
      'suitableFor': _suitableFor,
      'price': num.tryParse(_priceController.text) ?? 0,
      'priceUnit': _purpose == 'RENT' ? 'Per Month' : 'Total',
      'priceNegotiable': _priceNegotiable,
      'pricePerSqFt': num.tryParse(_pricePerSqFtController.text) ?? 0,
      'bookingAmount': num.tryParse(_bookingAmountController.text) ?? 0,
      'maintenanceCharges': num.tryParse(_maintenanceChargesController.text) ?? 0,
      'maintenanceFrequency': _maintenanceFrequency,
      'securityDeposit': num.tryParse(_securityDepositController.text) ?? 0,
      'brokerage': _brokerage,
      'loanAvailable': _loanAvailable,
      'areaSqFt': num.tryParse(_areaController.text) ?? 0,
      'carpetAreaSqFt': num.tryParse(_carpetAreaController.text) ?? 0,
      'builtUpAreaSqFt': num.tryParse(_builtUpAreaController.text) ?? 0,
      'plotAreaSqFt': num.tryParse(_plotAreaController.text) ?? 0,
      'roadWidthFt': num.tryParse(_roadWidthController.text) ?? 30,
      'areaUnit': 'Sq.Ft',
      'bedrooms': _bedrooms,
      'bathrooms': _bathrooms,
      'balconies': _balconies,
      'floor': _floor,
      'totalFloors': _totalFloors,
      'furnishing': _furnishing,
      'possessionStatus': _possessionStatus,
      'propertyAge': _propertyAge,
      'facing': _facing,
      'cabins': num.tryParse(_cabinsController.text) ?? 0,
      'workstations': num.tryParse(_workstationsController.text) ?? 0,
      'conferenceRooms': num.tryParse(_conferenceRoomsController.text) ?? 0,
      'address': cleanAddress,
      'localityName': _localityName,
      'subLocality': _subLocalityController.text.trim(),
      'landmark': _landmarkController.text.trim(),
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
      'videoUrl': _videoUrlController.text.trim(),
      'amenities': _amenities,
      'reraRegistered': _reraRegistered,
      'reraNumber': _reraController.text.trim(),
      'approvedBy': _approvedBy,
      'bankLoanApprovedBy': _bankLoanApprovedByController.text.trim(),
      'listedBy': _listedBy,
      'clientSellerDetails': {
        'name': _sellerNameController.text.trim(),
        'phone': _sellerPhoneController.text.trim(),
        'whatsapp': _sellerWhatsappController.text.trim(),
        'email': _sellerEmailController.text.trim(),
        'notes': _sellerNotesController.text.trim(),
        'listedBy': _listedBy,
      },
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

  // -------------------------------------------------------------
  // BUILD METHOD & SHELL
  // -------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    if (_success) {
      return Scaffold(
        backgroundColor: AppColors.mainBackground,
        appBar: AppBar(
          backgroundColor: AppColors.primaryGreen,
          elevation: 0,
          title: Text(
            'Listing Created',
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
                    'Property Created Successfully!',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your listing has been submitted for review. It will be verified and published on Nagpur Realty.',
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
          'Post Property (नागपूर)',
          style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // Step Progress Bar (Scrollable horizontally)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildStepPill(1, 'Role & Info'),
                  _buildStepDivider(1),
                  _buildStepPill(2, 'Pricing'),
                  _buildStepDivider(2),
                  _buildStepPill(3, 'Specs'),
                  _buildStepDivider(3),
                  _buildStepPill(4, 'Location'),
                  _buildStepDivider(4),
                  _buildStepPill(5, 'Amenities & Photos'),
                  _buildStepDivider(5),
                  _buildStepPill(6, 'Review'),
                ],
              ),
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
                              if (_currentStep < _totalSteps) {
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
                            _currentStep < _totalSteps ? 'Continue →' : 'Publish Property',
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

  Widget _buildStepDivider(int step) {
    final isDone = _currentStep > step;
    return Container(
      width: 20,
      height: 2,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      color: isDone ? AppColors.primaryGreen : AppColors.borderGrey,
    );
  }

  Widget _buildStepPill(int step, String label) {
    final isActive = _currentStep == step;
    final isDone = _currentStep > step;

    return GestureDetector(
      onTap: () {
        if (step < _currentStep || _validateStep(_currentStep)) {
          setState(() => _currentStep = step);
        }
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isDone || isActive ? AppColors.primaryGreen : AppColors.lightGrey,
              border: Border.all(
                color: isDone || isActive ? AppColors.primaryGreen : AppColors.borderGrey,
              ),
            ),
            child: Center(
              child: isDone
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : Text(
                      '$step',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        color: isActive ? Colors.white : AppColors.secondaryText,
                      ),
                    ),
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
              color: isActive ? AppColors.primaryGreen : AppColors.secondaryText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 1:
        return _buildStep1RoleAndBasicInfo();
      case 2:
        return _buildStep2PricingAndFinancials();
      case 3:
        return _buildStep3SpecsAndDimensions();
      case 4:
        return _buildStep4LocationAndApprovals();
      case 5:
        return _buildStep5AmenitiesAndMedia();
      case 6:
        return _buildStep6ReviewAndSubmit();
      default:
        return const SizedBox.shrink();
    }
  }

  // =========================================================================
  // STEP 1: ROLE SELECTOR & BASIC INFORMATION
  // =========================================================================
  Widget _buildStep1RoleAndBasicInfo() {
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
          // ROLE SELECTOR HEADER (The core extra requirement)
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.lightGreen,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Icon(Icons.badge_outlined, color: AppColors.primaryGreen, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Who is posting this property? *',
                      style: GoogleFonts.inter(
                        fontSize: 14.5,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryText,
                      ),
                    ),
                    Text(
                      'आपला रोल निवडा (तुम्ही मालक आहात, ब्रोकर की बिल्डर?)',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 3 Distinct Role Cards (Owner / Broker / Builder)
          Row(
            children: [
              _buildRoleCard(
                role: 'Owner',
                title: 'Owner',
                marathi: 'मालक',
                subtitle: 'Individual',
                icon: Icons.person_outline,
              ),
              const SizedBox(width: 8),
              _buildRoleCard(
                role: 'Agent',
                title: 'Broker',
                marathi: 'ब्रोकर',
                subtitle: 'Agent',
                icon: Icons.support_agent_outlined,
              ),
              const SizedBox(width: 8),
              _buildRoleCard(
                role: 'Builder',
                title: 'Builder',
                marathi: 'बिल्डर',
                subtitle: 'Developer',
                icon: Icons.apartment_outlined,
              ),
            ],
          ),

          const SizedBox(height: 20),
          const Divider(color: AppColors.borderGrey),
          const SizedBox(height: 16),

          Text(
            'Basic Property Details',
            style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryText),
          ),
          const SizedBox(height: 14),

          // Property Title *
          _buildFieldLabel('Property Title *'),
          const SizedBox(height: 6),
          TextField(
            controller: _titleController,
            decoration: _inputDecoration('e.g. 3 BHK Luxury Flat in Dharampeth, Nagpur'),
          ),
          const SizedBox(height: 16),

          // Purpose & Category (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Purpose *'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _purpose,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'BUY', child: Text('Sell / Buy')),
                        DropdownMenuItem(value: 'RENT', child: Text('Rent / Lease')),
                      ],
                      onChanged: (v) => setState(() => _purpose = v ?? 'BUY'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Category *'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _category,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'RESIDENTIAL', child: Text('Residential')),
                        DropdownMenuItem(value: 'COMMERCIAL', child: Text('Commercial')),
                        DropdownMenuItem(value: 'PLOT', child: Text('Plot / Land')),
                        DropdownMenuItem(value: 'AGRICULTURAL', child: Text('Agricultural')),
                      ],
                      onChanged: (v) => setState(() => _category = v ?? 'RESIDENTIAL'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Subtype & Condition (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Property Subtype *'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _subtype,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'FLAT', child: Text('Flat / Apartment')),
                        DropdownMenuItem(value: 'HOUSE_VILLA', child: Text('House / Villa')),
                        DropdownMenuItem(value: 'PLOT', child: Text('Residential Plot')),
                        DropdownMenuItem(value: 'COMMERCIAL_SHOP', child: Text('Commercial Shop')),
                        DropdownMenuItem(value: 'COMMERCIAL_OFFICE', child: Text('Office Space')),
                        DropdownMenuItem(value: 'PENTHOUSE', child: Text('Penthouse')),
                        DropdownMenuItem(value: 'AGRICULTURAL_LAND', child: Text('Agri Land / Farm')),
                        DropdownMenuItem(value: 'WAREHOUSE', child: Text('Warehouse / Godown')),
                      ],
                      onChanged: (v) => setState(() => _subtype = v ?? 'FLAT'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Property Condition'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _condition,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'Ready to Move', child: Text('Ready to Move')),
                        DropdownMenuItem(value: 'Under Construction', child: Text('Under Construction')),
                        DropdownMenuItem(value: 'New Launch', child: Text('New Launch')),
                        DropdownMenuItem(value: 'Resale', child: Text('Resale')),
                      ],
                      onChanged: (v) => setState(() => _condition = v ?? 'Ready to Move'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Ownership Type & Builder Project (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Ownership Type'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _ownershipType,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'Freehold', child: Text('Freehold')),
                        DropdownMenuItem(value: 'Leasehold', child: Text('Leasehold')),
                        DropdownMenuItem(value: 'Co-operative Society', child: Text('Co-op Society')),
                        DropdownMenuItem(value: 'Power of Attorney', child: Text('Power of Attorney')),
                      ],
                      onChanged: (v) => setState(() => _ownershipType = v ?? 'Freehold'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Builder Project (Optional)'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _selectedProjectId,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: [
                        const DropdownMenuItem(value: '', child: Text('None / Standalone')),
                        ..._projectsList.map((p) => DropdownMenuItem(
                              value: p.id,
                              child: Text(p.name, overflow: TextOverflow.ellipsis),
                            )),
                      ],
                      onChanged: _onProjectSelected,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Description *
          _buildFieldLabel('Description *'),
          const SizedBox(height: 6),
          TextField(
            controller: _descController,
            maxLines: 4,
            decoration: _inputDecoration('Describe highlights, floor layout, views, sunlight, connectivity...'),
          ),
          const SizedBox(height: 16),

          // Property USP / Highlights
          _buildFieldLabel('Key Highlights / USP (Optional)'),
          const SizedBox(height: 6),
          TextField(
            controller: _propertyUspController,
            decoration: _inputDecoration('e.g. Corner Flat, Metro Station 200m, Vastu Compliant'),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard({
    required String role,
    required String title,
    required String marathi,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _listedBy == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _listedBy = role),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.lightGreen : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? AppColors.primaryGreen : AppColors.borderGrey,
              width: isSelected ? 2 : 1,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.primaryGreen.withValues(alpha: 0.15),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : [],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 26,
                color: isSelected ? AppColors.primaryGreen : AppColors.secondaryText,
              ),
              const SizedBox(height: 6),
              Text(
                title,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? AppColors.primaryGreen : AppColors.primaryText,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                marathi,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? AppColors.primaryGreen : AppColors.secondaryText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // STEP 2: PRICING & FINANCIALS
  // =========================================================================
  Widget _buildStep2PricingAndFinancials() {
    final priceVal = num.tryParse(_priceController.text) ?? 0;

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
            'Pricing & Financial Details',
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primaryText),
          ),
          const SizedBox(height: 4),
          Text(
            'Specify pricing, maintenance, token and brokerage terms',
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
          ),
          const SizedBox(height: 16),

          // Total Asking Price & Price Preview
          _buildFieldLabel('Expected Price (INR ₹) *'),
          const SizedBox(height: 6),
          TextField(
            controller: _priceController,
            keyboardType: TextInputType.number,
            onChanged: (val) {
              setState(() {});
              _autoCalculatePricePerSqFt();
            },
            decoration: _inputDecoration('e.g. 7500000').copyWith(
              prefixIcon: const Icon(Icons.currency_rupee, size: 18, color: AppColors.secondaryText),
            ),
          ),
          if (priceVal > 0) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.info_outline, size: 13, color: AppColors.primaryGreen),
                const SizedBox(width: 4),
                Text(
                  _formatIndianPrice(priceVal),
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryGreen,
                  ),
                ),
                Text(
                  _purpose == 'RENT' ? ' / month' : ' (Total Price)',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),

          // Price Negotiable & Price Per Sq.Ft (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Price Negotiable?'),
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
                            _priceNegotiable ? 'Negotiable' : 'Fixed Price',
                            style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600),
                          ),
                          Switch(
                            value: _priceNegotiable,
                            activeThumbColor: AppColors.primaryGreen,
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            onChanged: (v) => setState(() => _priceNegotiable = v),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Price / Sq.Ft (₹)'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _pricePerSqFtController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('e.g. 5172'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Booking Token & Maintenance Charges (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Booking / Token (₹)'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _bookingAmountController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('e.g. 100000'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Maintenance (₹)'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _maintenanceChargesController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('e.g. 2000'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Maintenance Frequency & Security Deposit (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Maintenance Frequency'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _maintenanceFrequency,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'Monthly', child: Text('Monthly')),
                        DropdownMenuItem(value: 'Quarterly', child: Text('Quarterly')),
                        DropdownMenuItem(value: 'Yearly', child: Text('Yearly')),
                        DropdownMenuItem(value: 'One Time', child: Text('One Time')),
                      ],
                      onChanged: (v) => setState(() => _maintenanceFrequency = v ?? 'Monthly'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Security Deposit (₹)'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _securityDepositController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('e.g. 50000'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Brokerage & Bank Loan (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Brokerage'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _brokerage,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'Zero Brokerage', child: Text('Zero Brokerage')),
                        DropdownMenuItem(value: '1 Month Rent', child: Text('1 Month Rent')),
                        DropdownMenuItem(value: '15 Days Rent', child: Text('15 Days Rent')),
                        DropdownMenuItem(value: '1% of Value', child: Text('1% of Value')),
                        DropdownMenuItem(value: '2% of Value', child: Text('2% of Value')),
                        DropdownMenuItem(value: 'Negotiable', child: Text('Negotiable')),
                      ],
                      onChanged: (v) => setState(() => _brokerage = v ?? 'Zero Brokerage'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Bank Loan Available?'),
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
                            _loanAvailable ? 'Loan Available' : 'No Loan',
                            style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600),
                          ),
                          Switch(
                            value: _loanAvailable,
                            activeThumbColor: AppColors.primaryGreen,
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            onChanged: (v) => setState(() => _loanAvailable = v),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 3: SPECIFICATIONS & DIMENSIONS
  // =========================================================================
  Widget _buildStep3SpecsAndDimensions() {
    final isCommercial = _category == 'COMMERCIAL';

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
            'Specifications & Dimensions',
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primaryText),
          ),
          const SizedBox(height: 4),
          Text(
            'Areas, rooms, floor levels, facing and furnishing status',
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
          ),
          const SizedBox(height: 16),

          // Super Built-up Area & Carpet Area (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Super Built-up (Sq.Ft) *'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _areaController,
                      keyboardType: TextInputType.number,
                      onChanged: (_) => _autoCalculatePricePerSqFt(),
                      decoration: _inputDecoration('e.g. 1450'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Carpet Area (Sq.Ft)'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _carpetAreaController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('e.g. 1150'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Built-up Area & Plot Area (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Built-up Area (Sq.Ft)'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _builtUpAreaController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('e.g. 1300'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Plot Area (Sq.Ft)'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _plotAreaController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('e.g. 1500'),
                    ),
                  ],
                ),
              ),
            ],
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
                      items: [0, 1, 2, 3, 4, 5, 6].map((b) => DropdownMenuItem(value: b, child: Text('$b BHK'))).toList(),
                      onChanged: (v) => setState(() => _bedrooms = v ?? 3),
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
                      items: [0, 1, 2, 3, 4, 5].map((b) => DropdownMenuItem(value: b, child: Text('$b Baths'))).toList(),
                      onChanged: (v) => setState(() => _bathrooms = v ?? 3),
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
                      items: [0, 1, 2, 3, 4, 5].map((b) => DropdownMenuItem(value: b, child: Text('$b Balc.'))).toList(),
                      onChanged: (v) => setState(() => _balconies = v ?? 2),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Floor Number & Total Floors (2 Columns)
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
                      items: List.generate(41, (i) => i).map((f) => DropdownMenuItem(
                        value: f,
                        child: Text(f == 0 ? 'Ground (0)' : 'Floor $f'),
                      )).toList(),
                      onChanged: (v) => setState(() => _floor = v ?? 4),
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
                      items: List.generate(50, (i) => i + 1).map((f) => DropdownMenuItem(
                        value: f,
                        child: Text('$f Floors'),
                      )).toList(),
                      onChanged: (v) => setState(() => _totalFloors = v ?? 10),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Furnishing & Possession Status (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Furnishing'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _furnishing,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'UNFURNISHED', child: Text('Unfurnished')),
                        DropdownMenuItem(value: 'SEMI_FURNISHED', child: Text('Semi Furnished')),
                        DropdownMenuItem(value: 'FURNISHED', child: Text('Fully Furnished')),
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
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Facing Direction & Property Age (2 Columns)
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Facing Direction'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _facing,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'EAST', child: Text('East Facing')),
                        DropdownMenuItem(value: 'NORTH', child: Text('North Facing')),
                        DropdownMenuItem(value: 'NORTH_EAST', child: Text('North-East Facing')),
                        DropdownMenuItem(value: 'WEST', child: Text('West Facing')),
                        DropdownMenuItem(value: 'SOUTH', child: Text('South Facing')),
                        DropdownMenuItem(value: 'SOUTH_EAST', child: Text('South-East Facing')),
                        DropdownMenuItem(value: 'SOUTH_WEST', child: Text('South-West Facing')),
                        DropdownMenuItem(value: 'NORTH_WEST', child: Text('North-West Facing')),
                      ],
                      onChanged: (v) => setState(() => _facing = v ?? 'EAST'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Property Age'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _propertyAge,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'Under Construction', child: Text('Under Construction')),
                        DropdownMenuItem(value: '0-1 year', child: Text('0-1 Year (New)')),
                        DropdownMenuItem(value: '1-5 years', child: Text('1-5 Years')),
                        DropdownMenuItem(value: '5-10 years', child: Text('5-10 Years')),
                        DropdownMenuItem(value: '10+ years', child: Text('10+ Years')),
                      ],
                      onChanged: (v) => setState(() => _propertyAge = v ?? '0-1 year'),
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (isCommercial) ...[
            const SizedBox(height: 16),
            const Divider(color: AppColors.borderGrey),
            const SizedBox(height: 12),
            Text(
              'Commercial Fitouts',
              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryText),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFieldLabel('Cabins'),
                      const SizedBox(height: 6),
                      TextField(controller: _cabinsController, keyboardType: TextInputType.number, decoration: _inputDecoration('0')),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFieldLabel('Workstations'),
                      const SizedBox(height: 6),
                      TextField(controller: _workstationsController, keyboardType: TextInputType.number, decoration: _inputDecoration('0')),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFieldLabel('Conference Rms'),
                      const SizedBox(height: 6),
                      TextField(controller: _conferenceRoomsController, keyboardType: TextInputType.number, decoration: _inputDecoration('0')),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 4: LOCATION & LEGAL APPROVALS (All 24 Nagpur Localities)
  // =========================================================================
  Widget _buildStep4LocationAndApprovals() {
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
            'Location & Legal Approvals',
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primaryText),
          ),
          const SizedBox(height: 4),
          Text(
            'Nagpur locality, street address, MahaRERA & local body sanctions',
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
          ),
          const SizedBox(height: 16),

          // Locality * (24 Nagpur Localities Dropdown)
          _buildFieldLabel('Nagpur Locality * (24 Major Areas)'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _localityName,
            isExpanded: true,
            decoration: _inputDecoration('Select Locality'),
            items: _nagpurLocalities
                .map((loc) => DropdownMenuItem(
                      value: loc,
                      child: Text(loc, overflow: TextOverflow.ellipsis),
                    ))
                .toList(),
            onChanged: (v) => setState(() => _localityName = v ?? 'Dharampeth'),
          ),
          const SizedBox(height: 16),

          // Sub-Locality / Society & Pincode (2 Columns)
          Row(
            children: [
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('Sub-Locality / Society'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _subLocalityController,
                      decoration: _inputDecoration('e.g. Shivaji Nagar, Gokulpeth'),
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

          // Street Address *
          _buildFieldLabel('Full Street Address *'),
          const SizedBox(height: 6),
          TextField(
            controller: _addressController,
            decoration: _inputDecoration('e.g. Flat 402, Royal Palms, West High Court Road'),
          ),
          const SizedBox(height: 16),

          // Landmark
          _buildFieldLabel('Landmark (Optional)'),
          const SizedBox(height: 6),
          TextField(
            controller: _landmarkController,
            decoration: _inputDecoration('e.g. Opposite Children Park, Near Metro Pillar 124'),
          ),
          const SizedBox(height: 16),
          const Divider(color: AppColors.borderGrey),
          const SizedBox(height: 12),

          Text(
            'MahaRERA & Legal Sanctions',
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryText),
          ),
          const SizedBox(height: 14),

          // RERA Registered & RERA Number
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('RERA Registered?'),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _reraRegistered,
                      isExpanded: true,
                      decoration: _inputDecoration(''),
                      items: const [
                        DropdownMenuItem(value: 'Yes', child: Text('Yes (Registered)')),
                        DropdownMenuItem(value: 'No', child: Text('No / Not Applicable')),
                      ],
                      onChanged: (v) => setState(() => _reraRegistered = v ?? 'Yes'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel('MahaRERA Number'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _reraController,
                      decoration: _inputDecoration('e.g. P50500012345'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Approving Authority
          _buildFieldLabel('Approving Authority / Sanction Body'),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _approvedBy,
            isExpanded: true,
            decoration: _inputDecoration(''),
            items: const [
              DropdownMenuItem(value: 'NMC (Nagpur Municipal Corporation)', child: Text('NMC (Nagpur Municipal Corporation)')),
              DropdownMenuItem(value: 'NIT (Nagpur Improvement Trust)', child: Text('NIT (Nagpur Improvement Trust)')),
              DropdownMenuItem(value: 'NMRDA', child: Text('NMRDA (Metropolitan Region)')),
              DropdownMenuItem(value: 'Gram Panchayat', child: Text('Gram Panchayat Sanctioned')),
              DropdownMenuItem(value: 'Not Approved / Applied', child: Text('Not Approved / Applied')),
            ],
            onChanged: (v) => setState(() => _approvedBy = v ?? 'NMC (Nagpur Municipal Corporation)'),
          ),
          const SizedBox(height: 16),

          // Bank Loans Approved By
          _buildFieldLabel('Approved Banks for Loan (Optional)'),
          const SizedBox(height: 6),
          TextField(
            controller: _bankLoanApprovedByController,
            decoration: _inputDecoration('e.g. SBI, HDFC Bank, ICICI Bank, Axis Bank'),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 5: AMENITIES, SUITABLE FOR, PHOTOS & MEDIA
  // =========================================================================
  Widget _buildStep5AmenitiesAndMedia() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Amenities & Suitable For Card
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
                'Amenities & Features (Matching Admin)',
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primaryText),
              ),
              const SizedBox(height: 4),
              Text(
                'Select all available amenities and buyer profile suitability',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
              ),
              const SizedBox(height: 16),

              // Basic Amenities
              Text(
                'Basic Amenities',
                style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
              ),
              const SizedBox(height: 8),
              _buildAmenityChips(_basicAmenities),
              const SizedBox(height: 16),

              // Lifestyle Amenities
              Text(
                'Lifestyle & Sports Amenities',
                style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
              ),
              const SizedBox(height: 8),
              _buildAmenityChips(_lifestyleAmenities),
              const SizedBox(height: 16),

              // Interior Features
              Text(
                'Interior & Architecture Features',
                style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
              ),
              const SizedBox(height: 8),
              _buildAmenityChips(_interiorFeatures),
              const SizedBox(height: 16),

              // Suitable For
              Text(
                'Suitable For',
                style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: _suitableForOptions.map((item) {
                  final isSelected = _suitableFor.contains(item);
                  return FilterChip(
                    label: Text(item),
                    selected: isSelected,
                    selectedColor: AppColors.lightGreen,
                    checkmarkColor: AppColors.primaryGreen,
                    labelStyle: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? AppColors.primaryGreen : AppColors.primaryText,
                    ),
                    backgroundColor: AppColors.lightGrey,
                    side: BorderSide(color: isSelected ? AppColors.primaryGreen : AppColors.borderGrey),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _suitableFor.add(item);
                        } else {
                          _suitableFor.remove(item);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Photos & Gallery Card
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
                'Property Photos (AWS S3 & CloudFront)',
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primaryText),
              ),
              const SizedBox(height: 2),
              Text(
                'Upload real property photos. The first photo will be used as the Cover Image.',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
              ),
              const SizedBox(height: 14),

              // Upload Action Buttons Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.lightGreen.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.3)),
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
                      'JPG, PNG, or WEBP. Fast CDN hosted.',
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
                          label: const Text('Camera'),
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
                          label: const Text('Gallery'),
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
                      'Or add external image URL directly',
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

        // Floor Plan & Video Tour Card
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
                'Floor Plan & Video Tour',
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryText),
              ),
              const SizedBox(height: 12),

              // Floor plan upload
              _buildFieldLabel('2D / 3D Floor Plan (Optional)'),
              const SizedBox(height: 6),
              if (_floorPlanUrl.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.lightGreen,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: AppNetworkImage(imageUrl: _floorPlanUrl, width: 44, height: 44, fit: BoxFit.cover),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Floor Plan Attached',
                          style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.errorRed),
                        onPressed: () => setState(() => _floorPlanUrl = ''),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
              ],
              OutlinedButton.icon(
                onPressed: _isUploadingImage ? null : () => _pickAndUploadFloorPlan(ImageSource.gallery),
                icon: const Icon(Icons.architecture, size: 16),
                label: Text(_floorPlanUrl.isEmpty ? 'Upload Floor Plan Image' : 'Change Floor Plan'),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.primaryGreen),
                  foregroundColor: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 14),

              // Video URL
              _buildFieldLabel('YouTube Video / Virtual Tour Link (Optional)'),
              const SizedBox(height: 6),
              TextField(
                controller: _videoUrlController,
                decoration: _inputDecoration('https://youtube.com/watch?v=...'),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Contact / Poster Details Card
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
                children: [
                  const Icon(Icons.contact_phone_outlined, size: 18, color: AppColors.primaryGreen),
                  const SizedBox(width: 8),
                  Text(
                    'Poster & Seller Contact Details',
                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              _buildFieldLabel('Full Name / Contact Person *'),
              const SizedBox(height: 6),
              TextField(
                controller: _sellerNameController,
                decoration: _inputDecoration('e.g. Ramesh Sharma'),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('Calling Phone *'),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _sellerPhoneController,
                          keyboardType: TextInputType.phone,
                          decoration: _inputDecoration('+91 9876543210'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('WhatsApp Number'),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _sellerWhatsappController,
                          keyboardType: TextInputType.phone,
                          decoration: _inputDecoration('+91 9876543210'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              _buildFieldLabel('Email Address (Optional)'),
              const SizedBox(height: 6),
              TextField(
                controller: _sellerEmailController,
                keyboardType: TextInputType.emailAddress,
                decoration: _inputDecoration('contact@example.com'),
              ),
              const SizedBox(height: 12),

              _buildFieldLabel('Special Notes / Visiting Timing (Optional)'),
              const SizedBox(height: 6),
              TextField(
                controller: _sellerNotesController,
                maxLines: 2,
                decoration: _inputDecoration('e.g. Available for site visit on weekends 10am to 5pm'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAmenityChips(List<String> list) {
    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: list.map((amenity) {
        final isSelected = _amenities.contains(amenity);
        return FilterChip(
          label: Text(amenity),
          selected: isSelected,
          selectedColor: AppColors.lightGreen,
          checkmarkColor: AppColors.primaryGreen,
          labelStyle: GoogleFonts.inter(
            fontSize: 11,
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
    );
  }

  // =========================================================================
  // STEP 6: REVIEW & FINAL SUBMIT
  // =========================================================================
  Widget _buildStep6ReviewAndSubmit() {
    final selProj = _projectsList.firstWhere(
      (p) => p.id == _selectedProjectId,
      orElse: () => ProjectModel(id: '', name: '', slug: '', image: ''),
    );
    final priceVal = num.tryParse(_priceController.text) ?? 0;

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
            children: [
              const Icon(Icons.checklist_rtl_rounded, color: AppColors.primaryGreen, size: 24),
              const SizedBox(width: 8),
              Text(
                'Review Your Property Listing',
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primaryText),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Role Badge & Purpose Badge
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'ROLE: ${_listedBy.toUpperCase()} (${_listedBy == "Owner" ? "मालक" : _listedBy == "Agent" ? "ब्रोकर" : "बिल्डर"})',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.lightGreen,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _purpose == 'BUY' ? 'For Sale' : 'For Rent',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Title & Locality
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

          // Highlighted Pricing
          _buildReviewRow(
            'Total Price',
            '${_formatIndianPrice(priceVal)} ${_purpose == "RENT" ? "/month" : ""} ${_priceNegotiable ? "(Negotiable)" : ""}',
            isHighlight: true,
          ),
          _buildReviewRow('Rate per Sq.Ft', '₹ ${_pricePerSqFtController.text.trim()} / Sq.Ft'),
          _buildReviewRow('Super Built-up Area', '${_areaController.text.trim()} Sq.Ft'),
          if (_carpetAreaController.text.isNotEmpty)
            _buildReviewRow('Carpet Area', '${_carpetAreaController.text.trim()} Sq.Ft'),
          _buildReviewRow('Category & Subtype', '$_category • $_subtype'),
          _buildReviewRow('Configuration', '$_bedrooms BHK • $_bathrooms Baths • $_balconies Balconies'),
          _buildReviewRow('Floor Level', 'Floor $_floor of $_totalFloors'),
          _buildReviewRow('Furnishing', _furnishing),
          _buildReviewRow('Possession Status', _possessionStatus == 'READY_TO_MOVE' ? 'Ready to Move' : 'Under Construction'),
          _buildReviewRow('Facing Direction', _facing),
          _buildReviewRow('Approving Authority', _approvedBy),

          if (_reraController.text.trim().isNotEmpty)
            _buildReviewRow('MahaRERA Reg No', _reraController.text.trim()),

          if (_selectedProjectId.isNotEmpty && selProj.id.isNotEmpty)
            _buildReviewRow('Builder Project', selProj.name),

          _buildReviewRow('Photos Uploaded', '${_photos.length} photos ready'),
          _buildReviewRow('Floor Plan', _floorPlanUrl.isNotEmpty ? 'Attached' : 'Not provided'),

          if (_sellerNameController.text.trim().isNotEmpty)
            _buildReviewRow('Contact Person', '${_sellerNameController.text.trim()} (${_sellerPhoneController.text.trim()})'),

          const SizedBox(height: 12),
          const Divider(color: AppColors.borderGrey),
          const SizedBox(height: 10),

          Text(
            'Selected Amenities (${_amenities.length}):',
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
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: GoogleFonts.inter(
                fontSize: isHighlight ? 14 : 12,
                fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
                color: isHighlight ? AppColors.primaryGreen : AppColors.primaryText,
              ),
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
