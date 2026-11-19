import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../properties/property_details_screen.dart';
import '../properties/property_list_screen.dart';
import '../../core/widgets/auth_dialog.dart';

class MySiteVisitsScreen extends StatefulWidget {
  const MySiteVisitsScreen({Key? key}) : super(key: key);

  @override
  State<MySiteVisitsScreen> createState() => _MySiteVisitsScreenState();
}

class _MySiteVisitsScreenState extends State<MySiteVisitsScreen> {
  List<dynamic> _visits = [];
  bool _loading = true;
  String _selectedTab = 'ALL';

  @override
  void initState() {
    super.initState();
    _fetchVisits();
  }

  Future<void> _fetchVisits() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().dio.get('/site-visits');
      final list = res.data?['data'] as List<dynamic>? ?? [];
      setState(() {
        _visits = list;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  List<dynamic> get _filteredVisits {
    if (_selectedTab == 'ALL') return _visits;
    return _visits.where((v) => (v['status'] ?? '').toString().toUpperCase() == _selectedTab).toList();
  }

  Color _getStatusBgColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return const Color(0xFFE8F5E9);
      case 'CANCELLED':
        return const Color(0xFFFFEBEE);
      case 'COMPLETED':
        return const Color(0xFFE3F2FD);
      case 'REQUESTED':
      default:
        return const Color(0xFFFFF8E1);
    }
  }

