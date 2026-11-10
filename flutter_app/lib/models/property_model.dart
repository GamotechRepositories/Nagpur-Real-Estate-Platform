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

  AgentContact({
    required this.id,
    required this.name,
    required this.phone,
    this.avatar,
  });

  factory AgentContact.fromJson(Map<String, dynamic> json) {
    return AgentContact(
      id: json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Agent',
      phone: json['phone']?.toString() ?? '9823000000',
      avatar: json['avatar']?.toString(),
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
  final num price;
  final String priceUnit;
  final bool priceNegotiable;
  final num areaSqFt;
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
  final String localityName;
  final String address;
  final String pincode;
  final String coverImage;
  final List<PropertyImage> images;
  final List<String> amenities;
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
    required this.price,
    this.priceUnit = 'Total',
    this.priceNegotiable = false,
    required this.areaSqFt,
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
    required this.localityName,
    this.address = '',
    this.pincode = '',
    required this.coverImage,
    required this.images,
    required this.amenities,
    this.assignedAgent,
    this.owner,
    this.viewsCount = 0,
    this.enquiriesCount = 0,
    this.isSaved = false,
  });

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    const defaultImage =
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

    final rawImages = json['images'] as List<dynamic>? ?? [];
    final parsedImages = rawImages
        .map((img) => PropertyImage.fromJson(img as Map<String, dynamic>))
        .toList();

    final cover = json['coverImage']?.toString() ??
        (parsedImages.isNotEmpty ? parsedImages.first.url : defaultImage);

    final rawAmenities = json['amenities'] as List<dynamic>? ?? [];
    final parsedAmenities = rawAmenities.map((a) => a.toString()).toList();

    return PropertyModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Nagpur Property',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? 'RESIDENTIAL',
      subtype: json['subtype']?.toString() ?? 'FLAT',
      purpose: json['purpose']?.toString() ?? 'BUY',
      price: num.tryParse(json['price']?.toString() ?? '0') ?? 0,
      priceUnit: json['priceUnit']?.toString() ?? 'Total',
      priceNegotiable: json['priceNegotiable'] == true,
      areaSqFt: num.tryParse(json['areaSqFt']?.toString() ?? json['areaDisplay']?.toString() ?? '0') ?? 0,
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
      localityName: json['localityName']?.toString() ?? 'Nagpur',
      address: json['address']?.toString() ?? '',
      pincode: json['pincode']?.toString() ?? '',
      coverImage: cover.isNotEmpty ? cover : defaultImage,
      images: parsedImages,
      amenities: parsedAmenities,
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

