import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../../screens/properties/property_list_screen.dart';
import '../../screens/projects/projects_list_screen.dart';
import '../../screens/agents/agents_list_screen.dart';
import '../../screens/localities/localities_list_screen.dart';
import '../../screens/tools/emi_calculator_screen.dart';
import '../../screens/tools/area_converter_screen.dart';
import '../../screens/tools/loan_enquiry_screen.dart';
import '../../screens/blog/blog_list_screen.dart';
import '../../screens/content/content_details_screen.dart';
import '../../screens/account/my_properties_screen.dart';
import '../../screens/account/saved_properties_screen.dart';
import '../../screens/post_property/post_property_screen.dart';
import 'brand_logo.dart';
import 'auth_dialog.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final propProv = Provider.of<PropertyProvider>(context, listen: false);

    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              color: AppColors.navyDark,
              child: Row(
                children: [
                  const BrandLogo(light: true, showSubtitle: true),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // User Profile Banner if logged in
            if (auth.isAuthenticated && auth.user != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                color: AppColors.ivoryDark,
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.gold,
                      child: Text(
                        auth.user!.name.isNotEmpty ? auth.user!.name[0].toUpperCase() : 'U',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            auth.user!.name,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.navy,
                            ),
                          ),
                          Text(
                            '+91 ${auth.user!.phone} • ${auth.user!.role}',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.charcoalMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            // Menu Items List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _buildNavTile(
                    context,
                    icon: Icons.search,
                    title: 'Buy Properties',
                    onTap: () {
                      Navigator.pop(context);
                      propProv.setActiveTab('Buy');
                      propProv.clearFilters();
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PropertyListScreen()),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.key_outlined,
                    title: 'Rent Flats & Homes',
                    onTap: () {
                      Navigator.pop(context);
                      propProv.setActiveTab('Rent');
                      propProv.clearFilters();
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PropertyListScreen()),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.landscape_outlined,
                    title: 'Plots & Land (NMRDA/RL)',
                    onTap: () {
                      Navigator.pop(context);
                      propProv.setActiveTab('Plots');
                      propProv.clearFilters();
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PropertyListScreen()),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.business_outlined,
                    title: 'Commercial Properties',
                    onTap: () {
                      Navigator.pop(context);
                      propProv.setActiveTab('Commercial');
                      propProv.clearFilters();
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PropertyListScreen()),
                      );
                    },
                  ),
                  const Divider(color: AppColors.beige),

                  _buildNavTile(
                    context,
                    icon: Icons.domain,
                    title: 'New & Ongoing Projects',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ProjectsListScreen()),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.support_agent,
                    title: 'Verified Agents Directory',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const AgentsListScreen()),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.map_outlined,
                    title: 'Explore Nagpur Localities',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LocalitiesListScreen()),
                      );
                    },
                  ),
                  const Divider(color: AppColors.beige),

                  // Real Estate Tools
                  _buildNavTile(
                    context,
                    icon: Icons.calculate_outlined,
                    title: 'Home Loan EMI Calculator',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const EmiCalculatorScreen()),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.square_foot_outlined,
                    title: 'Area Unit Converter',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const AreaConverterScreen()),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.account_balance_outlined,
                    title: 'Financing & Loan Enquiry',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoanEnquiryScreen()),
                      );
                    },
                  ),
                  const Divider(color: AppColors.beige),

                  // Content & Legal
                  _buildNavTile(
                    context,
                    icon: Icons.article_outlined,
                    title: 'Real Estate Insights & News',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const BlogListScreen()),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.gavel_outlined,
                    title: 'Terms of Service',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ContentDetailsScreen(slug: 'terms-of-service'),
                        ),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.security_outlined,
                    title: 'Privacy Policy',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ContentDetailsScreen(slug: 'privacy-policy'),
                        ),
                      );
                    },
                  ),
                  _buildNavTile(
                    context,
                    icon: Icons.verified_user_outlined,
                    title: 'MahaRERA Guidelines',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ContentDetailsScreen(slug: 'rera-compliance-guide'),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Bottom Actions (Post Property / Login / Logout)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppColors.ivory,
                border: Border(top: BorderSide(color: AppColors.beige)),
              ),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        if (!auth.isAuthenticated) {
                          showDialog(
                            context: context,
                            builder: (_) => const AuthDialog(),
                          );
                        } else {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const PostPropertyScreen()),
                          );
                        }
                      },
                      icon: const Icon(Icons.add_circle_outline, color: Colors.white, size: 18),
                      label: Text(
                        'Post Property Free',
                        style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.gold,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 13),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  if (auth.isAuthenticated) ...[
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const MyPropertiesScreen()),
                              );
                            },
                            child: const Text('My Listings', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()),
                              );
                            },
                            child: const Text('Wishlist', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        auth.logout();
                      },
                      icon: const Icon(Icons.logout, size: 16, color: AppColors.errorRed),
                      label: Text(
                        'Sign Out',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.errorRed),
                      ),
                    ),
                  ] else ...[
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          showDialog(
                            context: context,
                            builder: (_) => const AuthDialog(),
                          );
                        },
                        icon: const Icon(Icons.person_outline, size: 18),
                        label: const Text('Sign In / Register'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.navy, size: 20),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: AppColors.charcoal,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, size: 18, color: AppColors.charcoalMuted),
      onTap: onTap,
      dense: true,
    );
  }
}

