class AgentModel {
  final String id;
  final String name;
  final String agency;
  final double rating;
  final int reviewsCount;
  final String experience;
  final String phone;
  final String avatar;
  final String specialization;
  final bool verified;

  AgentModel({
    required this.id,
    required this.name,
    required this.agency,
    this.rating = 4.8,
    this.reviewsCount = 28,
    this.experience = '8+ Years Exp.',
    required this.phone,
    required this.avatar,
    this.specialization = 'Nagpur Real Estate Specialist',
    this.verified = true,
  });

  factory AgentModel.fromJson(Map<String, dynamic> json) {
    const defaultAvatar =
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80';

    final userObj = json['user'] as Map<String, dynamic>?;

    return AgentModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: userObj?['name']?.toString() ?? json['name']?.toString() ?? 'Nagpur Advisor',
      agency: json['agencyName']?.toString() ?? json['agency']?.toString() ?? 'Prime Realty',
      rating: double.tryParse(json['rating']?.toString() ?? '4.8') ?? 4.8,
      reviewsCount: int.tryParse(json['reviewsCount']?.toString() ?? '28') ?? 28,
      experience: json['experience']?.toString() ?? '8+ Years Exp.',
      phone: userObj?['phone']?.toString() ?? json['phone']?.toString() ?? '9823000000',
      avatar: userObj?['avatar']?.toString() ?? json['avatar']?.toString() ?? defaultAvatar,
      specialization: json['bio']?.toString() ?? json['specialization']?.toString() ?? 'Nagpur Specialist',
      verified: true,
    );
  }
}