  Color _getStatusTextColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return const Color(0xFF2E7D32);
      case 'CANCELLED':
        return const Color(0xFFC62828);
      case 'COMPLETED':
        return const Color(0xFF1565C0);
      case 'REQUESTED':
      default:
        return const Color(0xFFF57F17);
    }
  }

  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'Confirmed & Approved';
      case 'CANCELLED':
        return 'Cancelled / Rejected';
      case 'COMPLETED':
        return 'Visit Completed';
      case 'REQUESTED':
      default:
        return 'Pending Approval';
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Icons.check_circle;
      case 'CANCELLED':
        return Icons.cancel;
      case 'COMPLETED':
        return Icons.task_alt;
      case 'REQUESTED':
      default:
        return Icons.hourglass_top;
    }
  }

  Future<void> _callPhone(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openWhatsApp(String phone, String title) async {
    var cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.length == 10) cleanPhone = '91$cleanPhone';
    final text = Uri.encodeComponent('Hello, regarding my site visit inspection for "$title".');
    final uri = Uri.parse('https://wa.me/$cleanPhone?text=$text');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(
          title: Text(
            'My Site Visits',
            style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          backgroundColor: AppColors.primaryGreen,
          foregroundColor: Colors.white,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.calendar_month_outlined, size: 64, color: AppColors.secondaryText),
                const SizedBox(height: 16),
                Text(
                  'Sign in to view site visits',
                  style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Track the approval status and inspection timing of all your scheduled property visits.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => showDialog(context: context, builder: (_) => const AuthDialog()),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Sign In Now'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'My Site Visits',
          style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildTab('ALL', 'All Visits (${_visits.length})'),
                  _buildTab('REQUESTED', 'Pending'),
                  _buildTab('CONFIRMED', 'Confirmed'),
                  _buildTab('COMPLETED', 'Completed'),
                  _buildTab('CANCELLED', 'Cancelled'),
                ],
              ),
            ),
          ),
          const Divider(height: 1, color: AppColors.borderGrey),

          // Visit List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
                : RefreshIndicator(
                    onRefresh: _fetchVisits,
                    color: AppColors.primaryGreen,
                    child: _filteredVisits.isEmpty
                        ? _buildEmptyState()
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _filteredVisits.length,
                            itemBuilder: (context, index) {
                              return _buildVisitCard(_filteredVisits[index]);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String key, String label) {
    final isSelected = _selectedTab == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.primaryText,
          ),
        ),
        selected: isSelected,
        selectedColor: AppColors.primaryGreen,
        backgroundColor: const Color(0xFFF1F5F9),
        showCheckmark: false,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: isSelected ? AppColors.primaryGreen : Colors.transparent),
        ),
        onSelected: (_) {
          setState(() => _selectedTab = key);
        },
      ),
    );
  }

  Widget _buildVisitCard(dynamic visit) {
    final status = (visit['status'] ?? 'REQUESTED').toString();
    final prop = visit['property'] is Map ? visit['property'] as Map<String, dynamic> : null;
    final agent = visit['assignedAgent'] is Map ? visit['assignedAgent'] as Map<String, dynamic> : null;

    final title = prop?['title'] ?? 'Selected Nagpur Property';
    final locality = prop?['localityName'] ?? prop?['address'] ?? 'Nagpur, MH';
    final price = prop?['price'] != null ? Formatters.formatIndianPrice(prop!['price']) : null;
    final coverImage = prop?['coverImage']?.toString() ?? '';
    final slug = prop?['slug']?.toString() ?? '';

    String dateStr = '';
    if (visit['preferredDate'] != null) {
      try {
        final parsedDate = DateTime.parse(visit['preferredDate'].toString());
        dateStr = DateFormat('EEE, dd MMM yyyy').format(parsedDate);
      } catch (_) {
        dateStr = visit['preferredDate'].toString();
      }
    }
    final timeSlot = visit['preferredTimeSlot']?.toString() ?? '';
    final cancellationReason = visit['cancellationReason']?.toString() ?? '';
    final feedbackNotes = visit['feedbackNotes']?.toString() ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Status badge & visit ID
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      _getStatusIcon(status),
                      size: 16,
                      color: _getStatusTextColor(status),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _getStatusBgColor(status),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _getStatusText(status),
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _getStatusTextColor(status),
                        ),
                      ),
                    ),
                  ],
                ),
                Text(
                  'Booked on ${visit['createdAt'] != null ? DateFormat('dd MMM').format(DateTime.parse(visit['createdAt'])) : ''}',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                ),
              ],
            ),
          ),

          // Property details snippet
          InkWell(
            onTap: slug.isNotEmpty
                ? () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PropertyDetailsScreen(slug: slug),
                      ),
                    );
                  }
                : null,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      width: 72,
                      height: 72,
                      color: const Color(0xFFF1F5F9),
                      child: coverImage.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: coverImage,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => const Icon(Icons.apartment, color: AppColors.secondaryText),
                            )
                          : const Icon(Icons.apartment, color: AppColors.secondaryText),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 13.5,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryText,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 13, color: AppColors.secondaryText),
                            const SizedBox(width: 3),
                            Expanded(
                              child: Text(
                                locality,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                              ),
                            ),
                          ],
                        ),
                        if (price != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            price,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryGreen,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Scheduled Date & Time Slot
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            color: const Color(0xFFF8FAFC),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Icon(Icons.event, size: 16, color: AppColors.primaryGreen),
                      const SizedBox(width: 6),
                      Text(
                        dateStr.isNotEmpty ? dateStr : 'Date to be confirmed',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryText,
                        ),
                      ),
                    ],
                  ),
                ),
                if (timeSlot.isNotEmpty)
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 16, color: AppColors.primaryGreen),
                      const SizedBox(width: 6),
                      Text(
                        timeSlot,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryText,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),

          // Rejection note if cancelled
          if (cancellationReason.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.fromLTRB(14, 10, 14, 0),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFFECDD3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, size: 15, color: Color(0xFFE11D48)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Cancellation Reason: $cancellationReason',
                      style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF9F1239)),
                    ),
                  ),
                ],
              ),
            ),

          // Feedback notes if provided
          if (feedbackNotes.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.fromLTRB(14, 10, 14, 0),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.comment_outlined, size: 15, color: Color(0xFF16A34A)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Agent Note: $feedbackNotes',
                      style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF166534)),
                    ),
                  ),
                ],
              ),
            ),

          // Assigned Agent Contact Footer
          if (agent != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.primaryGreen.withOpacity(0.12),
                    child: const Icon(Icons.support_agent, size: 18, color: AppColors.primaryGreen),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          agent['name']?.toString() ?? 'Assigned Agent',
                          style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Your Inspection Coordinator',
                          style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.secondaryText),
                        ),
                      ],
                    ),
                  ),
                  if (agent['phone'] != null && agent['phone'].toString().isNotEmpty) ...[
                    IconButton(
                      icon: const Icon(Icons.phone, color: AppColors.primaryGreen, size: 20),
                      onPressed: () => _callPhone(agent['phone'].toString()),
                      tooltip: 'Call Agent',
                    ),
                    IconButton(
                      icon: const Icon(Icons.chat_bubble_outline, color: Color(0xFF25D366), size: 20),
                      onPressed: () => _openWhatsApp(agent['phone'].toString(), title),
                      tooltip: 'WhatsApp Agent',
                    ),
                  ],
                ],
              ),
            )
          else
            const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                color: Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.calendar_month_outlined, size: 48, color: AppColors.secondaryText),
            ),
            const SizedBox(height: 16),
            Text(
              'No site visits found',
              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'When you book an in-person site visit for any property in Nagpur, it will appear here with live agent confirmation.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
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
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              child: const Text('Browse Properties'),
            ),
          ],
        ),
      ),
    );
  }
}
