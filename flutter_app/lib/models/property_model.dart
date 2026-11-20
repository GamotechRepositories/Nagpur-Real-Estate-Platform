class PropertyImage {
  final String url;
  final String? caption;
  final bool isCover;

  PropertyImage({
    required this.url,
    this.caption,
    this.isCover = false,
  });

  factory PropertyImage.fromJson(Map<String, dynamic> json) {
    return PropertyImage(
      url: json['url']?.toString() ?? '',
      caption: json['caption']?.toString(),
      isCover: json['isCover'] == true,
    );
  }
}

class AgentContact {
  final String id;
  final String name;
  final String phone;
  final String? avatar;
  final String? role;

  AgentContact({
    required this.id,
    required this.name,
    required this.phone,
    this.avatar,
    this.role,
  });

  factory AgentContact.fromJson(Map<String, dynamic> json) {
    return AgentContact(
      id: json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Agent',
      phone: json['phone']?.toString() ?? '9823012345',
      avatar: json['avatar']?.toString(),
      role: json['role']?.toString(),
    );
  }
}

class PropertyModel {
  final String id;
  final String slug;
  final String title;
  final String description;
  final String category;
  final String subtype;
  final String purpose;
  final String condition;
  final String ownershipType;
  final num price;
  final String priceUnit;
  final bool priceNegotiable;
  final num pricePerSqFt;
  final num bookingAmount;
  final num maintenanceCharges;
  final String maintenanceFrequency;
  final num securityDeposit;
  final String brokerage;
  final bool loanAvailable;
  final String taxAndGovtCharges;
  final String additionalCharges;
  final num areaSqFt;
  final num carpetAreaSqFt;
  final num builtUpAreaSqFt;
  final num plotAreaSqFt;
  final num roadWidthFt;
  final String areaUnit;
  final int bedrooms;
  final int bathrooms;
  final int balconies;
  final String furnishing;
  final String possessionStatus;
  final String facing;
  final int floor;
  final int totalFloors;
  final String propertyAge;
  final String? reraNumber;
  final String status;
  final bool isVerified;
  final bool isFeatured;
  final bool isDealOfTheDay;
  final String localityName;
  final String subLocality;
  final String landmark;
  final String address;
  final String pincode;
  final String coverImage;
  final List<PropertyImage> images;
  final List<String> amenities;
  final String? floorPlanUrl;
  final String? videoUrl;
  final String? virtualTourUrl;
  final String? brochureUrl;
  final String occupancyCertificate;
  final String completionCertificate;
  final String propertyTaxStatus;
  final String approvedBy;
  final String bankLoanApprovedBy;
  final String propertyUsp;
  final List<String> suitableFor;
  final int cabins;
  final int workstations;
  final int conferenceRooms;
  final AgentContact? assignedAgent;
  final AgentContact? owner;
  final int viewsCount;
  final int enquiriesCount;
  bool isSaved;

  PropertyModel({
    required this.id,
    required this.slug,
    required this.title,
    required this.description,
    required this.category,
    required this.subtype,
    required this.purpose,
    this.condition = 'Ready to Move',
    this.ownershipType = 'Freehold',
    required this.price,
    this.priceUnit = 'Total',
    this.priceNegotiable = false,
    this.pricePerSqFt = 0,
    this.bookingAmount = 0,
    this.maintenanceCharges = 0,
    this.maintenanceFrequency = 'Monthly',
    this.securityDeposit = 0,
    this.brokerage = 'Zero Brokerage',
    this.loanAvailable = true,
    this.taxAndGovtCharges = 'Excluded',
    this.additionalCharges = '',
    required this.areaSqFt,
    this.carpetAreaSqFt = 0,
    this.builtUpAreaSqFt = 0,
    this.plotAreaSqFt = 0,
    this.roadWidthFt = 30,
    this.areaUnit = 'Sq.Ft',
    this.bedrooms = 0,
    this.bathrooms = 0,
    this.balconies = 0,
    this.furnishing = 'UNFURNISHED',
    this.possessionStatus = 'READY_TO_MOVE',
    this.facing = 'EAST',
    this.floor = 0,
    this.totalFloors = 0,
    this.propertyAge = 'New',
    this.reraNumber,
    this.status = 'LIVE',
    this.isVerified = false,
    this.isFeatured = false,
    this.isDealOfTheDay = false,
    required this.localityName,
    this.subLocality = '',
    this.landmark = '',
    this.address = '',
    this.pincode = '',
    required this.coverImage,
    required this.images,
    required this.amenities,
    this.floorPlanUrl,
    this.videoUrl,
    this.virtualTourUrl,
    this.brochureUrl,
    this.occupancyCertificate = 'Available',
    this.completionCertificate = 'Available',
    this.propertyTaxStatus = 'Paid',
    this.approvedBy = 'NMC (Nagpur Municipal Corporation)',
    this.bankLoanApprovedBy = 'SBI, HDFC, ICICI, Axis Bank',
    this.propertyUsp = '',
    this.suitableFor = const [],
    this.cabins = 0,
    this.workstations = 0,
    this.conferenceRooms = 0,
    this.assignedAgent,
    this.owner,
    this.viewsCount = 0,
    this.enquiriesCount = 0,
    this.isSaved = false,
  });

