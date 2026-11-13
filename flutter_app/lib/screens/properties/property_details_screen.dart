import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/property_card.dart';
import '../../core/widgets/enquiry_dialog.dart';
import '../../core/widgets/site_visit_dialog.dart';
import '../../core/widgets/auth_dialog.dart';
import '../../models/property_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../tools/emi_calculator_screen.dart';

class PropertyDetailsScreen extends StatefulWidget {
  final String slug;

  const PropertyDetailsScreen({Key? key, required this.slug}) : super(key: key);

  @override
  State<PropertyDetailsScreen> createState() => _PropertyDetailsScreenState();
}

class _PropertyDetailsScreenState extends State<PropertyDetailsScreen> {
  PropertyModel? _property;
  List<PropertyModel> _similarProperties = [];
  bool _loading = true;
  int _activeImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final prov = Provider.of<PropertyProvider>(context, listen: false);
    final prop = await prov.fetchPropertyBySlug(widget.slug);
    if (prop != null) {
      final similar = await prov.fetchSimilarProperties(prop.id);
      if (mounted) {
        setState(() {
          _property = prop;
          _similarProperties = similar;
          _loading = false;
        });
      }
    } else {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _makeCall(String phone) async {
    final uri = Uri.parse('tel:+91$phone');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  Future<void> _openWhatsApp(String phone, String title, String locality) async {
    final text = Uri.encodeComponent('Hello, I am interested in "$title" in $locality, Nagpur.');
    final uri = Uri.parse('https://wa.me/91$phone?text=$text');
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: AppColors.mainBackground,
        body: Center(child: CircularProgressIndicator(color: AppColors.primaryGreen)),
      );
    }

    if (_property == null) {
      return Scaffold(
        appBar: AppBar(backgroundColor: AppColors.primaryGreen),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.errorRed),
              const SizedBox(height: 12),
              Text(
                'Property Not Found',
                style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen),
                child: const Text('Back to Listings'),
              ),
            ],
          ),
        ),
      );
    }

    final prop = _property!;
    final auth = Provider.of<AuthProvider>(context);
    final isSaved = auth.isPropertySaved(prop.id) || prop.isSaved;
    final agentPhone = prop.assignedAgent?.phone ?? prop.owner?.phone ?? '9823000000';
    final allImages = prop.images.isNotEmpty ? prop.images.map((i) => i.url).toList() : [prop.coverImage];

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          prop.localityName,
          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: Icon(
              isSaved ? Icons.favorite : Icons.favorite_border,
              color: isSaved ? AppColors.errorRed : Colors.white,
            ),
            onPressed: () {
              if (!auth.isAuthenticated) {
                showDialog(context: context, builder: (_) => const AuthDialog());
              } else {
                auth.toggleSavedProperty(prop.id);
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image Carousel with Page Indicator
            Stack(
              children: [
                SizedBox(
                  height: 250,
                  child: PageView.builder(
                    itemCount: allImages.length,
                    onPageChanged: (i) => setState(() => _activeImageIndex = i),
                    itemBuilder: (context, index) {
                      return CachedNetworkImage(
                        imageUrl: allImages[index],
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: AppColors.lightGrey),
                      );
                    },
                  ),
                ),
                Positioned(
                  bottom: 12,
                  right: 14,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.65),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${_activeImageIndex + 1} / ${allImages.length}',
                      style: GoogleFonts.inter(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),

            // Main Details
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges
                  Row(
                    children: [
                      if (prop.isFeatured)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: AppColors.primaryGreen, borderRadius: BorderRadius.circular(4)),
                          child: Text('FEATURED', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.3)),
                        ),
                      if (prop.isVerified) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: AppColors.lightGreen, borderRadius: BorderRadius.circular(4), border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3))),
                          child: Row(
                            children: [
                              const Icon(Icons.verified, size: 12, color: AppColors.primaryGreen),
                              const SizedBox(width: 4),
                              Text('MAHARERA VERIFIED', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.darkGreen, letterSpacing: 0.3)),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Title
                  Text(
                    prop.title,
                    style: GoogleFonts.inter(
                      fontSize: 19,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryText,
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Locality
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 16, color: AppColors.primaryGreen),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${prop.address.isNotEmpty ? '${prop.address}, ' : ''}${prop.localityName}, Nagpur - ${prop.pincode}',
                          style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Price & EMI Box (Zameen Style)
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
                            Text(
                              Formatters.formatIndianPrice(prop.price, priceUnit: prop.purpose),
                              style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.primaryGreen),
                            ),
                            if (prop.purpose != 'RENT')
                              Text(
                                'Est. EMI: ${Formatters.calculateEstimateEmi(prop.price)}',
                                style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                              ),
                          ],
                        ),
                        if (prop.purpose != 'RENT')
                          TextButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const EmiCalculatorScreen()),
                              );
                            },
                            icon: const Icon(Icons.calculate_outlined, size: 16, color: AppColors.primaryGreen),
                            label: Text(
                              'EMI Calculator',
                              style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Key Specifications Grid
                  Text(
                    'Property Specifications',
                    style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                  ),
                  const SizedBox(height: 10),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 2.8,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    children: [
                      _buildSpecTile(Icons.bed_outlined, 'Bedrooms', '${prop.bedrooms} BHK'),
                      _buildSpecTile(Icons.bathtub_outlined, 'Bathrooms', '${prop.bathrooms} Baths'),
                      _buildSpecTile(Icons.square_foot_outlined, 'Super Area', Formatters.formatArea(prop.areaSqFt)),
                      _buildSpecTile(Icons.chair_outlined, 'Furnishing', prop.furnishing.replaceAll('_', ' ')),
                      _buildSpecTile(Icons.door_front_door_outlined, 'Facing', prop.facing),
                      _buildSpecTile(Icons.layers_outlined, 'Floor', '${prop.floor} of ${prop.totalFloors}'),
                      _buildSpecTile(Icons.key_outlined, 'Possession', prop.possessionStatus.replaceAll('_', ' ')),
                      _buildSpecTile(Icons.calendar_today_outlined, 'Property Age', prop.propertyAge),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Description
                  if (prop.description.isNotEmpty) ...[
                    Text(
                      'Overview & Description',
                      style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderGrey),
                      ),
                      child: Text(
                        prop.description,
                        style: GoogleFonts.inter(fontSize: 13, color: AppColors.primaryText, height: 1.5),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Amenities Checklist
                  if (prop.amenities.isNotEmpty) ...[
                    Text(
                      'Amenities & Features',
                      style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: prop.amenities.map((amenity) {
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
                              Text(amenity, style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w500, color: AppColors.primaryText)),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Assigned Agent / Owner Card
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
                    child: Column(
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: AppColors.lightGreen,
                              backgroundImage: prop.assignedAgent?.avatar != null
                                  ? CachedNetworkImageProvider(prop.assignedAgent!.avatar!)
                                  : null,
                              child: prop.assignedAgent?.avatar == null
                                  ? const Icon(Icons.person, color: AppColors.primaryGreen)
                                  : null,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    prop.assignedAgent?.name ?? prop.owner?.name ?? 'Nagpur Advisor',
                                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                                  ),
                                  Text(
                                    'Verified Nagpur Marketplace Representative',
                                    style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.secondaryText),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (_) => SiteVisitDialog(property: prop),
                                  );
                                },
                                icon: const Icon(Icons.calendar_month, size: 16, color: AppColors.primaryGreen),
                                label: Text('Book Site Visit', style: GoogleFonts.inter(fontSize: 12, color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  side: const BorderSide(color: AppColors.primaryGreen),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (_) => EnquiryDialog(property: prop),
                                  );
                                },
                                icon: const Icon(Icons.send_outlined, size: 16),
                                label: Text('Enquire', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primaryGreen,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  elevation: 0,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Similar Properties
                  if (_similarProperties.isNotEmpty) ...[
                    Text(
                      'Similar Properties in ${prop.localityName}',
                      style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      height: 380,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _similarProperties.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 14),
                        itemBuilder: (context, index) {
                          return SizedBox(
                            width: 270,
                            child: PropertyCard(
                              property: _similarProperties[index],
                              layout: PropertyCardLayout.grid,
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: AppColors.borderGrey)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, -3)),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              IconButton(
                onPressed: () => _makeCall(agentPhone),
                icon: const Icon(Icons.phone, color: AppColors.primaryText),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.lightGrey,
                  padding: const EdgeInsets.all(12),
                ),
              ),
              const SizedBox(width: 10),
              IconButton(
                onPressed: () => _openWhatsApp(agentPhone, prop.title, prop.localityName),
                icon: const Icon(Icons.chat_bubble_outline, color: Colors.white),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.whatsappGreen,
                  padding: const EdgeInsets.all(12),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (_) => EnquiryDialog(property: prop),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    elevation: 0,
                  ),
                  child: Text(
                    'Enquire Concerning Asset',
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSpecTile(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.primaryGreen),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(label, style: GoogleFonts.inter(fontSize: 10, color: AppColors.secondaryText)),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
