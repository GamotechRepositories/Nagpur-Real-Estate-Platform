import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../models/locality_model.dart';
import '../../providers/property_provider.dart';
import '../properties/property_list_screen.dart';

class LocalityDetailsScreen extends StatelessWidget {
  final LocalityModel locality;

  const LocalityDetailsScreen({Key? key, required this.locality}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text(
          locality.name,
          style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: CachedNetworkImage(
                imageUrl: locality.image,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        locality.name,
                        style: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.navy),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.gold, borderRadius: BorderRadius.circular(4)),
                        child: Text(locality.avgPrice, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Nagpur Sector • Pincode: ${locality.pincode.isNotEmpty ? locality.pincode : '440010'}',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted),
                  ),
                  const SizedBox(height: 16),

                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.beige),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Neighborhood Overview', style: GoogleFonts.playfairDisplay(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.navy)),
                        const SizedBox(height: 8),
                        Text(
                          locality.description.isNotEmpty
                              ? locality.description
                              : '${locality.name} is one of Nagpur’s prime growth hubs, featuring well-connected road networks, healthcare institutions, reputable schools, and modern residential townships.',
                          style: GoogleFonts.inter(fontSize: 13, color: AppColors.charcoal, height: 1.5),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        final prov = Provider.of<PropertyProvider>(context, listen: false);
                        prov.setFilters(locality: locality.name);
                        prov.searchProperties();
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const PropertyListScreen()),
                        );
                      },
                      icon: const Icon(Icons.search),
                      label: Text('View All Properties in ${locality.name}'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.navy,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
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

