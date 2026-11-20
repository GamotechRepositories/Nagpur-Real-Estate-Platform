const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MongoDB Connected for seeding]');

    const ContentPage = require('../models/ContentPage');

    const items = [
      {
        title: 'Top 10 Localities in Nagpur for Property Investment in 2025',
        slug: 'top-10-localities-nagpur-property-investment-2025',
        category: 'BLOG',
        language: 'en',
        excerpt: 'An in-depth analysis of emerging growth corridors, capital appreciation trends, and rental yields across Dharampeth, Manish Nagar, Wardha Road, and Besa.',
        content: 'Nagpur continues to witness accelerated infrastructure development, underpinned by the operational Phase 1 Metro, upcoming Phase 2 expansions, and expanding IT ecosystems across MIHAN Special Economic Zone. High-growth residential pockets like Dharampeth, Ramdaspeth, Wardha Road, and Besa are delivering 8-12% annual capital appreciation with strong rental yields.',
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        tags: ['Investment', 'Nagpur Real Estate', 'Market Trends'],
      },
      {
        title: 'How Nagpur Metro Phase 2 is Boosting Property Prices along Wardha Road',
        slug: 'nagpur-metro-phase-2-property-appreciation',
        category: 'BLOG',
        language: 'en',
        excerpt: 'Connecting MIHAN, Butibori, and central hubs: how upcoming metro expansions are driving residential demand and commercial valuations.',
        content: 'The Phase 2 extension of the Nagpur Metro is poised to transform daily commuting across South and East Nagpur. Areas situated within 1-2 km of new metro corridors are witnessing an influx of Grade-A township developments by premier developers, making transit-oriented developments highly sought after.',
        coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        tags: ['Metro', 'Wardha Road', 'Infrastructure'],
      },
      {
        title: 'Complete Guide to NMRDA Sanctioned Layouts and MahaRERA Verification',
        slug: 'nmrda-rera-compliance-guide-nagpur',
        category: 'BLOG',
        language: 'en',
        excerpt: 'Crucial checklist for plot buyers in Nagpur: verifying RL (Release Letter), NMRDA sanction orders, and 7/12 extract details before investing.',
        content: 'Buying a plot in Nagpur requires rigorous due diligence. Buyers must confirm that the layout is approved by NMRDA and possesses a valid Release Letter (RL). Without an RL, civic permissions for construction and home loan disbursements from leading nationalized banks cannot be availed.',
        coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        tags: ['RERA', 'NMRDA', 'Plots', 'Legal'],
      },
      {
        title: 'Why Besa & Manish Nagar are Nagpur Fastest Growing Residential Hubs',
        slug: 'why-besa-manish-nagar-fastest-growing-hubs',
        category: 'BLOG',
        language: 'en',
        excerpt: 'Proximity to MIHAN, international airport, metro connectivity, and top schools make Besa & Manish Nagar the hottest choices for homebuyers.',
        content: 'Besa and Manish Nagar have emerged as the prime epicenter of suburban residential expansion in Nagpur. With wide arterial link roads, seamless connectivity to Wardha Road, and proximity to major multi-speciality hospitals and international schools, these areas attract both young professionals and seasoned investors.',
        coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        tags: ['Besa', 'Manish Nagar', 'Residential'],
      },
      {
        title: 'What is MahaRERA registration and why is it important in Nagpur?',
        slug: 'what-is-maharera-registration-importance-nagpur',
        category: 'FAQ',
        language: 'en',
        excerpt: 'MahaRERA registration ensures that the residential or commercial project is legally approved by the government and cannot default on construction milestones or funds.',
        content: 'The Maharashtra Real Estate Regulatory Authority (MahaRERA) guarantees transparency and accountability in real estate transactions. In Nagpur, all ongoing and new residential projects spanning more than 500 square meters or encompassing eight or more apartments must possess a valid MahaRERA registration number. Checking the MahaRERA number protects buyers against project delays and unauthorized alterations.',
        coverImage: '',
        isPublished: true,
        tags: ['MahaRERA', 'FAQ', 'Legal'],
      },
      {
        title: 'नागपूरमध्ये प्लॉट खरेदी करताना NMRDA / RL (Release Letter) का आवश्यक आहे?',
        slug: 'nagpur-plot-nmrda-rl-release-letter-importance',
        category: 'FAQ',
        language: 'mr',
        excerpt: 'NMRDA चा RL (रिलीज लेटर) असल्याशिवाय प्लॉट नियमित आणि कायदेशीर मानला जात नाही, तसेच त्यावर बँकेकडून गृहकर्ज मिळत नाही.',
        content: 'नागपूर महानगर प्रदेश विकास प्राधिकरण (NMRDA) च्या अखत्यारीत येणाऱ्या सर्व लेआउट्सना एनएमआरडीए मंजुरी आणि त्यानंतर नगररचना विभागाकडून रिलीज लेटर (RL) मिळणे बंधनकारक असते. आरएल मिळालेल्या प्लॉटवरच रस्ते, वीज, पाणी आणि ड्रेनेजची अधिकृत सोय होते आणि राष्ट्रीयीकृत बँका सहज कर्ज मंजूर करतात.',
        coverImage: '',
        isPublished: true,
        tags: ['NMRDA', 'FAQ', 'मराठी', 'प्लॉट'],
      },
      {
        title: 'How can I apply for a home loan through ZAMEEN?',
        slug: 'how-to-apply-home-loan-zameen',
        category: 'FAQ',
        language: 'en',
        excerpt: 'Calculate your monthly outflow with our Home Loan EMI Calculator and tap "Apply For Loan" to get pre-approved offers starting at 8.40% p.a.',
        content: 'You can use the EMI Calculator on our homepage or in Tools to calculate your principal and interest repayment. Tapping "Apply For Loan" forwards your application directly to our partner banking desks (SBI, HDFC, ICICI, Axis Bank) in Nagpur for priority documentation and pre-approval with preferential interest rates.',
        coverImage: '',
        isPublished: true,
        tags: ['Home Loan', 'FAQ', 'Banking'],
      },
      {
        title: 'Are there any brokerage fees on properties listed by owners on ZAMEEN?',
        slug: 'are-there-brokerage-fees-owner-properties-zameen',
        category: 'FAQ',
        language: 'en',
        excerpt: 'No, ZAMEEN offers 100% Zero Brokerage on all properties listed directly by owners and verified builders.',
        content: 'Properties tagged with Owner or Zero Brokerage carry no commission or agent fees whatsoever. Buyers can connect directly with property owners and schedule verified site visits at no cost.',
        coverImage: '',
        isPublished: true,
        tags: ['Brokerage', 'FAQ', 'Zero Brokerage'],
      },
      {
        title: 'How are properties verified on Nagpur Realty / ZAMEEN?',
        slug: 'how-properties-verified-nagpur-realty',
        category: 'FAQ',
        language: 'en',
        excerpt: 'Our dedicated on-ground field team verifies physical site presence, MahaRERA certificates, layout sanctions, and seller identity before assigning the Verified badge.',
        content: 'Every listing requesting verification undergoes physical geotagged photography, review of municipal building sanctions (NMC/NIT/NMRDA), and title sanity checks by our compliance desk. Listings with the green Verified checkmark have passed all rigorous quality and legal benchmarks.',
        coverImage: '',
        isPublished: true,
        tags: ['Verified', 'FAQ', 'Safety'],
      },
      {
        title: 'नागपुरात घर खरेदी करताना मुद्रांक शुल्क (Stamp Duty) आणि नोंदणी शुल्क किती असते?',
        slug: 'nagpur-stamp-duty-registration-charges-guide',
        category: 'FAQ',
        language: 'mr',
        excerpt: 'नागपूर शहरात महानगरपालिका क्षेत्रात मुद्रांक शुल्क साधारण ७% (महिलांसाठी १% सवलत) आणि नोंदणी शुल्क १% (जास्तीत जास्त ₹३०,०००) असते.',
        content: 'महाराष्ट्र शासनाच्या नियमांनुसार नागपूर महानगरपालिका (NMC) कार्यक्षेत्रात ५% बेसिक स्टॅम्प ड्युटी + १% स्थानिक संस्था कर (LBT) + १% मेट्रो सेस असे एकूण ७% मुद्रांक शुल्क आकारले जाते. महिला खरेदीदारांसाठी १% सवलत मिळते. नोंदणी फी १% (जास्तीत जास्त ३०,००० रुपये) आकारली जाते.',
        coverImage: '',
        isPublished: true,
        tags: ['Stamp Duty', 'FAQ', 'मराठी', 'नोंदणी'],
      },
    ];

    for (const it of items) {
      await ContentPage.findOneAndUpdate({ slug: it.slug }, { $set: it }, { upsert: true, new: true });
    }

    const count = await ContentPage.countDocuments({});
    console.log(`[Success]: Seeded ContentPages! Total in DB: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('[Error Seeding]:', err);
    process.exit(1);
  }
};

seed();
