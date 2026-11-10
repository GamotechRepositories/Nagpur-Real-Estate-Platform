import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_colors.dart';
import '../utils/formatters.dart';
import '../../models/property_model.dart';
import '../../providers/auth_provider.dart';
import '../../screens/properties/property_details_screen.dart';
import 'auth_dialog.dart';

enum PropertyCardLayout { horizontal, grid }

class PropertyCard extends StatelessWidget {
  final PropertyModel property;
  final PropertyCardLayout layout;

  const PropertyCard({
    Key? key,
    required this.property,
    this.layout = PropertyCardLayout.grid,
  }) : super(key: key);

  void _onSaveTap(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) {
      showDialog(
        context: context,
        builder: (_) => const AuthDialog(),
      );
      return;
    }
    auth.toggleSavedProperty(property.id);
  }

  Future<void> _makePhoneCall(String phone) async {
    final uri = Uri.parse('tel:+91$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openWhatsApp(String phone, String title, String locality) async {
    final text = Uri.encodeComponent(
      'Hello, I am interested in "$title" in $locality, Nagpur.',
    );
    final uri = Uri.parse('https://wa.me/91$phone?text=$text');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isSaved = auth.isPropertySaved(property.id) || property.isSaved;
    final agentPhone = property.assignedAgent?.phone ??
        property.owner?.phone ??
        '9823000000';

    if (layout == PropertyCardLayout.horizontal) {
      return _buildHorizontalCard(context, isSaved, agentPhone);
    }
    return _buildGridCard(context, isSaved, agentPhone);
  }

  Widget _buildGridCard(
    BuildContext context,
    bool isSaved,
    String agentPhone,
  ) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PropertyDetailsScreen(slug: property.slug),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.beige),
          boxShadow: [
            BoxShadow(
              color: AppColors.navy.withOpacity(0.06),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Stack
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 10,
                  child: CachedNetworkImage(
                    imageUrl: property.coverImage,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: AppColors.ivoryDark,
                      child: const Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.gold,
                          ),
                        ),
                      ),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: AppColors.ivoryDark,
                      child: const Icon(
                        Icons.home_work_outlined,
                        color: AppColors.charcoalMuted,
                        size: 36,
                      ),
                    ),
                  ),
                ),
                // Badges (Top Left)
                Positioned(
                  top: 10,
                  left: 10,
                  child: Row(
                    children: [
                      if (property.isFeatured)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.gold,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Featured',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        )
                      else if (property.isVerified)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.verifiedGreen,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Verified',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                // Save Heart (Top Right)
                Positioned(
                  top: 10,
                  right: 10,
                  child: GestureDetector(
                    onTap: () => _onSaveTap(context),
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.92),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Icon(
                        isSaved ? Icons.favorite : Icons.favorite_border,
                        color: isSaved ? Colors.red : AppColors.charcoal,
                        size: 18,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Details Container
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price
                  Text(
                    Formatters.formatIndianPrice(
                      property.price,
                      priceUnit: property.purpose,
                    ),
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.navy,
                    ),
                  ),
                  const SizedBox(height: 3),

                  // Title
                  Text(
                    property.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Locality
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 13,
                        color: AppColors.charcoalMuted,
                      ),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          '${property.localityName}, Nagpur',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.charcoalMuted,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Specs Row (BHK | Bath | Area)
                  Row(
                    children: [
                      if (property.bedrooms > 0) ...[
                        Text(
                          '${property.bedrooms} BHK',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: AppColors.charcoal,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: Text(
                            '|',
                            style: TextStyle(
                              color: AppColors.beigeDark,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                      if (property.bathrooms > 0) ...[
                        Text(
                          '${property.bathrooms} Bath',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: AppColors.charcoal,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: Text(
                            '|',
                            style: TextStyle(
                              color: AppColors.beigeDark,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                      Text(
                        Formatters.formatArea(property.areaSqFt),
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppColors.charcoal,
                        ),
                      ),
                    ],
                  ),

                  // EMI info if BUY
                  if (property.purpose != 'RENT') ...[
                    const SizedBox(height: 6),
                    Text(
                      'EMI from ${Formatters.calculateEstimateEmi(property.price)}',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: AppColors.charcoalMuted,
                      ),
                    ),
                  ],

                  const SizedBox(height: 12),
                  const Divider(height: 1, color: AppColors.beige),
                  const SizedBox(height: 10),

                  // Action Buttons (Call & WhatsApp)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _makePhoneCall(agentPhone),
                          icon: const Icon(Icons.phone, size: 14),
                          label: const Text('Call'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            side: const BorderSide(color: AppColors.beigeDark),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _openWhatsApp(
                            agentPhone,
                            property.title,
                            property.localityName,
                          ),
                          icon: const Icon(Icons.chat_bubble_outline, size: 14),
                          label: const Text('WhatsApp'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.verifiedGreen,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHorizontalCard(
    BuildContext context,
    bool isSaved,
    String agentPhone,
  ) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PropertyDetailsScreen(slug: property.slug),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.beige),
          boxShadow: [
            BoxShadow(
              color: AppColors.navy.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          children: [
            // Top Image
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: CachedNetworkImage(
                    imageUrl: property.coverImage,
                    fit: BoxFit.cover,
                  ),
                ),
                // Badges
                Positioned(
                  top: 10,
                  left: 10,
                  child: property.isFeatured
                      ? Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.gold,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Featured',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        )
                      : property.isVerified
                          ? Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.verifiedGreen,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'Verified',
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            )
                          : const SizedBox.shrink(),
                ),
                // Heart Save
                Positioned(
                  top: 10,
                  right: 10,
                  child: GestureDetector(
                    onTap: () => _onSaveTap(context),
                    child: Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.92),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isSaved ? Icons.favorite : Icons.favorite_border,
                        color: isSaved ? Colors.red : AppColors.charcoal,
                        size: 18,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        Formatters.formatIndianPrice(
                          property.price,
                          priceUnit: property.purpose,
                        ),
                        style: GoogleFonts.inter(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.navy,
                        ),
                      ),
                      if (property.purpose != 'RENT')
                        Text(
                          'EMI from ${Formatters.calculateEstimateEmi(property.price)}',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.charcoalMuted,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    property.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 14,
                        color: AppColors.charcoalMuted,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${property.localityName}, Nagpur',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.charcoalMuted,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${property.bedrooms > 0 ? '${property.bedrooms} BHK • ' : ''}${Formatters.formatArea(property.areaSqFt)}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.charcoal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _makePhoneCall(agentPhone),
                          icon: const Icon(Icons.phone, size: 14),
                          label: const Text('Call'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 9),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _openWhatsApp(
                            agentPhone,
                            property.title,
                            property.localityName,
                          ),
                          icon: const Icon(Icons.chat_bubble_outline, size: 14),
                          label: const Text('WhatsApp'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.verifiedGreen,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 9),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
