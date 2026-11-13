import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/widgets/property_card.dart';
import '../../models/property_model.dart';
import '../properties/property_list_screen.dart';

class SavedPropertiesScreen extends StatefulWidget {
  const SavedPropertiesScreen({Key? key}) : super(key: key);

  @override
  State<SavedPropertiesScreen> createState() => _SavedPropertiesScreenState();
}

class _SavedPropertiesScreenState extends State<SavedPropertiesScreen> {
  List<PropertyModel> _savedList = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSaved();
  }

  Future<void> _loadSaved() async {
    try {
      final res = await ApiClient().dio.get('/me/saved/properties');
      final list = res.data?['data'] as List<dynamic>? ?? [];
      setState(() {
        _savedList = list.map((p) => PropertyModel.fromJson(p)).toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          'Curated Wishlist',
          style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : _savedList.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: const BoxDecoration(
                            color: AppColors.lightGreen,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.favorite_border, color: AppColors.primaryGreen, size: 32),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Your Wishlist is Empty',
                          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryText),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Explore the Nagpur collection and bookmark residences to compare valuations and schedule viewing appointments.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText, height: 1.4),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (_) => const PropertyListScreen()),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryGreen,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          ),
                          child: const Text('Explore Nagpur Properties'),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _savedList.length,
                  itemBuilder: (context, index) {
                    return PropertyCard(
                      property: _savedList[index],
                      layout: PropertyCardLayout.horizontal,
                    );
                  },
                ),
    );
  }
}
