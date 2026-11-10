class UserModel {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String role;
  final String? avatar;
  final bool isPhoneVerified;
  final bool isEmailVerified;

  UserModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    required this.role,
    this.avatar,
    this.isPhoneVerified = false,
    this.isEmailVerified = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['fullName']?.toString() ?? 'User',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString(),
      role: json['role']?.toString() ?? 'USER',
      avatar: json['avatar']?.toString(),
      isPhoneVerified: json['isPhoneVerified'] == true,
      isEmailVerified: json['isEmailVerified'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'role': role,
      'avatar': avatar,
      'isPhoneVerified': isPhoneVerified,
      'isEmailVerified': isEmailVerified,
    };
  }
}

