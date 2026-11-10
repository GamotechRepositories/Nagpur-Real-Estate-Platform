import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/property_provider.dart';

class AgentsListScreen extends StatelessWidget {
  const AgentsListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final prov = Provider.of<PropertyProvider>(context);
    final agents = prov.agents;

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text(
          'Verified Agents Directory',
          style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      body: agents.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: agents.length,
              itemBuilder: (context, index) {
                final agent = agents[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.beige),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.navy.withOpacity(0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundImage: CachedNetworkImageProvider(agent.avatar),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        agent.name,
                                        style: GoogleFonts.playfairDisplay(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.navy,
                                        ),
                                      ),
                                    ),
                                    const Icon(Icons.verified, size: 16, color: AppColors.verifiedGreen),
                                  ],
                                ),
                                Text(
                                  agent.agency,
                                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.charcoalMuted),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.star, color: Colors.amber, size: 14),
                                    const SizedBox(width: 3),
                                    Text(
                                      '${agent.rating} (${agent.reviewsCount} reviews)',
                                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(width: 10),
                                    Text(
                                      '• ${agent.experience}',
                                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.charcoalMuted),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  agent.specialization,
                                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.goldDark, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      const Divider(height: 1, color: AppColors.beige),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => launchUrl(Uri.parse('tel:+91${agent.phone}')),
                              icon: const Icon(Icons.phone, size: 16),
                              label: const Text('Call Agent'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                final text = Uri.encodeComponent(
                                  'Hello ${agent.name}, I am looking for property options in Nagpur.',
                                );
                                launchUrl(
                                  Uri.parse('https://wa.me/91${agent.phone}?text=$text'),
                                  mode: LaunchMode.externalApplication,
                                );
                              },
                              icon: const Icon(Icons.chat_bubble_outline, size: 16),
                              label: const Text('WhatsApp'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.verifiedGreen,
                                padding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
