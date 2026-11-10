class ContentModel {
  final String id;
  final String slug;
  final String title;
  final String category;
  final String readTime;
  final String publishedAt;
  final String author;
  final String excerpt;
  final String body;
  final String image;

  ContentModel({
    required this.id,
    required this.slug,
    required this.title,
    this.category = 'GUIDE',
    this.readTime = '5 min read',
    this.publishedAt = '',
    this.author = 'Nagpur Realty Editorial',
    required this.excerpt,
    required this.body,
    required this.image,
  });

  factory ContentModel.fromJson(Map<String, dynamic> json) {
    const defaultImage =
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

    return ContentModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Market Insights',
      category: json['category']?.toString() ?? 'GUIDE',
      readTime: json['readTime']?.toString() ?? '5 min read',
      publishedAt: json['publishedAt']?.toString() ?? '',
      author: json['author']?.toString() ?? 'Nagpur Realty Editorial',
      excerpt: json['excerpt']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      image: json['coverImage']?.toString() ?? defaultImage,
    );
  }
}

