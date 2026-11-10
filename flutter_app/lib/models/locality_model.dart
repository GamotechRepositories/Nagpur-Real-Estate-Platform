class LocalityModel {
  final String id;
  final String name;
  final String slug;
  final String pincode;
  final int propertyCount;
  final String avgPrice;
  final String image;
  final String description;

  LocalityModel({
    required this.id,
    required this.name,
    required this.slug,
    this.pincode = '',
    this.propertyCount = 0,
    this.avgPrice = '₹5,500/Sq.Ft.',
    required this.image,
    this.description = '',
  });

  factory LocalityModel.fromJson(Map<String, dynamic> json) {
    const defaultImage =
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

    final areaGuide = json['areaGuide'] as Map<String, dynamic>?;
    final avgPriceFromGuide = areaGuide?['averagePricePerSqFt'] != null
        ? '₹${areaGuide!['averagePricePerSqFt']}/Sq.Ft.'
        : '₹5,500/Sq.Ft.';

    return LocalityModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Nagpur Locality',
      slug: json['slug']?.toString() ?? '',
      pincode: json['pincode']?.toString() ?? '',
      propertyCount: int.tryParse(json['propertyCount']?.toString() ?? '0') ?? 0,
      avgPrice: avgPriceFromGuide,
      image: json['heroImage']?.toString() ?? defaultImage,
      description: json['description']?.toString() ?? '',
    );
  }
}

