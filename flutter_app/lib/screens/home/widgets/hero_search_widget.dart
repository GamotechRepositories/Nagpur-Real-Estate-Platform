import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/property_provider.dart';
import '../../properties/property_list_screen.dart';

const List<String> kNagpurLocalities = [
  'All Localities',
  'Dharampeth',
  'Civil Lines',
  'Ramdaspeth',
  'Manish Nagar',
  'Wardha Road',
  'Besa',
  'Shankar Nagar',
  'Sitabuldi',
  'Hingna Road',
  'Pratap Nagar',
];

const List<Map<String, String>> kPropertyTypes = [
  {'value': '', 'label': 'All Types'},
  {'value': 'FLAT', 'label': 'Flat / Apartment'},
  {'value': 'INDEPENDENT_HOUSE', 'label': 'Independent House'},
  {'value': 'VILLA', 'label': 'Villa'},
  {'value': 'PLOT', 'label': 'Plot / Land'},
  {'value': 'COMMERCIAL_OFFICE', 'label': 'Commercial Office'},
];

const List<Map<String, String>> kBudgetOptions = [
  {'value': '', 'label': 'Any Budget'},
  {'value': '0-5000000', 'label': 'Under ₹50 Lakh'},
  {'value': '5000000-10000000', 'label': '₹50 Lakh - ₹1 Cr'},
  {'value': '10000000-20000000', 'label': '₹1 Cr - ₹2 Cr'},
  {'value': '20000000-50000000', 'label': '₹2 Cr - ₹5 Cr'},
  {'value': '50000000-999999999', 'label': 'Above ₹5 Cr'},
];

const List<Map<String, String>> kBedroomOptions = [
  {'value': '', 'label': 'Any BHK'},
  {'value': '1', 'label': '1 BHK'},
  {'value': '2', 'label': '2 BHK'},
  {'value': '3', 'label': '3 BHK'},
  {'value': '4', 'label': '4+ BHK'},
];

class HeroSearchWidget extends StatefulWidget {
  const HeroSearchWidget({Key? key}) : super(key: key);

  @override
  State<HeroSearchWidget> createState() => _HeroSearchWidgetState();
}

class _HeroSearchWidgetState extends State<HeroSearchWidget> {
  String _locality = 'All Localities';
  String _propertyType = '';
  String _budget = '';
  String _bedrooms = '';

  void _onSearchPressed() {
    final propProv = Provider.of<PropertyProvider>(context, listen: false);
    propProv.setFilters(
      locality: _locality == 'All Localities' ? '' : _locality,
      propertyType: _propertyType,
      budget: _budget,
      bedrooms: _bedrooms,
    );

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const PropertyListScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final propProv = Provider.of<PropertyProvider>(context);
    final activeTab = propProv.activeTab;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.primaryText,
        image: DecorationImage(
          image: AssetImage('assets/images/hero-mobile.jpg'),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            Color(0xBA141E18),
            BlendMode.darken,
          ),
        ),
      ),
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Subtitle Badge
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.22),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.5)),
              ),
              child: Text(
                'NAGPUR REAL ESTATE MARKETPLACE',
                style: GoogleFonts.inter(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.lightGreen,
                  letterSpacing: 1.1,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Main Headline (Clean Sans-Serif Modern Zameen Style)
          Text(
            'Find Your Next Address in Nagpur',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 8),

          Text(
            'Verified flats, NMRDA plots & luxury villas across Dharampeth, Manish Nagar, Wardha Road & Besa',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: Colors.white.withOpacity(0.85),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),

          // Zameen-Style Floating Search Panel
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.16),
                  blurRadius: 22,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Tabs: Buy / Rent / Plots / Commercial (Green active tab, grey inactive)
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.lightGrey,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.borderGrey),
                  ),
                  padding: const EdgeInsets.all(3),
                  child: Row(
                    children: [
                      _buildTabButton('Buy', activeTab, propProv),
                      _buildTabButton('Rent', activeTab, propProv),
                      _buildTabButton('Plots', activeTab, propProv),
                      _buildTabButton('Commercial', activeTab, propProv),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Locality Dropdown
                _buildDropdown<String>(
                  icon: Icons.location_on_outlined,
                  value: _locality,
                  items: kNagpurLocalities
                      .map((loc) => DropdownMenuItem(value: loc, child: Text(loc)))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _locality = val);
                  },
                ),
                const SizedBox(height: 10),

                // Property Type & Bedrooms Row
                Row(
                  children: [
                    Expanded(
                      child: _buildDropdown<String>(
                        icon: Icons.home_work_outlined,
                        value: _propertyType,
                        items: kPropertyTypes
                            .map((t) => DropdownMenuItem(value: t['value']!, child: Text(t['label']!)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _propertyType = val);
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildDropdown<String>(
                        icon: Icons.bed_outlined,
                        value: _bedrooms,
                        items: kBedroomOptions
                            .map((b) => DropdownMenuItem(value: b['value']!, child: Text(b['label']!)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _bedrooms = val);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Budget Dropdown
                _buildDropdown<String>(
                  icon: Icons.currency_rupee,
                  value: _budget,
                  items: kBudgetOptions
                      .map((b) => DropdownMenuItem(value: b['value']!, child: Text(b['label']!)))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _budget = val);
                  },
                ),
                const SizedBox(height: 14),

                // Zameen-Style Vibrant Green Search Action Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _onSearchPressed,
                    icon: const Icon(Icons.search, size: 20),
                    label: Text(
                      'Search Properties',
                      style: GoogleFonts.inter(
                        fontSize: 14.5,
                        fontWeight: FontWeight.bold,
                      ),
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
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton(String tab, String currentTab, PropertyProvider provider) {
    final isSelected = currentTab == tab;
    return Expanded(
      child: GestureDetector(
        onTap: () => provider.setActiveTab(tab),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryGreen : Colors.transparent,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Center(
            child: Text(
              tab,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? Colors.white : AppColors.secondaryText,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown<T>({
    required IconData icon,
    required T value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.lightGrey,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.primaryGreen),
          const SizedBox(width: 8),
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<T>(
                value: value,
                isExpanded: true,
                items: items,
                onChanged: onChanged,
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
