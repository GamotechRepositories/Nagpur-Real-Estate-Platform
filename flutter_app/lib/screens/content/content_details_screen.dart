import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';

const Map<String, Map<String, String>> kStaticLegalBodies = {
  'terms-of-service': {
    'title': 'Terms of Service & Platform Guidelines',
    'category': 'LEGAL COMPLIANCE',
    'readTime': '6 min read',
    'body': '''
1. Agreement to Terms
By accessing or using Nagpur Realty (nagpurestate.com), you agree to comply with and be bound by these Terms of Service. Our platform functions as an exclusive digital real estate marketplace connecting verified developers, certified brokers, and discerning buyers across Nagpur, Maharashtra.

2. Listing Authenticity & MahaRERA Compliance
Every commercial development, residential project, and plotted layout advertised on this platform must comply with the Real Estate (Regulation and Development) Act, 2016 (MahaRERA). Listing creators warrant that all sanctions, floor plans, pricing sheets, and project completion dates are accurate and approved by the Nagpur Municipal Corporation (NMC) or Nagpur Metropolitan Region Development Authority (NMRDA).

3. 90-Day Listing Lifecycle & Verification
To ensure high data hygiene and eliminate ghost listings, properties published on Nagpur Realty remain active for a maximum duration of 90 days. Property owners and authorized agents must re-validate availability, price adjustments, or occupancy status prior to cycle expiration.

4. User Privacy & Lead Routing
Direct inquiries, site visit requests, and contact details shared on this portal are handled under strict confidentiality protocols. Data is transmitted exclusively to the verified listing owner or our dedicated concierge team to facilitate legitimate viewings.
''',
  },
  'privacy-policy': {
    'title': 'Privacy Policy & Data Governance',
    'category': 'DATA PRIVACY',
    'readTime': '5 min read',
    'body': '''
1. Information Collection
We collect essential information required to verify buyer eligibility, facilitate instant WhatsApp and phone communication, and authenticate verified property listings. This includes mobile phone numbers verified via secure one-time passwords (OTP), verified email addresses, and geographical search parameters.

2. Data Usage & Security
Under no circumstances are customer databases sold or rented to third-party marketing entities. Information is strictly utilized for user session management, automated property alerts, scheduled site visit coordination, and platform security audits.

3. Session Storage & Preferences
We deploy standard secure storage to personalize locality insights, remember currency formatting preferences, and monitor platform performance across devices.
''',
  },
  'rera-compliance-guide': {
    'title': 'MahaRERA Compliance & Buyer Protection Guide',
    'category': 'BUYER PROTECTION',
    'readTime': '8 min read',
    'body': '''
1. The Role of MahaRERA in Nagpur
The Maharashtra Real Estate Regulatory Authority (MahaRERA) guarantees transparency and accountability in real estate transactions. In Nagpur, all ongoing and new residential projects spanning more than 500 square meters or encompassing eight or more apartments must possess a valid MahaRERA registration number.

2. Verifying Sanctions & Title Clearances
Prior to booking an apartment in high-growth corridors such as Wardha Road, Besa, or Manish Nagar, buyers should inspect the approved building sanctions from NMC/NMRDA, non-agricultural (NA) conversion certificates, and Commencement Certificates (CC).

3. Release Letter (RL) for Plot Buyers
Plots in Nagpur must possess a valid Release Letter (RL) issued by NMRDA ensuring that civic amenities, road reservations, and drainage lines are compliant with municipal layout norms.
''',
  },
};

class ContentDetailsScreen extends StatelessWidget {
  final String slug;
  final String? initialTitle;
  final String? initialSummary;
  final String? initialImage;

  const ContentDetailsScreen({
    Key? key,
    required this.slug,
    this.initialTitle,
    this.initialSummary,
    this.initialImage,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final legalData = kStaticLegalBodies[slug];
    final title = initialTitle ?? legalData?['title'] ?? 'Platform Documentation';
    final category = legalData?['category'] ?? 'REAL ESTATE ADVISORY';
    final readTime = legalData?['readTime'] ?? '5 min read';
    final body = legalData?['body'] ??
        (initialSummary != null
            ? '$initialSummary\n\nNagpur continues to witness accelerated infrastructure development, underpinned by the operational Phase 1 Metro, upcoming Phase 2 expansions, and expanding IT ecosystems across MIHAN Special Economic Zone.'
            : 'Detailed advisory guidelines curated by Nagpur Realty editorial and legal compliance teams.');

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        title: Text(
          category,
          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.lightGreen,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  readTime,
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryText,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Nagpur Realty Compliance & Advisory Board',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
              ),
              const SizedBox(height: 16),
              const Divider(color: AppColors.borderGrey),
              const SizedBox(height: 16),
              Text(
                body,
                style: GoogleFonts.inter(fontSize: 13.5, color: AppColors.primaryText, height: 1.6),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
