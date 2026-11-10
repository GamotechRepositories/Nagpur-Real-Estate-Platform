import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
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
  },
  {
    'slug': 'nagpur-metro-phase-2-property-appreciation',
    'title': 'How Nagpur Metro Phase 2 is Boosting Property Prices along Wardha Road',
    'date': 'Jan 10, 2025',
    'readTime': '4 min read',
    'image': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'summary': 'Connecting MIHAN, Butibori, and central hubs: how upcoming metro expansions are driving residential demand and commercial valuations.',
    'tag': 'Infrastructure',
  },
  {
    'slug': 'nmrda-rera-compliance-guide-nagpur',
    'title': 'Complete Guide to NMRDA Sanctioned Layouts and MahaRERA Verification',
    'date': 'Dec 28, 2024',
    'readTime': '6 min read',
    'image': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'summary': 'Crucial checklist for plot buyers in Nagpur: verifying RL (Release Letter), NMRDA sanction orders, and 7/12 extract details before investing.',
    'tag': 'Legal Advisory',
  },
];

class BlogListScreen extends StatelessWidget {
  const BlogListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text(
          'Real Estate Insights & News',
          style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: kStaticArticles.length,
        itemBuilder: (context, index) {
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
                border: Border.all(color: AppColors.beige),
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
                                color: AppColors.gold.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                art['tag']!,
                                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                              ),
                            ),
                            Text(
                              '${art['date']} • ${art['readTime']}',
                              style: GoogleFonts.inter(fontSize: 10, color: AppColors.charcoalMuted),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          art['title']!,
                          style: GoogleFonts.playfairDisplay(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.navy,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          art['summary']!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

