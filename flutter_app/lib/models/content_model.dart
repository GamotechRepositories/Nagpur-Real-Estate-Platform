class ContentModel {
  final String id;
  final String slug;
  final String title;
  final String category;
  final String language;
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
    this.category = 'BLOG',
    this.language = 'en',
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

    final rawImage = json['coverImage']?.toString() ?? json['image']?.toString() ?? '';
    String cleanImage = defaultImage;
    if (rawImage.trim().startsWith('http://') || rawImage.trim().startsWith('https://')) {
      cleanImage = rawImage.trim();
    } else if (rawImage.trim().startsWith('/')) {
      cleanImage = 'http://localhost:5000${rawImage.trim()}';
    }

    String authorName = 'Nagpur Realty Editorial';
    if (json['author'] is Map) {
      authorName = (json['author'] as Map)['name']?.toString() ?? authorName;
    } else if (json['author'] != null && json['author'].toString().isNotEmpty) {
      authorName = json['author'].toString();
    }

    return ContentModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Market Insights',
      category: json['category']?.toString() ?? 'BLOG',
      language: json['language']?.toString() ?? 'en',
      readTime: json['readTime']?.toString() ?? '5 min read',
      publishedAt: json['createdAt']?.toString() ?? json['publishedAt']?.toString() ?? '',
      author: authorName,
      excerpt: json['excerpt']?.toString() ?? '',
      body: json['content']?.toString() ?? json['body']?.toString() ?? '',
      image: cleanImage,
    );
  }
}
