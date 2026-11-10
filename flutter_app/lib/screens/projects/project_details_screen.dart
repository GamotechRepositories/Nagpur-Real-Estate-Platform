import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../models/project_model.dart';

class ProjectDetailsScreen extends StatelessWidget {
  final ProjectModel project;

  const ProjectDetailsScreen({Key? key, required this.project}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text(
          project.name,
          style: GoogleFonts.playfairDisplay(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 16 / 10,
              child: CachedNetworkImage(
                imageUrl: project.image,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.navy, borderRadius: BorderRadius.circular(4)),
                        child: Text(project.projectStatus, style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(4), border: Border.all(color: AppColors.verifiedGreen)),
                        child: Text('MahaRERA: ${project.reraNumber}', style: const TextStyle(fontSize: 10, color: AppColors.verifiedGreen, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Text(
                    project.name,
                    style: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.navy),
                  ),
                  Text(
                    'Developed by ${project.builderName}',
                    style: GoogleFonts.inter(fontSize: 13, color: AppColors.charcoalMuted),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: AppColors.charcoalMuted),
                      const SizedBox(width: 4),
                      Text('${project.localityName}, Nagpur', style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.beige),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Starting Price', style: GoogleFonts.inter(fontSize: 11, color: AppColors.charcoalMuted)),
                            Text(project.priceStarting, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Configurations', style: GoogleFonts.inter(fontSize: 11, color: AppColors.charcoalMuted)),
                            Text(project.configurationsText, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  Text('Project Overview', style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.beige),
                    ),
                    child: Text(
                      project.description.isNotEmpty
                          ? project.description
                          : 'A premier architectural landmark in Nagpur offering world-class lifestyle, multi-tier security, club amenities, and seamless transit to major educational and commercial avenues.',
                      style: GoogleFonts.inter(fontSize: 13, color: AppColors.charcoal, height: 1.5),
                    ),
                  ),
                  const SizedBox(height: 20),

                  if (project.amenities.isNotEmpty) ...[
                    Text('Community Amenities', style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: project.amenities.map((a) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.beige),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check, size: 14, color: AppColors.gold),
                              const SizedBox(width: 4),
                              Text(a, style: const TextStyle(fontSize: 11)),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 30),
                  ],

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        launchUrl(Uri.parse('tel:+919823000000'));
                      },
                      icon: const Icon(Icons.phone),
                      label: const Text('Contact Developer Sales Concierge'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.navy,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

