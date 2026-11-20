import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/brand_logo.dart';
import '../../core/widgets/app_drawer.dart';
import '../../core/widgets/property_card.dart';
import '../../core/widgets/auth_dialog.dart';
import '../../core/widgets/whatsapp_icon.dart';
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../../models/property_model.dart';
import '../properties/property_list_screen.dart';
import '../properties/property_details_screen.dart';
import '../projects/projects_list_screen.dart';
import '../projects/project_details_screen.dart';
import '../../models/project_model.dart';
import '../../core/widgets/app_network_image.dart';
import '../localities/locality_details_screen.dart';
import '../localities/localities_list_screen.dart';
import '../agents/agents_list_screen.dart';
import '../tools/loan_enquiry_screen.dart';
import '../account/saved_properties_screen.dart';
import '../post_property/post_property_screen.dart';
import 'widgets/hero_search_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();
  final ValueNotifier<double> _appBarOpacity = ValueNotifier<double>(0.0);

  // EMI preview state
  double _previewPrice = 8000000; // 80 Lakhs
  double _previewDownPayment = 1600000; // 16 Lakhs (20%)
  double _previewInterestRate = 8.5; // 8.5%
  double _previewTenure = 20; // 20 years

  final _inrFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹ ', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final prov = Provider.of<PropertyProvider>(context, listen: false);
      if (prov.properties.isEmpty && !prov.isLoading) {
        prov.fetchHomeData();
      }
    });
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final offset = _scrollController.offset;
    final newOpacity = (offset / 80.0).clamp(0.0, 1.0);
    if (_appBarOpacity.value != newOpacity) {
      _appBarOpacity.value = newOpacity;
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _appBarOpacity.dispose();
    super.dispose();
  }

  int _calculatePreviewEmi() {
    final loanAmount = math.max(0.0, _previewPrice - _previewDownPayment);
    final r = _previewInterestRate / 12 / 100;
    final n = _previewTenure * 12;
    if (loanAmount <= 0 || r <= 0 || n <= 0) return 0;
    final factor = math.pow(1 + r, n);
    return (loanAmount * r * factor / (factor - 1)).round();
  }

  @override
  Widget build(BuildContext context) {
    final propProv = Provider.of<PropertyProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      extendBodyBehindAppBar: true,
      drawer: const AppDrawer(),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(88),
        child: ValueListenableBuilder<double>(
          valueListenable: _appBarOpacity,
          builder: (context, opacity, _) {
            final iconColor = Color.lerp(Colors.white, AppColors.primaryText, opacity)!;
            final badgeBgColor = Color.lerp(Colors.white, AppColors.primaryOrange, opacity)!;
            final badgeTextColor = Color.lerp(AppColors.primaryGreen, Colors.white, opacity)!;

            return AppBar(
              backgroundColor: Colors.white.withOpacity(opacity),
              elevation: opacity > 0.05 ? (opacity * 2.5) : 0,
              surfaceTintColor: Colors.transparent,
              shadowColor: Color.fromRGBO(0, 0, 0, opacity * 0.12),
              toolbarHeight: 88,
              titleSpacing: 0,
              systemOverlayStyle: opacity > 0.5
                  ? const SystemUiOverlayStyle(
                      statusBarColor: Colors.transparent,
                      statusBarIconBrightness: Brightness.dark,
                      statusBarBrightness: Brightness.light,
                    )
                  : const SystemUiOverlayStyle(
                      statusBarColor: Colors.transparent,
                      statusBarIconBrightness: Brightness.light,
                      statusBarBrightness: Brightness.dark,
                    ),
              title: const BrandLogo(height: 80),
              iconTheme: IconThemeData(
                color: iconColor,
                size: 26,
              ),
              actions: [
                // Wishlist Shortcut
                IconButton(
                  icon: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Icon(
                        Icons.favorite_border,
                        color: iconColor,
                        size: 26,
                      ),
                      if (auth.savedPropertyIds.isNotEmpty)
                        Positioned(
                          top: -2,
                          right: -2,
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: badgeBgColor,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              '${auth.savedPropertyIds.length}',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: badgeTextColor,
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
            );
          },
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.primaryGreen,
        onRefresh: () => propProv.fetchHomeData(),
        child: SingleChildScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Hero Search Section (Zameen Style)
              const HeroSearchWidget(),

              // Deal of the Day Section (Directly ABOVE Featured Properties)
              _buildDealOfTheDaySection(context, propProv),

              // 2. Featured Properties Section
              _buildFeaturedSection(context, propProv),

              // 3. New & Ongoing Projects Section
              _buildProjectsSection(context, propProv),

              // 4. Popular Localities Showcase
              _buildLocalitiesSection(context, propProv),

              // 4. MahaRERA Verified Properties Section
              _buildVerifiedSection(context, propProv),

              // 5. Interactive EMI Calculator Preview
              _buildEmiPreviewSection(context),

              // 6. Verified Agents Showcase
              _buildAgentsSection(context, propProv),

              // 7. Why Choose ZAMEEN
              _buildWhyChooseSection(context),

              // 8. Frequently Asked Questions (F&Q) Section
              _buildFaqSection(context),

              // 9. Footer Section
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

  Widget _buildDealOfTheDaySection(BuildContext context, PropertyProvider prov) {
    final list = prov.dealOfTheDayProperties.isNotEmpty
        ? prov.dealOfTheDayProperties
        : (prov.featuredProperties.isNotEmpty ? prov.featuredProperties : prov.properties);
    if (list.isEmpty) return const SizedBox.shrink();
    final deals = list.take(6).toList();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header with Hot Deal Flame Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF5722), Color(0xFFFF9800)],
                      ),
                      borderRadius: BorderRadius.circular(6),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFF5722).withOpacity(0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.local_fire_department, color: Colors.white, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          'DEAL OF THE DAY',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                    decoration: BoxDecoration(
                      color: AppColors.lightGreen,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.secondaryGreen.withOpacity(0.3)),
                    ),
                    child: Text(
                      'Special Price Drop',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.secondaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  const Icon(Icons.timer_outlined, size: 14, color: AppColors.secondaryText),
                  const SizedBox(width: 3),
                  Text(
                    'Limited Offers',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.secondaryText,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Horizontal Deals Cards List
          SizedBox(
            height: 300,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: deals.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final deal = deals[index];
                return SizedBox(
                  width: 285,
                  child: _buildDealCard(context, deal, index),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDealCard(BuildContext context, PropertyModel deal, int index) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => PropertyDetailsScreen(slug: deal.slug)),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.primaryOrange.withOpacity(0.35), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryOrange.withOpacity(0.08),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with Overlay Tags
            Stack(
              children: [
                CachedNetworkImage(
                  imageUrl: deal.coverImage,
                  height: 165,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(
                    height: 165,
                    color: AppColors.lightGrey,
                    child: const Icon(Icons.home, size: 48, color: AppColors.mutedText),
                  ),
                ),
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.65),
                        ],
                        stops: const [0.55, 1.0],
                      ),
                    ),
                  ),
                ),
                // Top Left Badge
                Positioned(
                  top: 9,
                  left: 9,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3.5),
                    decoration: BoxDecoration(
                      color: AppColors.primaryOrange,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Text(
                      'DEAL #${index + 1}',
                      style: GoogleFonts.inter(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
                // Bottom Image Info (Price & Verified Tag)
                Positioned(
                  bottom: 9,
                  left: 10,
                  right: 10,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        Formatters.formatIndianPrice(deal.price, priceUnit: deal.purpose),
                        style: GoogleFonts.inter(
                          fontSize: 16.5,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          shadows: const [
                            Shadow(color: Colors.black54, blurRadius: 4),
                          ],
                        ),
                      ),
                      if (deal.isVerified)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: AppColors.secondaryGreen,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.verified, size: 11, color: Colors.white),
                              const SizedBox(width: 2.5),
                              Text(
                                'MahaRERA',
                                style: GoogleFonts.inter(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),

            // Content Details
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    deal.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryText,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 13, color: AppColors.secondaryText),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          deal.localityName.isNotEmpty ? '${deal.localityName}, Nagpur' : 'Nagpur',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(height: 1, color: AppColors.borderGrey),
                  const SizedBox(height: 8),

                  // Specs Row + Action Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          if (deal.bedrooms > 0) ...[
                            const Icon(Icons.bed_outlined, size: 13, color: AppColors.secondaryText),
                            const SizedBox(width: 2),
                            Text(
                              '${deal.bedrooms} BHK',
                              style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w600, color: AppColors.primaryText),
                            ),
                            const SizedBox(width: 8),
                          ],
                          if (deal.areaSqFt > 0) ...[
                            const Icon(Icons.square_foot, size: 13, color: AppColors.secondaryText),
                            const SizedBox(width: 2),
                            Text(
                              Formatters.formatArea(deal.areaSqFt),
                              style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w600, color: AppColors.primaryText),
                            ),
                          ],
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            'Claim Deal',
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryOrange,
                            ),
                          ),
                          const Icon(Icons.arrow_forward, size: 13, color: AppColors.primaryOrange),
                        ],
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

  Widget _buildProjectsSection(BuildContext context, PropertyProvider prov) {
    final list = prov.projects;
    if (list.isEmpty) return const SizedBox.shrink();

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.lightGreen,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(
                              Icons.apartment_rounded,
                              size: 16,
                              color: AppColors.primaryGreen,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Featured Projects',
                            style: GoogleFonts.inter(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primaryText,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'New & Ongoing Developments in Nagpur',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.secondaryText,
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const ProjectsListScreen(),
                      ),
                    );
                  },
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'See All (${list.length})',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                      const SizedBox(width: 2),
                      const Icon(
                        Icons.chevron_right,
                        size: 16,
                        color: AppColors.primaryGreen,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 275,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final proj = list[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ProjectDetailsScreen(project: proj),
                      ),
                    );
                  },
                  child: Container(
                    width: 275,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderGrey, width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Stack(
                          children: [
                            AspectRatio(
                              aspectRatio: 16 / 9,
                              child: AppNetworkImage(
                                imageUrl: proj.image,
                                fit: BoxFit.cover,
                              ),
                            ),
                            // Status Badge
                            Positioned(
                              top: 8,
                              left: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 7,
                                  vertical: 3.5,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryGreen,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  proj.projectStatus,
                                  style: GoogleFonts.inter(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ),
                            ),
                            // MahaRERA Badge
                            if (proj.reraNumber.isNotEmpty)
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.92),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.verified,
                                        size: 11,
                                        color: AppColors.secondaryGreen,
                                      ),
                                      const SizedBox(width: 3),
                                      Text(
                                        proj.reraNumber,
                                        style: GoogleFonts.inter(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primaryText,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    proj.priceStarting,
                                    style: GoogleFonts.inter(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.primaryGreen,
                                    ),
                                  ),
                                  Text(
                                    proj.configurationsText,
                                    style: GoogleFonts.inter(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.secondaryText,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                proj.name,
                                style: GoogleFonts.inter(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryText,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.location_on_outlined,
                                    size: 13,
                                    color: AppColors.secondaryText,
                                  ),
                                  const SizedBox(width: 3),
                                  Expanded(
                                    child: Text(
                                      'By ${proj.builderName} • ${proj.localityName}, Nagpur',
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        color: AppColors.secondaryText,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: AppColors.lightGreen,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.verified, color: AppColors.secondaryGreen, size: 20),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: Text(
                              'MahaRERA Verified Properties',
                              maxLines: 1,
                              style: GoogleFonts.inter(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primaryText,
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'RERA certified developments with clear legal titles',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                          ),
                        ],
                      ),
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

          // Horizontal Property Cards List (same as Featured Properties)
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
                // 1. Property Price Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Property Price', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                    Text(_inrFormat.format(_previewPrice),
                        style: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.primaryOrange)),
                  ],
                ),
                Slider(
                  value: _previewPrice,
                  min: 500000,
                  max: 1000000000, // Up to 100 Cr
                  activeColor: AppColors.primaryOrange,
                  inactiveColor: AppColors.borderGrey,
                  onChanged: (val) {
                    setState(() {
                      _previewPrice = (val / 100000).round() * 100000.0;
                      if (_previewDownPayment > _previewPrice) {
                        _previewDownPayment = _previewPrice * 0.2;
                      }
                    });
                  },
                ),
                const SizedBox(height: 10),

                // 2. Down Payment Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Down Payment', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                    Text(_inrFormat.format(_previewDownPayment),
                        style: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
                  ],
                ),
                Slider(
                  value: _previewDownPayment.clamp(0.0, _previewPrice),
                  min: 0,
                  max: _previewPrice > 0 ? _previewPrice : 1000000,
                  activeColor: AppColors.secondaryGreen,
                  inactiveColor: AppColors.borderGrey,
                  onChanged: (val) => setState(() {
                    _previewDownPayment = (val / 100000).round() * 100000.0;
                  }),
                ),
                const SizedBox(height: 10),

                // 3. Interest Rate Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Interest Rate (p.a.)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                    Text('${_previewInterestRate.toStringAsFixed(1)} %',
                        style: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
                  ],
                ),
                Slider(
                  value: _previewInterestRate,
                  min: 6.0,
                  max: 15.0,
                  divisions: 18,
                  activeColor: AppColors.primaryOrange,
                  inactiveColor: AppColors.borderGrey,
                  onChanged: (val) => setState(() => _previewInterestRate = val),
                ),
                const SizedBox(height: 10),

                // 4. Loan Tenure Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Loan Tenure', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText)),
                    Text('${_previewTenure.toInt()} Years',
                        style: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.primaryText)),
                  ],
                ),
                Slider(
                  value: _previewTenure,
                  min: 1,
                  max: 30,
                  divisions: 29,
                  activeColor: AppColors.secondaryGreen,
                  inactiveColor: AppColors.borderGrey,
                  onChanged: (val) => setState(() => _previewTenure = val),
                ),
                const SizedBox(height: 14),

                // Highlight Box for EMI
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.lightOrange,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primaryOrange.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Estimated Monthly EMI',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryOrange),
                      ),
                      Text(
                        '${_inrFormat.format(emi)}/mo',
                        style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.primaryOrange),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoanEnquiryScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryOrange,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      'Apply For Loan',
                      style: GoogleFonts.inter(fontSize: 13.5, fontWeight: FontWeight.bold, color: Colors.white),
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
                            child: ElevatedButton.icon(
                              onPressed: () {
                                final text = Uri.encodeComponent('Hello ${agent.name}, I am looking for property on Zameen.');
                                launchUrl(Uri.parse('https://wa.me/91${agent.phone}?text=$text'), mode: LaunchMode.externalApplication);
                              },
                              icon: const WhatsAppIcon.white(size: 13),
                              label: const Text('WhatsApp', style: TextStyle(fontSize: 11, color: Colors.white)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.whatsappGreen,
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                elevation: 0,
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
            'Why Choose ZAMEEN',
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

  Widget _buildFaqSection(BuildContext context) {
    final faqs = [
      {
        'q': 'How do I book an in-person site visit on ZAMEEN?',
        'a': 'Simply open any property, tap "Book Site Visit", select your preferred date and time slot, and submit. An assigned Nagpur coordinator will confirm the visit and accompany you on-site.',
      },
      {
        'q': 'Are all properties listed on ZAMEEN legally verified?',
        'a': 'Yes, properties displaying the MahaRERA verified badge have sanctioned layout approvals, clear legal titles, and authentic RERA registration numbers verified by our team.',
      },
      {
        'q': 'How can I apply for a home loan through the app?',
        'a': 'Calculate your monthly outflow with our Home Loan EMI Calculator and tap "Apply For Loan". Our partner banking advisors will connect with you with pre-approved offers starting at 8.5% p.a.',
      },
      {
        'q': 'How do I list or post my property for sale or rent?',
        'a': 'Tap the "+ Post Property" button at the bottom, sign in with your mobile number, fill in basic details, pricing, location, and upload property photos. It goes live upon quick verification.',
      },
      {
        'q': 'Are there any hidden fees or charges for buyers?',
        'a': 'No, browsing listings, scheduling site visits, and inquiring directly with property owners and verified builders on ZAMEEN is 100% free of hidden platform fees.',
      },
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: AppColors.lightOrange,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.help_outline, color: AppColors.primaryOrange, size: 20),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Frequently Asked Questions (F&Q)',
                      style: GoogleFonts.inter(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryText,
                      ),
                    ),
                    Text(
                      'Quick answers about property buying, renting & site visits',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          ...faqs.map((faq) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: AppColors.lightGrey,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.borderGrey),
            ),
            child: Theme(
              data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
              child: ExpansionTile(
                iconColor: AppColors.primaryOrange,
                collapsedIconColor: AppColors.secondaryText,
                tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                shape: const RoundedRectangleBorder(side: BorderSide.none),
                collapsedShape: const RoundedRectangleBorder(side: BorderSide.none),
                title: Text(
                  faq['q']!,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryText,
                  ),
                ),
                children: [
                  Text(
                    faq['a']!,
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      color: AppColors.secondaryText,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildFooterSection(BuildContext context) {
    return Container(
      color: AppColors.primaryOrange, // Primary Brand Color Orange (#FF792B)
      padding: EdgeInsets.fromLTRB(16, 28, 16, 70 + MediaQuery.of(context).padding.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const BrandLogo(height: 36),
          ),
          const SizedBox(height: 12),
          Text(
            'Nagpur’s Premier Real Estate Platform.\nConnecting Buyers, Sellers, Tenants & Verified Agents.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 11, color: Colors.white.withOpacity(0.9), height: 1.4),
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.white24),
          const SizedBox(height: 12),
          Text(
            '© 2026 Nagpur Realty. All Rights Reserved.\nMahaRERA Registered Marketplace.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 10, color: Colors.white70),
          ),
        ],
      ),
    );
  }
}
