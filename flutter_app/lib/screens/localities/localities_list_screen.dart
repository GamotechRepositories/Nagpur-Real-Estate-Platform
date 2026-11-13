import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/property_provider.dart';
import 'locality_details_screen.dart';

class LocalitiesListScreen extends StatelessWidget {
  const LocalitiesListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final prov = Provider.of<PropertyProvider>(context);
    final localities = prov.localities;

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          'Nagpur Localities Directory',
          style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: localities.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: localities.length,
              itemBuilder: (context, index) {
                final loc = localities[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => LocalityDetailsScreen(locality: loc),
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderGrey),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
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
                            imageUrl: loc.image,
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
                                  Text(
                                    loc.name,
                                    style: GoogleFonts.inter(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primaryText,
                                    ),
                                  ),
                                  Text(
                                    loc.avgPrice,
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.primaryGreen,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${loc.propertyCount} Active Properties • Pincode: ${loc.pincode.isNotEmpty ? loc.pincode : '440010'}',
                                style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                              ),
                              if (loc.description.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Text(
                                  loc.description,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.primaryText, height: 1.3),
                                ),
                              ],
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  Text(
                                    'Explore Neighborhood Guide',
                                    style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.arrow_forward, size: 14, color: AppColors.primaryGreen),
                                ],
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
