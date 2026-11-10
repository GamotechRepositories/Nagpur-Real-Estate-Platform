class ProjectModel {
  final String id;
  final String name;
  final String slug;
  final String builderName;
  final String localityName;
  final String address;
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
    this.projectStatus = 'Ready Possession',
    this.reraNumber = 'P50500012345',
    this.priceStarting = '₹80 Lakh Onwards',
    this.minPrice = 8000000,
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

    return ProjectModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Nagpur Project',
      slug: json['slug']?.toString() ?? '',
      builderName: json['builderName']?.toString() ?? 'Reputed Developer',
      localityName: json['localityName']?.toString() ?? 'Nagpur',
      address: json['address']?.toString() ?? '',
      projectStatus: json['projectStatus']?.toString() ?? 'Ready Possession',
      reraNumber: json['reraNumber']?.toString() ?? 'P50500012345',
      priceStarting: json['priceStarting']?.toString() ?? '₹80 Lakh Onwards',
      minPrice: num.tryParse(json['minPrice']?.toString() ?? '8000000') ?? 8000000,
      configurationsText: json['configurationsText']?.toString() ?? '2 & 3 BHK Apartments',
      image: json['coverImage']?.toString() ?? json['image']?.toString() ?? defaultImage,
      description: json['description']?.toString() ?? '',
      amenities: amenitiesList,
    );
  }
}

