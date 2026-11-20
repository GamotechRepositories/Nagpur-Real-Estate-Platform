import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/app_network_image.dart';
import '../../models/project_model.dart';
import '../../providers/property_provider.dart';
import 'project_details_screen.dart';

class ProjectsListScreen extends StatefulWidget {
  const ProjectsListScreen({Key? key}) : super(key: key);

  @override
  State<ProjectsListScreen> createState() => _ProjectsListScreenState();
}

class _ProjectsListScreenState extends State<ProjectsListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedStatus = 'ALL';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final prov = Provider.of<PropertyProvider>(context, listen: false);
      if (prov.projects.isEmpty && !prov.isLoading) {
        prov.fetchHomeData();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<ProjectModel> _filterProjects(List<ProjectModel> all) {
    final query = _searchController.text.trim().toLowerCase();
    return all.where((p) {
      // 1. Status Filter
      if (_selectedStatus != 'ALL') {
        final statusNorm = p.projectStatus.toLowerCase();
        if (_selectedStatus == 'READY' &&
            !statusNorm.contains('ready') &&
            !statusNorm.contains('completed')) {
          return false;
        }
        if (_selectedStatus == 'UNDER_CONSTRUCTION' &&
            !statusNorm.contains('under construction') &&
            !statusNorm.contains('ongoing')) {
          return false;
        }
        if (_selectedStatus == 'NEW_LAUNCH' &&
            !statusNorm.contains('new launch') &&
            !statusNorm.contains('launch')) {
          return false;
        }
      }

      // 2. Search Query (Name, Locality, Builder, RERA)
      if (query.isNotEmpty) {
        final matchesName = p.name.toLowerCase().contains(query);
        final matchesLoc = p.localityName.toLowerCase().contains(query);
        final matchesBuilder = p.builderName.toLowerCase().contains(query);
        final matchesRera = p.reraNumber.toLowerCase().contains(query);
        if (!matchesName && !matchesLoc && !matchesBuilder && !matchesRera) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final prov = Provider.of<PropertyProvider>(context);
    final allProjects = prov.projects;
    final filtered = _filterProjects(allProjects);

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          'Projects in Nagpur',
          style: GoogleFonts.inter(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Header (Admin Match)
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search Field
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (_) => setState(() {}),
                    style: GoogleFonts.inter(fontSize: 13, color: AppColors.primaryText),
                    decoration: InputDecoration(
                      hintText: 'Search by project, locality, builder, RERA...',
                      hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey.shade500),
                      prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.secondaryText),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 18, color: Colors.grey),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {});
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Status Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', 'All Projects'),
                      const SizedBox(width: 8),
                      _buildFilterChip('READY', 'Ready Possession'),
                      const SizedBox(width: 8),
                      _buildFilterChip('UNDER_CONSTRUCTION', 'Under Construction'),
                      const SizedBox(width: 8),
                      _buildFilterChip('NEW_LAUNCH', 'New Launch'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Count Subheader
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Text(
              'Showing ${filtered.length} of ${allProjects.length} developments in Nagpur',
              style: GoogleFonts.inter(
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                color: AppColors.secondaryText,
              ),
            ),
          ),

          // Project List
          Expanded(
            child: prov.isLoading && allProjects.isEmpty
                ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
                : RefreshIndicator(
                    color: AppColors.primaryGreen,
                    onRefresh: () => prov.fetchHomeData(),
                    child: filtered.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.18),
                              Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: AppColors.lightGreen,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.apartment_rounded, size: 40, color: AppColors.primaryGreen),
                                    ),
                                    const SizedBox(height: 14),
                                    Text(
                                      'No Projects Found',
                                      style: GoogleFonts.inter(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primaryText,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _searchController.text.isNotEmpty
                                          ? 'No projects match your search query.'
                                          : 'Pull down to refresh developments',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        color: AppColors.secondaryText,
                                      ),
                                    ),
                                    if (_searchController.text.isNotEmpty || _selectedStatus != 'ALL') ...[
                                      const SizedBox(height: 14),
                                      OutlinedButton(
                                        onPressed: () {
                                          _searchController.clear();
                                          setState(() => _selectedStatus = 'ALL');
                                        },
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: AppColors.primaryGreen,
                                          side: const BorderSide(color: AppColors.primaryGreen),
                                        ),
                                        child: const Text('Reset Filters'),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: EdgeInsets.fromLTRB(
                              16,
                              14,
                              16,
                              36 + MediaQuery.of(context).padding.bottom,
                            ),
                            itemCount: filtered.length,
                            itemBuilder: (context, index) {
                              final proj = filtered[index];
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
                                  margin: const EdgeInsets.only(bottom: 16),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: AppColors.borderGrey, width: 1),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.04),
                                        blurRadius: 10,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                  clipBehavior: Clip.antiAlias,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Image & Badges
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
                                            top: 10,
                                            left: 10,
                                            child: Container(
                                              constraints: const BoxConstraints(maxWidth: 130),
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: 8,
                                                vertical: 4,
                                              ),
                                              decoration: BoxDecoration(
                                                color: AppColors.primaryGreen,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                proj.projectStatus,
                                                style: GoogleFonts.inter(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.white,
                                                  letterSpacing: 0.3,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ),
                                          // MahaRERA Badge
                                          if (proj.reraNumber.isNotEmpty)
                                            Positioned(
                                              top: 10,
                                              right: 10,
                                              child: Container(
                                                constraints: const BoxConstraints(maxWidth: 140),
                                                padding: const EdgeInsets.symmetric(
                                                  horizontal: 8,
                                                  vertical: 4,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: Colors.white.withOpacity(0.92),
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    const Icon(
                                                      Icons.verified,
                                                      size: 12,
                                                      color: AppColors.secondaryGreen,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Flexible(
                                                      child: Text(
                                                        proj.reraNumber,
                                                        style: GoogleFonts.inter(
                                                          fontSize: 9.5,
                                                          fontWeight: FontWeight.bold,
                                                          color: AppColors.primaryText,
                                                        ),
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),

                                      // Project Details
                                      Padding(
                                        padding: const EdgeInsets.all(14),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    proj.priceStarting,
                                                    style: GoogleFonts.inter(
                                                      fontSize: 16,
                                                      fontWeight: FontWeight.w800,
                                                      color: AppColors.primaryGreen,
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  proj.configurationsText,
                                                  style: GoogleFonts.inter(
                                                    fontSize: 11.5,
                                                    fontWeight: FontWeight.w600,
                                                    color: AppColors.secondaryText,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 5),
                                            Text(
                                              proj.name,
                                              style: GoogleFonts.inter(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.primaryText,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 3),
                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.location_on_outlined,
                                                  size: 14,
                                                  color: AppColors.secondaryText,
                                                ),
                                                const SizedBox(width: 4),
                                                Expanded(
                                                  child: Text(
                                                    'By ${proj.builderName} • ${proj.localityName}, Nagpur',
                                                    style: GoogleFonts.inter(
                                                      fontSize: 12,
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
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String statusKey, String label) {
    final isSelected = _selectedStatus == statusKey;
    return InkWell(
      onTap: () => setState(() => _selectedStatus = statusKey),
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreen : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primaryGreen : Colors.grey.shade300,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.primaryText,
          ),
        ),
      ),
    );
  }
}