  bool get isOwnerPublicUser {
    if (owner == null) return true;
    final r = owner!.role?.toUpperCase();
    return r == null || r == 'USER';
  }

  String get contactPhone {
    if (assignedAgent != null && assignedAgent!.phone.isNotEmpty) {
      return assignedAgent!.phone;
    }
    if (!isOwnerPublicUser && owner != null && owner!.phone.isNotEmpty) {
      return owner!.phone;
    }
    return '9823012345';
  }

  String get contactName {
    if (assignedAgent != null && assignedAgent!.name.isNotEmpty) {
      return assignedAgent!.name;
    }
    if (!isOwnerPublicUser && owner != null && owner!.name.isNotEmpty) {
      return owner!.name;
    }
    return 'Nagpur Certified Broker Desk';
  }

  String? get contactAvatar {
    if (assignedAgent != null && assignedAgent!.avatar != null) {
      return assignedAgent!.avatar;
    }
    if (!isOwnerPublicUser && owner != null && owner!.avatar != null) {
      return owner!.avatar;
    }
    return null;
  }

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    const defaultImage =
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

    final rawImages = json['images'] as List<dynamic>? ?? [];
    final parsedImages = rawImages.map((img) {
      if (img is Map<String, dynamic>) {
        return PropertyImage.fromJson(img);
      }
      return PropertyImage(url: img.toString());
    }).toList();

    final cover = json['coverImage']?.toString() ??
        (parsedImages.isNotEmpty ? parsedImages.first.url : defaultImage);

    final rawAmenities = json['amenities'] as List<dynamic>? ?? [];
    final parsedAmenities = rawAmenities.map((a) => a.toString()).toList();

    final rawSuitableFor = json['suitableFor'] as List<dynamic>? ?? [];
    final parsedSuitableFor = rawSuitableFor.map((s) => s.toString()).toList();

    final priceVal = num.tryParse(json['price']?.toString() ?? '0') ?? 0;
    final areaVal = num.tryParse(json['areaSqFt']?.toString() ?? json['areaDisplay']?.toString() ?? '0') ?? 0;
    final calcPricePerSqFt = num.tryParse(json['pricePerSqFt']?.toString() ?? '0') ??
        (priceVal > 0 && areaVal > 0 ? (priceVal / areaVal).round() : 0);

