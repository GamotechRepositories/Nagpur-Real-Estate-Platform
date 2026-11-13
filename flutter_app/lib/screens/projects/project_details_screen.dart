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
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          project.name,
          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
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
                        decoration: BoxDecoration(color: AppColors.primaryGreen, borderRadius: BorderRadius.circular(4)),
                        child: Text(project.projectStatus, style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.3)),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.lightGreen,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
                        ),
                        child: Text('MahaRERA: ${project.reraNumber}', style: const TextStyle(fontSize: 10, color: AppColors.darkGreen, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Text(
                    project.name,
                    style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Developed by ${project.builderName}',
                    style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 15, color: AppColors.primaryGreen),
                      const SizedBox(width: 4),
                      Text('${project.localityName}, Nagpur', style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  Container(
                    padding: const EdgeInsets.all(16),
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
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Starting Price', style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText)),
                            const SizedBox(height: 2),
                            Text(project.priceStarting, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryGreen)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Configurations', style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText)),
                            const SizedBox(height: 2),
                            Text(project.configurationsText, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  Text('Project Overview', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderGrey),
                    ),
                    child: Text(
                      project.description.isNotEmpty
                          ? project.description
                          : 'A premier architectural landmark in Nagpur offering world-class lifestyle, multi-tier security, club amenities, and seamless transit to major educational and commercial avenues.',
                      style: GoogleFonts.inter(fontSize: 13, color: AppColors.primaryText, height: 1.5),
                    ),
                  ),
                  const SizedBox(height: 20),

                  if (project.amenities.isNotEmpty) ...[
                    Text('Community Amenities', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: project.amenities.map((a) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: AppColors.lightGreen,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.primaryGreen.withOpacity(0.25)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check_circle, size: 14, color: AppColors.primaryGreen),
                              const SizedBox(width: 6),
                              Text(a, style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w500, color: AppColors.primaryText)),
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
                        final text = Uri.encodeComponent('Hello, I would like to receive the brochure and floor plans for "${project.name}" in Nagpur.');
                        launchUrl(Uri.parse('https://wa.me/919823000000?text=$text'), mode: LaunchMode.externalApplication);
                      },
                      icon: const Icon(Icons.download_for_offline_outlined, size: 18),
                      label: Text('Request Brochure & Price Sheet', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13.5)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => launchUrl(Uri.parse('tel:+919823000000')),
                      icon: const Icon(Icons.phone, size: 18, color: AppColors.primaryText),
                      label: Text('Speak With Project Consultant', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppColors.primaryText)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        side: const BorderSide(color: AppColors.borderGrey),
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
