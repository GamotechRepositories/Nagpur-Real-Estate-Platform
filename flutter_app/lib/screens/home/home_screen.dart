import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/brand_logo.dart';
import '../../core/widgets/app_drawer.dart';
import '../../core/widgets/property_card.dart';
import '../../core/widgets/auth_dialog.dart';
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../properties/property_list_screen.dart';
import '../localities/locality_details_screen.dart';
import '../localities/localities_list_screen.dart';
import '../agents/agents_list_screen.dart';
import '../tools/emi_calculator_screen.dart';
import '../account/saved_properties_screen.dart';
import '../post_property/post_property_screen.dart';
import 'widgets/hero_search_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // EMI preview state
  double _previewPrice = 6500000; // 65 Lakhs
  double _previewTenure = 20; // 20 years

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PropertyProvider>(context, listen: false).fetchHomeData();
    });
  }

  int _calculatePreviewEmi() {
    final p = _previewPrice * 0.8;
    const r = 8.5 / 12 / 100;
    final n = _previewTenure * 12;
    final factor = (1 + r);
    num powVal = 1;
    for (int i = 0; i < n; i++) {
      powVal *= factor;
    }
    return (p * r * powVal / (powVal - 1)).round();
  }

  @override
  Widget build(BuildContext context) {
    final propProv = Provider.of<PropertyProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      drawer: const AppDrawer(),
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: const BrandLogo(light: true, showSubtitle: true),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          // Wishlist Shortcut
          IconButton(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.favorite_border, color: Colors.white, size: 24),
                if (auth.savedPropertyIds.isNotEmpty)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '${auth.savedPropertyIds.length}',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: () {
              if (!auth.isAuthenticated) {
                showDialog(
                  context: context,
                  builder: (_) => const AuthDialog(),
                );
              } else {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SavedPropertiesScreen()),
                );
              }
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primaryGreen,
        onRefresh: () => propProv.fetchHomeData(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Hero Search Section (Zameen Style)
              const HeroSearchWidget(),

              // 2. Featured Properties Section
              _buildFeaturedSection(context, propProv),

              // 3. Popular Localities Showcase
              _buildLocalitiesSection(context, propProv),

              // 4. MahaRERA Verified Properties Section
              _buildVerifiedSection(context, propProv),

              // 5. Interactive EMI Calculator Preview
              _buildEmiPreviewSection(context),

              // 6. Verified Agents Showcase
              _buildAgentsSection(context, propProv),

              // 7. Why Choose Nagpur Realty
              _buildWhyChooseSection(context),

              // 8. Footer Section
              _buildFooterSection(context),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
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
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 3,
        icon: const Icon(Icons.add, size: 20),
        label: Text(
          'Post Property',
          style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
        ),
      ),
    );
  }

  Widget _buildFeaturedSection(BuildContext context, PropertyProvider prov) {
    if (prov.isLoading && prov.featuredProperties.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(
          child: CircularProgressIndicator(color: AppColors.primaryGreen),
        ),
      );
    }

    final list = prov.featuredProperties;
    if (list.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Featured Properties',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Handpicked high-demand listings in Nagpur',
                      style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.secondaryText),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  prov.clearFilters();
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PropertyListScreen()),
                  );
                },
                child: Row(
                  children: [
                    Text(
                      'View All',
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    const Icon(Icons.chevron_right, size: 16, color: AppColors.primaryGreen),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Horizontal Property Cards List
          SizedBox(
            height: 380,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                return SizedBox(
                  width: 270,
                  child: PropertyCard(
                    property: list[index],
                    layout: PropertyCardLayout.grid,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocalitiesSection(BuildContext context, PropertyProvider prov) {
    final localities = prov.localities;
    if (localities.isEmpty) return const SizedBox.shrink();

    return Container(
      color: AppColors.lightGrey,
      padding: const EdgeInsets.symmetric(vertical: 26, horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Explore Nagpur Localities',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Neighborhood guides, average rates, and active marketplace inventory',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LocalitiesListScreen()),
                  );
                },
                child: Row(
                  children: [
                    Text(
                      'View All',
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    const Icon(Icons.chevron_right, size: 16, color: AppColors.primaryGreen),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          SizedBox(
            height: 185,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: localities.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
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
                    width: 200,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderGrey),
                      color: Colors.white,
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
                        Expanded(
                          child: CachedNetworkImage(
                            imageUrl: loc.image,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                loc.name,
                                maxLines: 1,
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${loc.propertyCount} Properties',
                                    style: GoogleFonts.inter(
                                      fontSize: 10.5,
                                      color: AppColors.secondaryText,
                                    ),
                                  ),
                                  Text(
                                    loc.avgPrice,
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primaryGreen,
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
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerifiedSection(BuildContext context, PropertyProvider prov) {
    final list = prov.verifiedProperties;
    if (list.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: AppColors.lightGreen,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.verified, color: AppColors.primaryGreen, size: 20),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MahaRERA Verified Properties',
                      style: GoogleFonts.inter(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryText,
                      ),
                    ),
                    Text(
                      'RERA certified developments with clear legal titles',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: list.length > 3 ? 3 : list.length,
            itemBuilder: (context, index) {
              return PropertyCard(
                property: list[index],
                layout: PropertyCardLayout.horizontal,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEmiPreviewSection(BuildContext context) {
    final emi = _calculatePreviewEmi();

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 26, horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.calculate_outlined, color: AppColors.primaryGreen, size: 24),
              const SizedBox(width: 8),
              Text(
                'Home Loan EMI Calculator',
                style: GoogleFonts.inter(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primaryText,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Estimate your monthly outflow based on standard 8.5% interest',
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
          ),
          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.lightGrey,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.borderGrey),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Property Price', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('₹ ${(_previewPrice / 100000).toStringAsFixed(0)} Lakhs',
                        style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryGreen)),
                  ],
                ),
                Slider(
                  value: _previewPrice,
                  min: 2000000,
                  max: 30000000,
                  divisions: 56,
                  activeColor: AppColors.primaryGreen,
                  inactiveColor: AppColors.borderGrey,
                  onChanged: (val) => setState(() => _previewPrice = val),
                ),
                const SizedBox(height: 8),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Loan Tenure', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('${_previewTenure.toInt()} Years',
                        style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
                  ],
                ),
                Slider(
                  value: _previewTenure,
                  min: 5,
                  max: 30,
                  divisions: 25,
                  activeColor: AppColors.darkGreen,
                  inactiveColor: AppColors.borderGrey,
                  onChanged: (val) => setState(() => _previewTenure = val),
                ),
                const SizedBox(height: 12),

                // Zameen-Style Highlight Box for EMI
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.lightGreen,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Estimated Monthly EMI',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.darkGreen),
                      ),
                      Text(
                        '₹ ${emi.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}/mo',
                        style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.primaryGreen),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const EmiCalculatorScreen()),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      side: const BorderSide(color: AppColors.primaryGreen),
                      foregroundColor: AppColors.primaryGreen,
                    ),
                    child: Text(
                      'Detailed Amortization & Loan Application →',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAgentsSection(BuildContext context, PropertyProvider prov) {
    final agents = prov.agents;
    if (agents.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Trusted Nagpur Real Estate Advisors',
                      style: GoogleFonts.inter(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Verified RERA registered local consultants',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AgentsListScreen()),
                  );
                },
                child: Row(
                  children: [
                    Text(
                      'View All',
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    const Icon(Icons.chevron_right, size: 16, color: AppColors.primaryGreen),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          SizedBox(
            height: 175,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: agents.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final agent = agents[index];
                return Container(
                  width: 220,
                  padding: const EdgeInsets.all(12),
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
                  child: Column(
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundImage: CachedNetworkImageProvider(agent.avatar),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  agent.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                                ),
                                Text(
                                  agent.agency,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 10, color: AppColors.secondaryText),
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.star, color: Colors.amber, size: 12),
                                    const SizedBox(width: 2),
                                    Text(
                                      '${agent.rating} (${agent.reviewsCount})',
                                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => launchUrl(Uri.parse('tel:+91${agent.phone}')),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                side: const BorderSide(color: AppColors.borderGrey),
                              ),
                              child: const Text('Call', style: TextStyle(fontSize: 11, color: AppColors.primaryText)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                final text = Uri.encodeComponent('Hello ${agent.name}, I am looking for property in Nagpur.');
                                launchUrl(Uri.parse('https://wa.me/91${agent.phone}?text=$text'), mode: LaunchMode.externalApplication);
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.whatsappGreen,
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                elevation: 0,
                              ),
                              child: const Text('WhatsApp', style: TextStyle(fontSize: 11, color: Colors.white)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWhyChooseSection(BuildContext context) {
    return Container(
      color: AppColors.lightGrey,
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      child: Column(
        children: [
          Text(
            'Why Choose Nagpur Realty',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.primaryText,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Nagpur’s dedicated digital real estate ecosystem',
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
          ),
          const SizedBox(height: 20),

          _buildTrustPoint(
            icon: Icons.shield_outlined,
            title: '100% MahaRERA Compliance',
            desc: 'Every sanctioned apartment layout and plot carries verified RERA credentials.',
          ),
          const SizedBox(height: 14),
          _buildTrustPoint(
            icon: Icons.access_time_outlined,
            title: '90-Day Fresh Inventory Hygiene',
            desc: 'Zero phantom or expired listings. Every property is validated every cycle.',
          ),
          const SizedBox(height: 14),
          _buildTrustPoint(
            icon: Icons.support_agent_outlined,
            title: 'Accompanied Inspection Concierge',
            desc: 'Schedule private site visits with accredited Nagpur advisors at your convenience.',
          ),
        ],
      ),
    );
  }

  Widget _buildTrustPoint({required IconData icon, required String title, required String desc}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: const BoxDecoration(
            color: AppColors.lightGreen,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.primaryGreen, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryText),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText, height: 1.3),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFooterSection(BuildContext context) {
    return Container(
      color: const Color(0xFF1B2A22), // Deep Forest Neutral Footer
      padding: const EdgeInsets.fromLTRB(16, 28, 16, 60),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const BrandLogo(light: true, showSubtitle: true),
          const SizedBox(height: 12),
          Text(
            'Nagpur’s Premier Real Estate Platform.\nConnecting Buyers, Sellers, Tenants & Verified Agents.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 11, color: Colors.white70, height: 1.4),
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.white12),
          const SizedBox(height: 12),
          Text(
            '© 2026 Nagpur Realty. All Rights Reserved.\nMahaRERA Registered Marketplace.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 10, color: Colors.white38),
          ),
        ],
      ),
    );
  }
}
