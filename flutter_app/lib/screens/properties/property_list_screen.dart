import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/property_card.dart';
import '../../providers/property_provider.dart';
import '../home/widgets/hero_search_widget.dart';

class PropertyListScreen extends StatefulWidget {
  const PropertyListScreen({Key? key}) : super(key: key);

  @override
  State<PropertyListScreen> createState() => _PropertyListScreenState();
}

class _PropertyListScreenState extends State<PropertyListScreen> {
  PropertyCardLayout _viewLayout = PropertyCardLayout.horizontal;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PropertyProvider>(context, listen: false).searchProperties();
    });
  }

  void _openFilterSheet(BuildContext context) {
    final prov = Provider.of<PropertyProvider>(context, listen: false);

    String tempLocality = prov.selectedLocality.isEmpty ? 'All Localities' : prov.selectedLocality;
    String tempType = prov.selectedPropertyType;
    String tempBudget = prov.selectedBudget;
    String tempBeds = prov.selectedBedrooms;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                20,
                20,
                20,
                MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Filter Properties',
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.navy,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          prov.clearFilters();
                          prov.searchProperties();
                          Navigator.pop(ctx);
                        },
                        child: Text(
                          'Reset',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.errorRed,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Locality
                  Text('Nagpur Locality', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: tempLocality,
                    decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                    items: kNagpurLocalities
                        .map((l) => DropdownMenuItem(value: l, child: Text(l, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setModalState(() => tempLocality = val);
                    },
                  ),
                  const SizedBox(height: 12),

                  // Property Type
                  Text('Property Type', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: tempType,
                    decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                    items: kPropertyTypes
                        .map((t) => DropdownMenuItem(value: t['value']!, child: Text(t['label']!, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setModalState(() => tempType = val);
                    },
                  ),
                  const SizedBox(height: 12),

                  // Budget Range
                  Text('Price Range', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: tempBudget,
                    decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                    items: kBudgetOptions
                        .map((b) => DropdownMenuItem(value: b['value']!, child: Text(b['label']!, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setModalState(() => tempBudget = val);
                    },
                  ),
                  const SizedBox(height: 12),

                  // Bedrooms
                  Text('Bedrooms', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: tempBeds,
                    decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                    items: kBedroomOptions
                        .map((bd) => DropdownMenuItem(value: bd['value']!, child: Text(bd['label']!, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setModalState(() => tempBeds = val);
                    },
                  ),
                  const SizedBox(height: 20),

                  ElevatedButton(
                    onPressed: () {
                      prov.setFilters(
                        locality: tempLocality == 'All Localities' ? '' : tempLocality,
                        propertyType: tempType,
                        budget: tempBudget,
                        bedrooms: tempBeds,
                      );
                      prov.searchProperties();
                      Navigator.pop(ctx);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.navy,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: Text(
                      'Apply Filters',
                      style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = Provider.of<PropertyProvider>(context);
    final title = prov.activeTab == 'Rent'
        ? 'Properties for Rent in Nagpur'
        : prov.activeTab == 'Plots'
            ? 'Plots & Land in Nagpur'
            : prov.activeTab == 'Commercial'
                ? 'Commercial Spaces in Nagpur'
                : 'Flats & Homes for Sale in Nagpur';

    return Scaffold(
      backgroundColor: AppColors.ivory,
      appBar: AppBar(
        title: Text(
          prov.activeTab,
          style: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _viewLayout == PropertyCardLayout.horizontal ? Icons.grid_view : Icons.view_agenda_outlined,
              color: Colors.white,
            ),
            onPressed: () {
              setState(() {
                _viewLayout = _viewLayout == PropertyCardLayout.horizontal
                    ? PropertyCardLayout.grid
                    : PropertyCardLayout.horizontal;
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.white),
            onPressed: () => _openFilterSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter summary bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: AppColors.beige)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.navy,
                        ),
                      ),
                      Text(
                        '${prov.totalCount} Properties Found',
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.charcoalMuted),
                      ),
                    ],
                  ),
                ),

                // Sort Dropdown
                DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: prov.selectedSort,
                    items: const [
                      DropdownMenuItem(value: 'latest', child: Text('Latest', style: TextStyle(fontSize: 12))),
                      DropdownMenuItem(value: 'price_asc', child: Text('Price: Low', style: TextStyle(fontSize: 12))),
                      DropdownMenuItem(value: 'price_desc', child: Text('Price: High', style: TextStyle(fontSize: 12))),
                      DropdownMenuItem(value: 'area_desc', child: Text('Area: High', style: TextStyle(fontSize: 12))),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        prov.setFilters(sort: val);
                        prov.searchProperties();
                      }
                    },
                  ),
                ),
              ],
            ),
          ),

          // Content List
          Expanded(
            child: prov.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
                : prov.properties.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.search_off, size: 48, color: AppColors.charcoalMuted),
                              const SizedBox(height: 12),
                              Text(
                                'No Properties Match Your Filters',
                                style: GoogleFonts.playfairDisplay(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.navy,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Try widening your budget range or selecting All Localities.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(fontSize: 12, color: AppColors.charcoalMuted),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: () {
                                  prov.clearFilters();
                                  prov.searchProperties();
                                },
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.navy),
                                child: const Text('Reset All Filters'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        color: AppColors.gold,
                        onRefresh: () => prov.searchProperties(),
                        child: _viewLayout == PropertyCardLayout.horizontal
                            ? ListView.builder(
                                padding: const EdgeInsets.all(14),
                                itemCount: prov.properties.length,
                                itemBuilder: (context, index) {
                                  return PropertyCard(
                                    property: prov.properties[index],
                                    layout: PropertyCardLayout.horizontal,
                                  );
                                },
                              )
                            : GridView.builder(
                                padding: const EdgeInsets.all(14),
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  childAspectRatio: 0.58,
                                  crossAxisSpacing: 12,
                                  mainAxisSpacing: 12,
                                ),
                                itemCount: prov.properties.length,
                                itemBuilder: (context, index) {
                                  return PropertyCard(
                                    property: prov.properties[index],
                                    layout: PropertyCardLayout.grid,
                                  );
                                },
                              ),
                      ),
          ),
        ],
      ),
    );
  }
}

