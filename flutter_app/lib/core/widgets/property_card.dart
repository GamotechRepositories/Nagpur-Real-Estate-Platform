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
          border: Border.all(color: AppColors.borderGrey, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
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
                      color: AppColors.lightGrey,
                      child: const Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: AppColors.lightGrey,
                      child: const Icon(
                        Icons.home_work_outlined,
                        color: AppColors.secondaryText,
                        size: 36,
                      ),
                    ),
                  ),
                ),
                // Badges (Top Left)
                Positioned(
                  top: 8,
                  left: 8,
                  child: Row(
                    children: [
                      if (property.isFeatured)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 7,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreen,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'FEATURED',
                            style: GoogleFonts.inter(
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: 0.3,
                            ),
                          ),
                        )
                      else if (property.isVerified)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 7,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.darkGreen,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.verified, size: 11, color: Colors.white),
                              const SizedBox(width: 3),
                              Text(
                                'VERIFIED',
                                style: GoogleFonts.inter(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                // Save Heart (Top Right)
                Positioned(
                  top: 8,
                  right: 8,
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
                        color: isSaved ? AppColors.errorRed : AppColors.secondaryText,
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
                  // Price (Zameen Style: Bold, crisp)
                  Text(
                    Formatters.formatIndianPrice(
                      property.price,
                      priceUnit: property.purpose,
                    ),
                    style: GoogleFonts.inter(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryGreen,
                    ),
                  ),
                  const SizedBox(height: 3),

                  // Title
                  Text(
                    property.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryText,
                    ),
                  ),
                  const SizedBox(height: 3),

                  // Locality with Pin Icon
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 13,
                        color: AppColors.primaryGreen,
                      ),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          '${property.localityName}, Nagpur',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.secondaryText,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 7),

                  // Specs Row (Bed | Bath | Area)
                  Row(
                    children: [
                      if (property.bedrooms > 0) ...[
                        Icon(Icons.bed_outlined, size: 13, color: AppColors.secondaryText),
                        const SizedBox(width: 2),
                        Text(
                          '${property.bedrooms}',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryText,
                          ),
                        ),
                        const SizedBox(width: 6),
                      ],
                      if (property.bathrooms > 0) ...[
                        Icon(Icons.bathtub_outlined, size: 13, color: AppColors.secondaryText),
                        const SizedBox(width: 2),
                        Text(
                          '${property.bathrooms}',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryText,
                          ),
                        ),
                        const SizedBox(width: 6),
                      ],
                      Icon(Icons.square_foot_outlined, size: 13, color: AppColors.secondaryText),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          Formatters.formatArea(property.areaSqFt),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryText,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // EMI info if BUY
                  if (property.purpose != 'RENT') ...[
                    const SizedBox(height: 4),
                    Text(
                      'EMI from ${Formatters.calculateEstimateEmi(property.price)}',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: AppColors.mutedText,
                      ),
                    ),
                  ],

                  const SizedBox(height: 10),
                  const Divider(height: 1, color: AppColors.borderGrey),
                  const SizedBox(height: 8),

                  // Action Buttons (Call & WhatsApp)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _makePhoneCall(agentPhone),
                          icon: const Icon(Icons.phone, size: 13, color: AppColors.primaryText),
                          label: const Text('Call', style: TextStyle(fontSize: 11, color: AppColors.primaryText)),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 7),
                            side: const BorderSide(color: AppColors.borderGrey),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                            visualDensity: VisualDensity.compact,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _openWhatsApp(
                            agentPhone,
                            property.title,
                            property.localityName,
                          ),
                          icon: const Icon(Icons.chat_bubble_outline, size: 13),
                          label: const Text('WhatsApp', style: TextStyle(fontSize: 11)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.whatsappGreen,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 7),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                            visualDensity: VisualDensity.compact,
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
          border: Border.all(color: AppColors.borderGrey, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
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
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreen,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'FEATURED',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: 0.3,
                            ),
                          ),
                        )
                      : property.isVerified
                          ? Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.darkGreen,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.verified, size: 12, color: Colors.white),
                                  const SizedBox(width: 4),
                                  Text(
                                    'VERIFIED',
                                    style: GoogleFonts.inter(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                ],
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
                        color: isSaved ? AppColors.errorRed : AppColors.secondaryText,
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
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                      if (property.purpose != 'RENT')
                        Text(
                          'EMI from ${Formatters.calculateEstimateEmi(property.price)}',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.secondaryText,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    property.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryText,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 14,
                        color: AppColors.primaryGreen,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${property.localityName}, Nagpur',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.secondaryText,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${property.bedrooms > 0 ? '${property.bedrooms} BHK • ' : ''}${Formatters.formatArea(property.areaSqFt)}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryText,
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
                          icon: const Icon(Icons.phone, size: 14, color: AppColors.primaryText),
                          label: const Text('Call', style: TextStyle(color: AppColors.primaryText)),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 9),
                            side: const BorderSide(color: AppColors.borderGrey),
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
                            backgroundColor: AppColors.whatsappGreen,
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
