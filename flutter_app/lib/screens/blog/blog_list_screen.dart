import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/content_model.dart';
import '../../providers/property_provider.dart';
import '../content/content_details_screen.dart';

const List<Map<String, String>> kStaticArticles = [
  {
    'slug': 'top-10-localities-nagpur-property-investment-2025',
    'title': 'Top 10 Localities in Nagpur for Property Investment in 2025',
    'date': 'Jan 15, 2025',
    'readTime': '5 min read',
    'image': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'summary': 'An in-depth analysis of emerging growth corridors, capital appreciation trends, and rental yields across Dharampeth, Manish Nagar, Wardha Road, and Besa.',
    'tag': 'Investment Guide',
    'lang': 'en',
  },
  {
    'slug': 'nagpur-metro-phase-2-property-appreciation',
    'title': 'How Nagpur Metro Phase 2 is Boosting Property Prices along Wardha Road',
    'date': 'Jan 10, 2025',
    'readTime': '4 min read',
    'image': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'summary': 'Connecting MIHAN, Butibori, and central hubs: how upcoming metro expansions are driving residential demand and commercial valuations.',
    'tag': 'Infrastructure',
    'lang': 'en',
  },
  {
    'slug': 'nmrda-rera-compliance-guide-nagpur',
    'title': 'Complete Guide to NMRDA Sanctioned Layouts and MahaRERA Verification',
    'date': 'Dec 28, 2024',
    'readTime': '6 min read',
    'image': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'summary': 'Crucial checklist for plot buyers in Nagpur: verifying RL (Release Letter), NMRDA sanction orders, and 7/12 extract details before investing.',
    'tag': 'Legal Advisory',
    'lang': 'en',
  },
  {
    'slug': 'why-besa-manish-nagar-fastest-growing-hubs',
    'title': 'Why Besa & Manish Nagar are Nagpur\'s Fastest Growing Residential Hubs',
    'date': 'Dec 20, 2024',
    'readTime': '5 min read',
    'image': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    'summary': 'Proximity to MIHAN, international airport, metro connectivity, and top schools make Besa & Manish Nagar the hottest choices for homebuyers.',
    'tag': 'Residential Hubs',
    'lang': 'en',
  },
  {
    'slug': 'nagpur-stamp-duty-registration-charges-guide',
    'title': 'नागपूरमधील घरांची खरेदी: रेरा (RERA) आणि 7/12 उतारा तपासणी मार्गदर्शक',
    'date': 'Dec 15, 2024',
    'readTime': '6 min read',
    'image': 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
    'summary': 'नागपुरात प्लॉट किंवा फ्लॅट घेताना रेरा नोंदणी, एनएमआरडीए (NMRDA) मंजुरी आणि ७/१२ उतारा कसा तपासावा याबद्दल सविस्तर माहिती.',
    'tag': 'रेरा मार्गदर्शक',
    'lang': 'mr',
  },
];

class BlogListScreen extends StatelessWidget {
  const BlogListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final propProv = Provider.of<PropertyProvider>(context);
    final List<ContentModel> dynamicArticles = propProv.articles;
    final bool hasDynamic = dynamicArticles.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          'Articles & Real Estate Insights',
          style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: ListView.builder(
        padding: EdgeInsets.fromLTRB(16, 16, 16, 36 + MediaQuery.of(context).padding.bottom),
        itemCount: hasDynamic ? dynamicArticles.length : kStaticArticles.length,
        itemBuilder: (context, index) {
          if (hasDynamic) {
            final art = dynamicArticles[index];
            final isMarathi = art.language == 'mr';

            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ContentDetailsScreen(
                      slug: art.slug,
                      initialTitle: art.title,
                      initialSummary: art.body.isNotEmpty ? art.body : art.excerpt,
                      initialImage: art.image,
                    ),
                  ),
                );
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderGrey),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AspectRatio(
                      aspectRatio: 16 / 8,
                      child: CachedNetworkImage(
                        imageUrl: art.image,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: AppColors.lightGrey),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.lightGrey,
                          child: const Icon(Icons.image_not_supported, color: AppColors.secondaryText),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppColors.lightGreen,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      art.category.replaceAll('_', ' '),
                                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                                    ),
                                  ),
                                  if (isMarathi) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryGreen,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        'मराठी',
                                        style: GoogleFonts.inter(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.white),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              Text(
                                art.readTime,
                                style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.secondaryText),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            art.title,
                            style: GoogleFonts.inter(
                              fontSize: 15.5,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            art.excerpt,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          } else {
            final art = kStaticArticles[index];
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ContentDetailsScreen(
                      slug: art['slug']!,
                      initialTitle: art['title'],
                      initialSummary: art['summary'],
                      initialImage: art['image'],
                    ),
                  ),
                );
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderGrey),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AspectRatio(
                      aspectRatio: 16 / 8,
                      child: CachedNetworkImage(
                        imageUrl: art['image']!,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.lightGreen,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  art['tag']!,
                                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                                ),
                              ),
                              Text(
                                '${art['date']} • ${art['readTime']}',
                                style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.secondaryText),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            art['title']!,
                            style: GoogleFonts.inter(
                              fontSize: 15.5,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            art['summary']!,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }
        },
      ),
    );
  }
}
