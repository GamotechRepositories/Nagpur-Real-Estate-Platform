import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/utils/formatters.dart';
import '../../models/property_model.dart';
import '../../providers/auth_provider.dart';
import '../post_property/post_property_screen.dart';
import '../properties/property_details_screen.dart';
import '../../core/widgets/auth_dialog.dart';

class MyPropertiesScreen extends StatefulWidget {
  const MyPropertiesScreen({Key? key}) : super(key: key);

  @override
  State<MyPropertiesScreen> createState() => _MyPropertiesScreenState();
}

class _MyPropertiesScreenState extends State<MyPropertiesScreen> {
  List<PropertyModel> _properties = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchMyProperties();
  }

  Future<void> _fetchMyProperties() async {
    try {
      final res = await ApiClient().dio.get('/properties', queryParameters: {'limit': 50});
      final list = res.data?['data'] as List<dynamic>? ?? [];
      setState(() {
        _properties = list.map((p) => PropertyModel.fromJson(p)).toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('My Properties')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.lock_outline, size: 48, color: AppColors.gold),
                const SizedBox(height: 14),
                Text(
                  'Sign In Required',
                  style: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please sign in to manage your active property portfolio.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    showDialog(context: context, builder: (_) => const AuthDialog());
                  },
                  child: const Text('Sign In to Account'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text(
          'Principal Asset Management',
          style: GoogleFonts.playfairDisplay(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PostPropertyScreen()),
              );
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : _properties.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.home_work_outlined, size: 48, color: AppColors.charcoalMuted),
                      const SizedBox(height: 12),
                      Text(
                        'No Properties Listed Yet',
                        style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Text('List your flat, plot, or commercial asset in Nagpur.', style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const PostPropertyScreen()),
                          );
                        },
                        child: const Text('List New Asset Free'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _properties.length,
                  itemBuilder: (context, index) {
                    final prop = _properties[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => PropertyDetailsScreen(slug: prop.slug)),
                        );
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.beige),
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: CachedNetworkImage(
                                imageUrl: prop.coverImage,
                                width: 80,
                                height: 80,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: prop.status == 'LIVE' ? Colors.green.shade50 : Colors.amber.shade50,
                                          borderRadius: BorderRadius.circular(4),
                                          border: Border.all(
                                            color: prop.status == 'LIVE' ? AppColors.verifiedGreen : AppColors.gold,
                                          ),
                                        ),
                                        child: Text(
                                          prop.status,
                                          style: GoogleFonts.inter(
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.bold,
                                            color: prop.status == 'LIVE' ? AppColors.verifiedGreen : AppColors.goldDark,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        Formatters.formatIndianPrice(prop.price),
                                        style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.navy),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    prop.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.playfairDisplay(fontSize: 14, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${prop.localityName}, Nagpur • ${prop.bedrooms} BHK',
                                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.charcoalMuted),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Icon(Icons.remove_red_eye_outlined, size: 12, color: AppColors.charcoalMuted),
                                      const SizedBox(width: 3),
                                      Text('${prop.viewsCount} views', style: const TextStyle(fontSize: 10, color: AppColors.charcoalMuted)),
                                      const SizedBox(width: 12),
                                      Icon(Icons.mark_email_unread_outlined, size: 12, color: AppColors.charcoalMuted),
                                      const SizedBox(width: 3),
                                      Text('${prop.enquiriesCount} leads', style: const TextStyle(fontSize: 10, color: AppColors.charcoalMuted)),
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

