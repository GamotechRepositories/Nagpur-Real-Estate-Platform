import '../core/utils/formatters.dart';

class ProjectModel {
  final String id;
  final String name;
  final String slug;
  final String builderName;
  final String localityName;
  final String address;
  final String pincode;
  final String projectStatus;
  final String reraNumber;
  final String priceStarting;
  final num minPrice;
  final String configurationsText;
  final String image;
  final String description;
  final List<String> amenities;

  ProjectModel({
    required this.id,
    required this.name,
    required this.slug,
    this.builderName = 'Reputed Developer',
    this.localityName = 'Nagpur',
    this.address = '',
    this.pincode = '440010',
    this.projectStatus = 'Under Construction',
    this.reraNumber = '',
    this.priceStarting = 'Price on Request',
    this.minPrice = 0,
    this.configurationsText = '2 & 3 BHK Apartments',
    required this.image,
    this.description = '',
    this.amenities = const [],
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    const defaultImage =
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

    final rawAmenities = json['amenities'] as List<dynamic>? ?? [];
    final amenitiesList = rawAmenities.map((a) => a.toString()).toList();

    // 1. Cover Image resolution (admin stores images: [{ url, isCover, ... }])
    String rawImage = '';
    if (json['images'] is List && (json['images'] as List).isNotEmpty) {
      final list = json['images'] as List;
      final cover = list.firstWhere(
        (i) => i is Map && i['isCover'] == true,
        orElse: () => list.first,
      );
      if (cover is Map && cover['url'] != null) {
        rawImage = cover['url'].toString();
      }
    }
    if (rawImage.isEmpty) {
      rawImage = json['coverImage']?.toString() ??
          json['image']?.toString() ??
          json['coverPhoto']?.toString() ??
          '';
    }

    final cleanImage = (rawImage.trim().startsWith('http://') ||
            rawImage.trim().startsWith('https://'))
        ? rawImage.trim()
        : defaultImage;

    // 2. Project Status
    final rawStatus = json['projectStatus']?.toString().toUpperCase() ?? '';
    String friendlyStatus;
    switch (rawStatus) {
      case 'UNDER_CONSTRUCTION':
        friendlyStatus = 'Under Construction';
        break;
      case 'READY_TO_MOVE':
        friendlyStatus = 'Ready Possession';
        break;
      case 'NEW_LAUNCH':
        friendlyStatus = 'New Launch';
        break;
      case 'COMPLETED':
        friendlyStatus = 'Completed';
        break;
      default:
        friendlyStatus = json['projectStatus']?.toString().isNotEmpty == true
            ? json['projectStatus'].toString()
            : 'Under Construction';
    }

    // 3. Price resolution
    num minP = 0;
    if (json['priceRange'] is Map) {
      minP = num.tryParse(json['priceRange']['minPrice']?.toString() ?? '0') ?? 0;
    }
    if (minP == 0 && json['startingPrice'] != null) {
      minP = num.tryParse(json['startingPrice'].toString()) ?? 0;
    }
    if (minP == 0 && json['minPrice'] != null) {
      minP = num.tryParse(json['minPrice'].toString()) ?? 0;
    }

    String priceStr;
    if (minP > 0) {
      priceStr = '${Formatters.formatIndianPrice(minP)} Onwards';
    } else if (json['priceStarting'] != null &&
        json['priceStarting'].toString().isNotEmpty) {
      priceStr = json['priceStarting'].toString();
    } else {
      priceStr = 'Price on Request';
    }

    // 4. Builder Name
    String bName = 'Reputed Developer';
    if (json['builderName'] != null && json['builderName'].toString().isNotEmpty) {
      bName = json['builderName'].toString();
    } else if (json['builder'] is Map &&
        json['builder']['name'] != null &&
        json['builder']['name'].toString().isNotEmpty) {
      bName = json['builder']['name'].toString();
    }

    return ProjectModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Nagpur Project',
      slug: json['slug']?.toString() ?? '',
      builderName: bName,
      localityName: json['localityName']?.toString() ?? 'Nagpur',
      address: json['address']?.toString() ?? '',
      pincode: json['pincode']?.toString() ?? '440010',
      projectStatus: friendlyStatus,
      reraNumber: json['reraNumber']?.toString() ?? '',
      priceStarting: priceStr,
      minPrice: minP,
      configurationsText: json['configurationsText']?.toString() ?? '2 & 3 BHK Apartments',
      image: cleanImage,
      description: json['description']?.toString() ?? '',
      amenities: amenitiesList,
    );
  }
}
