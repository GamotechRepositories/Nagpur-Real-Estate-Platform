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
    final topInset = MediaQuery.of(context).padding.top + 96;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. BANNER SECTION (Hero Image with Headline & Tagline)
        Container(
          width: double.infinity,
          decoration: const BoxDecoration(
            color: AppColors.primaryText,
            image: DecorationImage(
              image: AssetImage('assets/images/hero-mobile.jpg'),
              fit: BoxFit.cover,
              colorFilter: ColorFilter.mode(
                Color(0x65000000), // Clean transparent overlay for contrast
                BlendMode.darken,
              ),
            ),
          ),
          padding: EdgeInsets.fromLTRB(16, topInset, 16, 26),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Subtitle Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
                decoration: BoxDecoration(
                  color: AppColors.primaryOrange.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.6), width: 0.8),
                ),
                child: Text(
                  'HAR PROPERTY ZAMEEN PAR',
                  style: GoogleFonts.inter(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Main Headline
              Text(
                'Find Your Next Address in Nagpur',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 5),

              Text(
                'Verified flats, NMRDA plots & villas across Nagpur',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 11.5,
                  color: Colors.white.withOpacity(0.9),
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),

        // 2. SEARCH FORM SECTION (Shown BELOW the banner section, not on top of it)
        Container(
          margin: const EdgeInsets.fromLTRB(14, 12, 14, 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderGrey),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0C000000),
                blurRadius: 10,
                offset: Offset(0, 3),
              ),
            ],
          ),
          padding: const EdgeInsets.all(10),
          child: Column(
            children: [
              // Tabs: Buy / Rent / Plots / Commercial
              Container(
                decoration: BoxDecoration(
                  color: AppColors.lightGrey,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.borderGrey),
                ),
                padding: const EdgeInsets.all(2),
                child: Row(
                  children: [
                    _buildTabButton('Buy', activeTab, propProv),
                    _buildTabButton('Rent', activeTab, propProv),
                    _buildTabButton('Plots', activeTab, propProv),
                    _buildTabButton('Commercial', activeTab, propProv),
                  ],
                ),
              ),
              const SizedBox(height: 7),

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
              const SizedBox(height: 6),

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
                  const SizedBox(width: 6),
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
              const SizedBox(height: 6),

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
              const SizedBox(height: 8),

              // Search Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _onSearchPressed,
                  icon: const Icon(Icons.search, size: 17),
                  label: Text(
                    'Search Properties',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryOrange,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(7),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTabButton(String tab, String currentTab, PropertyProvider provider) {
    final isSelected = currentTab == tab;
    return Expanded(
      child: GestureDetector(
        onTap: () => provider.setActiveTab(tab),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 5.5),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryOrange : Colors.transparent,
            borderRadius: BorderRadius.circular(5),
          ),
          child: Center(
            child: Text(
              tab,
              style: GoogleFonts.inter(
                fontSize: 11.5,
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.lightGrey,
        borderRadius: BorderRadius.circular(7),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primaryOrange),
          const SizedBox(width: 6),
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<T>(
                value: value,
                isDense: true,
                isExpanded: true,
                items: items,
                onChanged: onChanged,
                style: GoogleFonts.inter(
                  fontSize: 12,
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