    return PropertyModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Nagpur Property',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? 'RESIDENTIAL',
      subtype: json['subtype']?.toString() ?? 'FLAT',
      purpose: json['purpose']?.toString() ?? 'BUY',
      condition: json['condition']?.toString() ?? 'Ready to Move',
      ownershipType: json['ownershipType']?.toString() ?? 'Freehold',
      price: priceVal,
      priceUnit: json['priceUnit']?.toString() ?? 'Total',
      priceNegotiable: json['priceNegotiable'] == true,
      pricePerSqFt: calcPricePerSqFt,
      bookingAmount: num.tryParse(json['bookingAmount']?.toString() ?? '0') ?? 0,
      maintenanceCharges: num.tryParse(json['maintenanceCharges']?.toString() ?? '0') ?? 0,
      maintenanceFrequency: json['maintenanceFrequency']?.toString() ?? 'Monthly',
      securityDeposit: num.tryParse(json['securityDeposit']?.toString() ?? '0') ?? 0,
      brokerage: json['brokerage']?.toString() ?? 'Zero Brokerage',
      loanAvailable: json['loanAvailable'] != false,
      taxAndGovtCharges: json['taxAndGovtCharges']?.toString() ?? 'Excluded',
      additionalCharges: json['additionalCharges']?.toString() ?? '',
      areaSqFt: areaVal,
      carpetAreaSqFt: num.tryParse(json['carpetAreaSqFt']?.toString() ?? '0') ?? 0,
      builtUpAreaSqFt: num.tryParse(json['builtUpAreaSqFt']?.toString() ?? '0') ?? 0,
      plotAreaSqFt: num.tryParse(json['plotAreaSqFt']?.toString() ?? '0') ?? 0,
      roadWidthFt: num.tryParse(json['roadWidthFt']?.toString() ?? '30') ?? 30,
      areaUnit: json['areaUnit']?.toString() ?? 'Sq.Ft',
      bedrooms: int.tryParse(json['bedrooms']?.toString() ?? '0') ?? 0,
      bathrooms: int.tryParse(json['bathrooms']?.toString() ?? '0') ?? 0,
      balconies: int.tryParse(json['balconies']?.toString() ?? '0') ?? 0,
      furnishing: json['furnishing']?.toString() ?? 'UNFURNISHED',
      possessionStatus: json['possessionStatus']?.toString() ?? 'READY_TO_MOVE',
      facing: json['facing']?.toString() ?? 'EAST',
      floor: int.tryParse(json['floor']?.toString() ?? '0') ?? 0,
      totalFloors: int.tryParse(json['totalFloors']?.toString() ?? '0') ?? 0,
      propertyAge: json['propertyAge']?.toString() ?? 'New',
      reraNumber: json['reraNumber']?.toString(),
      status: json['status']?.toString() ?? 'LIVE',
      isVerified: json['isVerified'] == true,
      isFeatured: json['isFeatured'] == true,
      isDealOfTheDay: json['isDealOfTheDay'] == true,
      localityName: json['localityName']?.toString() ?? 'Nagpur',
      subLocality: json['subLocality']?.toString() ?? '',
      landmark: json['landmark']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      pincode: json['pincode']?.toString() ?? '',
      coverImage: cover.isNotEmpty ? cover : defaultImage,
      images: parsedImages,
      amenities: parsedAmenities,
      floorPlanUrl: json['floorPlanUrl']?.toString(),
      videoUrl: json['videoUrl']?.toString(),
      virtualTourUrl: json['virtualTourUrl']?.toString(),
      brochureUrl: json['brochureUrl']?.toString(),
      occupancyCertificate: json['occupancyCertificate']?.toString() ?? 'Available',
      completionCertificate: json['completionCertificate']?.toString() ?? 'Available',
      propertyTaxStatus: json['propertyTaxStatus']?.toString() ?? 'Paid',
      approvedBy: json['approvedBy']?.toString() ?? 'NMC (Nagpur Municipal Corporation)',
      bankLoanApprovedBy: json['bankLoanApprovedBy']?.toString() ?? 'SBI, HDFC, ICICI, Axis Bank',
      propertyUsp: json['propertyUsp']?.toString() ?? '',
      suitableFor: parsedSuitableFor,
      cabins: int.tryParse(json['cabins']?.toString() ?? '0') ?? 0,
      workstations: int.tryParse(json['workstations']?.toString() ?? '0') ?? 0,
      conferenceRooms: int.tryParse(json['conferenceRooms']?.toString() ?? '0') ?? 0,
      assignedAgent: json['assignedAgent'] is Map<String, dynamic>
          ? AgentContact.fromJson(json['assignedAgent'])
          : null,
      owner: json['owner'] is Map<String, dynamic>
          ? AgentContact.fromJson(json['owner'])
          : null,
      viewsCount: int.tryParse(json['viewsCount']?.toString() ?? '0') ?? 0,
      enquiriesCount: int.tryParse(json['enquiriesCount']?.toString() ?? '0') ?? 0,
      isSaved: json['isSaved'] == true,
    );
  }
}
