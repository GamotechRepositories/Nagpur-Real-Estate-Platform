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
import '../network/api_client.dart';
import 'brand_logo.dart';
import 'auth_dialog.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final propProv = Provider.of<PropertyProvider>(context, listen: false);

    return Drawer(
      backgroundColor: AppColors.white,
      child: SafeArea(
        child: Column(
          children: [
            // Zameen-Style Header: Vibrant Primary Green with Logo and Close Icon
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
              color: AppColors.primaryGreen,
              child: Row(
                children: [
                  const BrandLogo(light: true, showSubtitle: true),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white, size: 22),
                    onPressed: () => Navigator.pop(context),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),

            // User Profile Banner / Sign-in Prompt
            if (auth.isAuthenticated && auth.user != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                decoration: const BoxDecoration(
                  color: AppColors.lightGreen,
                  border: Border(bottom: BorderSide(color: AppColors.borderGrey)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.primaryGreen,
                      child: Text(
                        auth.user!.name.isNotEmpty ? auth.user!.name[0].toUpperCase() : 'U',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontSize: 16,
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
                              color: AppColors.primaryText,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '+91 ${auth.user!.phone} • ${auth.user!.role}',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                decoration: const BoxDecoration(
                  color: AppColors.lightGrey,
                  border: Border(bottom: BorderSide(color: AppColors.borderGrey)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: const BoxDecoration(
                        color: AppColors.lightGreen,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.person_outline, color: AppColors.primaryGreen, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome to Nagpur Realty',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryText,
                            ),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            'Sign in for personalized properties',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            // Backend Environment Status & Toggle (Live Render vs Local USB)
            StatefulBuilder(
              builder: (ctx, setDrawerState) {
                final client = ApiClient();
                final isLive = client.isLive;
                return Container(
                  margin: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isLive ? AppColors.lightGreen : AppColors.lightGrey,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isLive ? AppColors.primaryGreen.withOpacity(0.35) : AppColors.borderGrey,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isLive ? Icons.cloud_done_outlined : Icons.usb_outlined,
                        size: 18,
                        color: isLive ? AppColors.primaryGreen : AppColors.primaryText,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isLive ? 'Backend: Live (Render Cloud)' : 'Backend: Localhost (USB)',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isLive ? AppColors.darkGreen : AppColors.primaryText,
                              ),
                            ),
                            Text(
                              isLive ? 'Connected to live cloud' : '127.0.0.1:5000',
                              style: GoogleFonts.inter(
                                fontSize: 9.5,
                                color: AppColors.secondaryText,
                              ),
                            ),
                          ],
                        ),
                      ),
                      InkWell(
                        onTap: () {
                          if (isLive) {
                            client.switchToLocal();
                          } else {
                            client.switchToLive();
                          }
                          setDrawerState(() {});
                          propProv.fetchHomeData();
                        },
                        borderRadius: BorderRadius.circular(4),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isLive ? Colors.white : AppColors.primaryGreen,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: AppColors.primaryGreen),
                          ),
                          child: Text(
                            isLive ? 'Use USB' : 'Use Live',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isLive ? AppColors.primaryGreen : Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            // Scrollable Navigation Items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 6),
                children: [
                  _buildSectionHeader('PROPERTY CATEGORIES'),
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
                  const Divider(color: AppColors.borderGrey),

                  _buildSectionHeader('DISCOVER NAGPUR'),
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
                  const Divider(color: AppColors.borderGrey),

                  _buildSectionHeader('FINANCIAL TOOLS'),
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
                  const Divider(color: AppColors.borderGrey),

                  _buildSectionHeader('INSIGHTS & GUIDELINES'),
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

            // Bottom Actions (Zameen-Style Green Post Property & User Navigation)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppColors.white,
                border: Border(top: BorderSide(color: AppColors.borderGrey)),
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
                      icon: const Icon(Icons.add_circle, color: Colors.white, size: 18),
                      label: Text(
                        'Post Property Free',
                        style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13.5),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

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
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              side: const BorderSide(color: AppColors.borderGrey),
                            ),
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
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              side: const BorderSide(color: AppColors.borderGrey),
                            ),
                            child: const Text('Wishlist', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        auth.logout();
                      },
                      icon: const Icon(Icons.logout, size: 16, color: AppColors.errorRed),
                      label: Text(
                        'Sign Out',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.errorRed, fontWeight: FontWeight.w600),
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
                        icon: const Icon(Icons.person_outline, size: 18, color: AppColors.primaryGreen),
                        label: Text(
                          'Sign In / Register',
                          style: GoogleFonts.inter(color: AppColors.primaryGreen, fontWeight: FontWeight.w600),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.primaryGreen),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                        ),
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

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 4),
      child: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: AppColors.mutedText,
          letterSpacing: 0.8,
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
      leading: Icon(icon, color: AppColors.primaryGreen, size: 20),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: AppColors.primaryText,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, size: 18, color: AppColors.secondaryText),
      onTap: onTap,
      dense: true,
      visualDensity: const VisualDensity(horizontal: 0, vertical: -1),
    );
  }
}
