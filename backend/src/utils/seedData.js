require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const {
  User,
  AgentProfile,
  Property,
  Locality,
  Project,
  Amenity,
  AppSettings,
  ContentPage,
  Enquiry,
  SiteVisit,
  Verification,
} = require('../models');
const {
  ROLES,
  PROPERTY_STATUS,
  PROPERTY_PURPOSE,
  PROPERTY_SUBTYPES,
  LEAD_STATUS,
  LEAD_SOURCE,
  SITE_VISIT_STATUS,
} = require('../constants');

const NAGPUR_LOCALITIES = [
  {
    name: 'Dharampeth',
    nameEn: 'Dharampeth',
    nameHi: 'धरमपेठ',
    nameMr: 'धरमपेठ',
    slug: 'dharampeth',
    pincode: '440010',
    location: { type: 'Point', coordinates: [79.0607, 21.1438] },
    description: 'Premier upscale residential and commercial hub in West Nagpur known for premium apartments, shopping, and cafes.',
    isFeatured: true,
    areaGuide: {
      overview: 'Dharampeth is widely regarded as one of Nagpur’s most prestigious and vibrant neighbourhoods.',
      connectivity: 'Seamless access to West High Court Road, Amravati Road, and Shankar Nagar Square.',
      schoolsAndColleges: ['Dharampeth Science College', 'St. Ursula Girls High School', 'LAD College'],
      hospitals: ['Sengupta Hospital', 'Dande Hospital', 'Sushrut Hospital'],
      shoppingAndEntertainment: ['Traffic Park', 'WHC Road Shopping Promenade', 'Gokulpeth Market'],
      averagePricePerSqFt: 8500,
    },
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Ramdaspeth', 'Shankar Nagar', 'Gokulpeth', 'Shivaji Nagar'],
  },
  {
    name: 'Civil Lines',
    nameEn: 'Civil Lines',
    nameHi: 'सिविल लाइन्स',
    nameMr: 'सिव्हिल लाईन्स',
    slug: 'civil-lines',
    pincode: '440001',
    location: { type: 'Point', coordinates: [79.0725, 21.1558] },
    description: 'The greenest and most prestigious administrative and residential area in Nagpur.',
    isFeatured: true,
    areaGuide: {
      overview: 'Home to the High Court of Bombay Nagpur Bench, Vidhan Bhavan, Raj Bhavan, and elite heritage bungalows.',
      connectivity: 'Central road network with palm-lined avenues and zero congestion.',
      schoolsAndColleges: ['St. Francis De Sales School (SFS)', 'Bishop Cotton School', 'G.S. College of Commerce'],
      hospitals: ['Wockhardt Hospital', 'Krims Hospitals'],
      shoppingAndEntertainment: ['Nagpur Club', 'CP Club', 'Japanese Rose Garden'],
      averagePricePerSqFt: 11000,
    },
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Sadar', 'Dharampeth', 'Sitabuldi', 'Seminary Hills'],
  },
  {
    name: 'Ramdaspeth',
    nameEn: 'Ramdaspeth',
    nameHi: 'रामदासपेठ',
    nameMr: 'रामदासपेठ',
    slug: 'ramdaspeth',
    pincode: '440010',
    location: { type: 'Point', coordinates: [79.0718, 21.1372] },
    description: 'Central commercial and medical district with upscale apartments, private clinics, and restaurants.',
    isFeatured: true,
    areaGuide: {
      overview: 'Renowned for healthcare centers, corporate offices, and central urban living.',
      connectivity: 'Adjacent to Wardha Road, Lokmat Square, and Shankar Nagar.',
      schoolsAndColleges: ['Centre Point School', 'Somalwar High School'],
      hospitals: ['Care Hospital', 'KRIMS Hospital', 'Orange City Hospital'],
      shoppingAndEntertainment: ['Central Mall', 'Canal Road Dining', 'Poonam Chambers'],
      averagePricePerSqFt: 9200,
    },
    heroImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Dharampeth', 'Dhantoli', 'Shankar Nagar', 'Sitabuldi'],
  },
  {
    name: 'Wardha Road',
    nameEn: 'Wardha Road',
    nameHi: 'वर्धा रोड',
    nameMr: 'वर्धा रोड',
    slug: 'wardha-road',
    pincode: '440025',
    location: { type: 'Point', coordinates: [79.0628, 21.0664] },
    description: 'The prime growth corridor of Nagpur connecting the International Airport, MIHAN SEZ, and AIIMS.',
    isFeatured: true,
    areaGuide: {
      overview: 'Nagpur’s primary growth corridor featuring major townships, luxury villas, and IT campuses.',
      connectivity: 'Direct expressway connectivity, Nagpur Metro Line 1 along the entire stretch.',
      schoolsAndColleges: ['Delhi Public School MIHAN', 'TCS / Infosys Campuses', 'IIM Nagpur'],
      hospitals: ['AIIMS Nagpur', 'National Cancer Institute (NCI)'],
      shoppingAndEntertainment: ['MIHAN Clubhouse', 'Nagpur Central Mall (adjacent)'],
      averagePricePerSqFt: 4800,
    },
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Manish Nagar', 'Besa', 'Khapri', 'MIHAN'],
  },
  {
    name: 'Manish Nagar',
    nameEn: 'Manish Nagar',
    nameHi: 'मनीष नगर',
    nameMr: 'मनीष नगर',
    slug: 'manish-nagar',
    pincode: '440015',
    location: { type: 'Point', coordinates: [79.0831, 21.0922] },
    description: 'Rapidly growing residential destination in South Nagpur with exceptional metro and airport connectivity.',
    isFeatured: true,
    areaGuide: {
      overview: 'Favored by IT professionals working in MIHAN and families seeking modern high-rise gated communities.',
      connectivity: 'Close to Nagpur Metro (Airport & Ujjwal Nagar stations) and Wardha Road.',
      schoolsAndColleges: ['Modern School', 'Narayana Vidyalayam', 'St. Vincent Pallotti College'],
      hospitals: ['AIIMS Nagpur (nearby)', 'Suretech Hospital', 'Alexis Multi-Speciality'],
      shoppingAndEntertainment: ['Reliance Smart Bazaar', 'Manish Nagar Market', 'Subhash Garden'],
      averagePricePerSqFt: 5400,
    },
    heroImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Besa', 'Somalwada', 'Wardha Road', 'Chhatrapati Square'],
  },
  {
    name: 'Besa',
    nameEn: 'Besa',
    nameHi: 'बेसा',
    nameMr: 'बेसा',
    slug: 'besa',
    pincode: '440037',
    location: { type: 'Point', coordinates: [79.1027, 21.0851] },
    description: 'Affordable and family-friendly residential suburb with excellent infrastructure and new high-rise societies.',
    isFeatured: true,
    areaGuide: {
      overview: 'Besa is one of the most in-demand residential pockets for 2 & 3 BHK flats and NMRDA-sanctioned plots.',
      connectivity: 'Easy access to Ring Road, Manish Nagar, and Wardha Road.',
      schoolsAndColleges: ['Bhavan’s B.P. Vidya Mandir', 'Podar International School'],
      hospitals: ['Radhika Hospital', 'Sanjivani Multispeciality'],
      shoppingAndEntertainment: ['Besa Square Market', 'Decathlon MIHAN (10 mins)'],
      averagePricePerSqFt: 4200,
    },
    heroImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Manish Nagar', 'Pipla', 'Ghogli', 'Beltarodi'],
  },
  {
    name: 'Shankar Nagar',
    nameEn: 'Shankar Nagar',
    nameHi: 'शंकर नगर',
    nameMr: 'शंकर नगर',
    slug: 'shankar-nagar',
    pincode: '440010',
    location: { type: 'Point', coordinates: [79.0588, 21.1345] },
    description: 'Traditional elite residential pocket in West Nagpur known for wide tree-lined boulevards and cultural landmarks.',
    isFeatured: true,
    areaGuide: {
      overview: 'Centrally situated between Dharampeth and Bajaj Nagar, highly sought after for luxury redevelopment apartments.',
      connectivity: 'Quick transit to WHC Road, VNIT, and Ambazari Lake.',
      schoolsAndColleges: ['Saraswati Vidyalaya', 'LAD College'],
      hospitals: ['Orange City Hospital', 'Avanti Hospital'],
      shoppingAndEntertainment: ['Shankar Nagar Square Cafes', 'South Indian Temple'],
      averagePricePerSqFt: 8800,
    },
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Dharampeth', 'Bajaj Nagar', 'Laxmi Nagar'],
  },
  {
    name: 'Sitabuldi',
    nameEn: 'Sitabuldi',
    nameHi: 'सीताबर्डी',
    nameMr: 'सीताबर्डी',
    slug: 'sitabuldi',
    pincode: '440012',
    location: { type: 'Point', coordinates: [79.0839, 21.1466] },
    description: 'The historic commercial, retail, and metro interchange nucleus of Nagpur.',
    isFeatured: false,
    areaGuide: {
      overview: 'Heart of Nagpur retail trade, historic fort, and the central interchange of Nagpur Metro Aqua & Orange lines.',
      connectivity: 'Direct interchange station for both metro lines, adjacent to Nagpur Junction Railway Station.',
      schoolsAndColleges: ['St. John’s High School', 'Hislop College'],
      hospitals: ['Government Medical College & Hospital (GMCH) nearby'],
      shoppingAndEntertainment: ['Eternity Mall', 'Sitabuldi Main Market', 'Fort Walkways'],
      averagePricePerSqFt: 12500,
    },
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Civil Lines', 'Dhantoli', 'Ramdaspeth'],
  },
  {
    name: 'Pratap Nagar',
    nameEn: 'Pratap Nagar',
    nameHi: 'प्रताप नगर',
    nameMr: 'प्रताप नगर',
    slug: 'pratap-nagar',
    pincode: '440022',
    location: { type: 'Point', coordinates: [79.0567, 21.1189] },
    description: 'Quiet, premium residential enclave in South-West Nagpur with elite schools and proximity to VNIT.',
    isFeatured: false,
    areaGuide: {
      overview: 'Peaceful residential neighborhood favored by senior professionals, academicians, and doctors.',
      connectivity: 'Ring Road access, 10 minutes to Orange City Square.',
      schoolsAndColleges: ['Bhavan’s Bhagwandas Purohit Vidya Mandir', 'VNIT Campus'],
      hospitals: ['Suretech Hospital', 'Spandan Heart Institute'],
      shoppingAndEntertainment: ['Pratap Nagar Shopping Plaza', 'Pramod Mahajan Garden'],
      averagePricePerSqFt: 7200,
    },
    heroImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    nearbyLocalities: ['Khamla', 'Pande Layout', 'Surendra Nagar'],
  },
];

const AMENITIES_DATA = [
  { name: '24x7 Security & CCTV', nameEn: '24x7 Security & CCTV', nameHi: '24x7 सुरक्षा और सीसीटीवी', nameMr: '२४x७ सुरक्षा व सीसीटीव्ही', icon: 'ShieldCheck', category: 'SECURITY' },
  { name: 'Power Backup', nameEn: '100% Power Backup', nameHi: 'पावर बैकअप', nameMr: 'विद्युत बॅकअप', icon: 'Zap', category: 'BASIC' },
  { name: 'High Speed Lift', nameEn: 'High Speed Lift', nameHi: 'हाई स्पीड लिफ्ट', nameMr: 'हाय स्पीड लिफ्ट', icon: 'ArrowUpDown', category: 'BASIC' },
  { name: 'Gymnasium & Fitness', nameEn: 'Gymnasium & Fitness', nameHi: 'जिम और फिटनेस', nameMr: 'जिम व फिटनेस', icon: 'Dumbbell', category: 'LEISURE' },
  { name: 'Swimming Pool', nameEn: 'Swimming Pool', nameHi: 'स्विमिंग पूल', nameMr: 'जलतरण तलाव', icon: 'Waves', category: 'LEISURE' },
  { name: 'Reserved Covered Parking', nameEn: 'Reserved Covered Parking', nameHi: 'आरक्षित कवर्ड पार्किंग', nameMr: 'आरक्षित पार्किंग', icon: 'Car', category: 'BASIC' },
  { name: 'Children Play Area & Park', nameEn: 'Children Play Area & Park', nameHi: 'बच्चों का खेल क्षेत्र और पार्क', nameMr: 'मुलांचे खेळाचे मैदान व उद्यान', icon: 'Smile', category: 'LEISURE' },
  { name: 'Club House & Community Hall', nameEn: 'Club House', nameHi: 'क्लब हाउस', nameMr: 'क्लब हाऊस', icon: 'Home', category: 'LEISURE' },
  { name: 'Rainwater Harvesting', nameEn: 'Rainwater Harvesting', nameHi: 'वर्षा जल संचयन', nameMr: 'रेन वॉटर हार्वेस्टिंग', icon: 'CloudRain', category: 'ECO_FRIENDLY' },
  { name: 'Solar Water Heating', nameEn: 'Solar Water Heating', nameHi: 'सोलर वाटर हीटर', nameMr: 'सौर जल तापक', icon: 'Sun', category: 'ECO_FRIENDLY' },
  { name: 'Piped Gas Connection', nameEn: 'Piped Natural Gas (PNG)', nameHi: 'पाइप्ड गैस कनेक्शन', nameMr: 'पाईप गॅस जोडणी', icon: 'Flame', category: 'BASIC' },
  { name: 'Fire Fighting Systems', nameEn: 'Fire Fighting Systems', nameHi: 'अग्निशमन प्रणाली', nameMr: 'अग्निशमन यंत्रणा', icon: 'FlameKindling', category: 'SECURITY' },
];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<db_username>')) {
      console.error('[Seed Error]: Valid MONGODB_URI is required to run seed script.');
      process.exit(1);
    }

    console.log('[Seed]: Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('[Seed]: Connected successfully.');

    // 1. Seed Amenities
    console.log('[Seed]: Seeding Amenities...');
    for (const a of AMENITIES_DATA) {
      await Amenity.findOneAndUpdate({ name: a.name }, { $set: a }, { upsert: true });
    }

    // 2. Seed Nagpur Localities
    console.log('[Seed]: Seeding Nagpur Localities...');
    for (const loc of NAGPUR_LOCALITIES) {
      await Locality.findOneAndUpdate({ slug: loc.slug }, { $set: loc }, { upsert: true });
    }

    // 3. Seed Default AppSettings
    console.log('[Seed]: Initializing AppSettings...');
    await AppSettings.findOneAndUpdate(
      { key: 'GENERAL_CONFIG' },
      {
        $setOnInsert: {
          key: 'GENERAL_CONFIG',
          leadRouting: {
            routingMode: 'ROUND_ROBIN',
            defaultSlaHours: 4,
            autoEscalateAfterSla: true,
          },
          listingConfig: {
            validityDays: 90,
            reminderDays: [7, 1],
          },
          contacts: {
            helplinePhone: '+91 712 2550100',
            supportEmail: 'advisory@nagpurestate.com',
            whatsappNumber: '+91 9823000000',
            officeAddress: 'Civil Lines, Nagpur, Maharashtra 440001',
          },
        },
      },
      { upsert: true }
    );

    // 4. Seed Super Admin User
    console.log('[Seed]: Creating Admin User...');
    const adminEmail = 'admin@nagpurestate.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        phone: '9823012345',
        name: 'Super Admin',
        email: adminEmail,
        password: 'Nagpur@Admin2026!',
        role: ROLES.SUPER_ADMIN,
        designation: 'Super Administrator',
        isStaff: true,
        permissions: ['*'],
        isPhoneVerified: true,
        isEmailVerified: true,
        status: 'ACTIVE',
      });
      console.log(`[Seed]: Super Admin created: ${adminEmail} / Nagpur@Admin2026!`);
    } else {
      admin.isStaff = true;
      admin.designation = 'Super Administrator';
      if (!admin.permissions || admin.permissions.length === 0) {
        admin.permissions = ['*'];
      }
      await admin.save();
    }

    // 5. Seed Multiple Accredited Agents
    console.log('[Seed]: Creating Verified Nagpur Real Estate Agents...');

    // Agent 1: Rajesh Sharma
    let agent1 = await User.findOne({ phone: '9822112233' });
    if (!agent1) {
      agent1 = await User.create({
        phone: '9822112233',
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@nagpurestate.com',
        password: 'Agent@Nagpur2026',
        role: ROLES.AGENT,
        isPhoneVerified: true,
        isEmailVerified: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
      });

      await AgentProfile.create({
        user: agent1._id,
        agencyName: 'Sharma Real Estate Consultants',
        reraNumber: 'A50500001234',
        bio: 'Over 12 years of specialized real estate consultancy in Dharampeth, Ramdaspeth, and Wardha Road corridors.',
        experienceYears: 12,
        areasServed: ['Dharampeth', 'Ramdaspeth', 'Wardha Road'],
        specializations: ['LUXURY_APARTMENTS', 'COMMERCIAL'],
        isVerified: true,
        verifiedAt: new Date(),
        rating: 4.9,
        reviewsCount: 38,
      });
    }

    // Agent 2: Priya Deshmukh
    let agent2 = await User.findOne({ phone: '9822445566' });
    if (!agent2) {
      agent2 = await User.create({
        phone: '9822445566',
        name: 'Priya Deshmukh',
        email: 'priya.deshmukh@nagpurestate.com',
        password: 'Agent@Nagpur2026',
        role: ROLES.AGENT,
        isPhoneVerified: true,
        isEmailVerified: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      });

      await AgentProfile.create({
        user: agent2._id,
        agencyName: 'Vidarbha Luxury Assets',
        reraNumber: 'A50500005678',
        bio: 'High-net-worth property acquisition specialist focusing exclusively on Civil Lines heritage estates and prime high-rises.',
        experienceYears: 9,
        areasServed: ['Civil Lines', 'Dharampeth', 'Shankar Nagar'],
        specializations: ['VILLAS', 'PENTHOUSES', 'HERITAGE'],
        isVerified: true,
        verifiedAt: new Date(),
        rating: 4.95,
        reviewsCount: 29,
      });
    }

    // Agent 3: Amit Kulkarni
    let agent3 = await User.findOne({ phone: '9822778899' });
    if (!agent3) {
      agent3 = await User.create({
        phone: '9822778899',
        name: 'Amit Kulkarni',
        email: 'amit.kulkarni@nagpurestate.com',
        password: 'Agent@Nagpur2026',
        role: ROLES.AGENT,
        isPhoneVerified: true,
        isEmailVerified: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      });

      await AgentProfile.create({
        user: agent3._id,
        agencyName: 'Corridor Land & Housing Advisory',
        reraNumber: 'A50500009876',
        bio: 'Specialist in NMRDA sanctioned layouts, suburban plotting developments, and MIHAN growth corridor transactions.',
        experienceYears: 15,
        areasServed: ['Wardha Road', 'Besa', 'Manish Nagar'],
        specializations: ['PLOTS', 'NEW_PROJECTS'],
        isVerified: true,
        verifiedAt: new Date(),
        rating: 4.88,
        reviewsCount: 45,
      });
    }

    // Fetch locality documents for relational linking
    const dharampethDoc = await Locality.findOne({ slug: 'dharampeth' });
    const civilLinesDoc = await Locality.findOne({ slug: 'civil-lines' });
    const ramdaspethDoc = await Locality.findOne({ slug: 'ramdaspeth' });
    const wardhaRoadDoc = await Locality.findOne({ slug: 'wardha-road' });
    const manishNagarDoc = await Locality.findOne({ slug: 'manish-nagar' });
    const besaDoc = await Locality.findOne({ slug: 'besa' });
    const shankarNagarDoc = await Locality.findOne({ slug: 'shankar-nagar' });
    const sitabuldiDoc = await Locality.findOne({ slug: 'sitabuldi' });
    const pratapNagarDoc = await Locality.findOne({ slug: 'pratap-nagar' });

    // 6. Seed Nagpur Projects
    console.log('[Seed]: Seeding Architectural Projects...');
    const SAMPLE_PROJECTS = [
      {
        name: 'Godrej Forest Grove Nagpur',
        slug: 'godrej-forest-grove-nagpur',
        builderName: 'Godrej Properties',
        reraNumber: 'P50500021345',
        projectStatus: 'UNDER_CONSTRUCTION',
        possessionDate: new Date('2027-12-31'),
        localityName: 'Wardha Road',
        locality: wardhaRoadDoc?._id,
        location: { type: 'Point', coordinates: [79.0628, 21.0664] },
        priceRange: { minPrice: 6500000, maxPrice: 16500000 },
        configurations: ['2 BHK', '3 BHK', '4 BHK'],
        description: 'Ultra-modern eco-luxury residential township spanning 15 acres on prime Wardha Road with 75% open landscaped greenery.',
        amenities: ['Club House', 'Swimming Pool', 'Gymnasium', 'Tennis Court', 'Rainwater Harvesting'],
        images: [{ url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Front Elevation' }],
      },
      {
        name: 'Moraj WaterCube Civil Lines',
        slug: 'moraj-watercube-civil-lines',
        builderName: 'Moraj Infratech',
        reraNumber: 'P50500028912',
        projectStatus: 'READY_TO_MOVE',
        possessionDate: new Date('2025-06-30'),
        localityName: 'Civil Lines',
        locality: civilLinesDoc?._id,
        location: { type: 'Point', coordinates: [79.0725, 21.1558] },
        priceRange: { minPrice: 18500000, maxPrice: 38000000 },
        configurations: ['3 BHK', '4 BHK', 'Penthouse'],
        description: 'Signature boutique high-rise residences set amidst the historic tranquility of Civil Lines, Nagpur.',
        amenities: ['Infinity Pool', 'Concierge Desk', 'Rooftop Lounge', 'Automated Parking'],
        images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', caption: 'Exterior Skyline' }],
      },
      {
        name: 'Pyramid City Besa Enclave',
        slug: 'pyramid-city-besa-enclave',
        builderName: 'Pyramid Group',
        reraNumber: 'P50500034567',
        projectStatus: 'UNDER_CONSTRUCTION',
        possessionDate: new Date('2026-09-30'),
        localityName: 'Besa',
        locality: besaDoc?._id,
        location: { type: 'Point', coordinates: [79.1027, 21.0851] },
        priceRange: { minPrice: 4200000, maxPrice: 8500000 },
        configurations: ['2 BHK', '3 BHK'],
        description: 'Comprehensive family gated township with clubhouse, sports courts, and landscaped podium gardens.',
        amenities: ['Club House', 'Gymnasium', 'Power Backup', 'Children Play Area'],
        images: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', caption: 'Podium Garden Elevation' }],
      }
    ];

    for (const proj of SAMPLE_PROJECTS) {
      await Project.findOneAndUpdate({ slug: proj.slug }, { $set: proj }, { upsert: true });
    }

    // 7. Seed Properties
    console.log('[Seed]: Seeding Verified Properties in Nagpur...');
    const SAMPLE_PROPERTIES = [
      {
        title: '3 BHK Luxury Apartment in Dharampeth West',
        slug: '3-bhk-luxury-apartment-dharampeth-west-nagpur-101',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.FLAT,
        description: 'Exclusive 3 BHK corner apartment with panoramic views of Traffic Park. High-end Italian marble flooring, VRV central air-conditioning, double glazed acoustic glass, modular kitchen with Bosch fittings, and 2 reserved basement parking slots.',
        price: 13500000,
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 1850,
        areaDisplay: 1850,
        areaUnit: 'Sq.Ft',
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        floor: 6,
        totalFloors: 11,
        furnishing: 'SEMI_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        propertyAge: 'Under 1 year',
        facing: 'EAST',
        reraNumber: 'P50500018901',
        amenities: ['24x7 Security & CCTV', 'Power Backup', 'High Speed Lift', 'Gymnasium & Fitness', 'Reserved Covered Parking'],
        location: { type: 'Point', coordinates: [79.0607, 21.1438] },
        address: 'Near Coffee House, West High Court Road, Dharampeth',
        locality: dharampethDoc?._id,
        localityName: 'Dharampeth',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440010',
        owner: admin._id,
        assignedAgent: agent1._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: true,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Living Hall', isCover: true },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Master Bedroom', isCover: false },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', caption: 'Modular Kitchen', isCover: false },
        ],
        viewsCount: 342,
        enquiriesCount: 14,
      },
      {
        title: 'Modern 2 BHK Gated Community Flat near Metro, Manish Nagar',
        slug: 'modern-2-bhk-gated-community-flat-manish-nagar-nagpur-102',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.FLAT,
        description: 'Brand new 2 BHK apartment in a gated multi-storey development just 500 meters from Ujjwal Nagar Metro Station. 24-hr security, rainwater harvesting, solar heating, and power backup.',
        price: 5800000,
        priceUnit: 'Total',
        priceNegotiable: false,
        areaSqFt: 1100,
        areaDisplay: 1100,
        areaUnit: 'Sq.Ft',
        bedrooms: 2,
        bathrooms: 2,
        balconies: 1,
        floor: 4,
        totalFloors: 8,
        furnishing: 'UNFURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        propertyAge: 'New',
        facing: 'NORTH',
        amenities: ['24x7 Security & CCTV', 'Power Backup', 'High Speed Lift', 'Children Play Area & Park', 'Reserved Covered Parking'],
        location: { type: 'Point', coordinates: [79.0831, 21.0922] },
        address: 'Besa-Manish Nagar Main Road, Manish Nagar',
        locality: manishNagarDoc?._id,
        localityName: 'Manish Nagar',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440015',
        owner: admin._id,
        assignedAgent: agent3._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: true,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80', caption: 'Exterior View', isCover: true },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', caption: 'Living Area', isCover: false },
        ],
        viewsCount: 521,
        enquiriesCount: 22,
      },
      {
        title: 'Premium 4 BHK Independent Villa with Garden on Wardha Road',
        slug: 'premium-4-bhk-independent-villa-wardha-road-nagpur-103',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.HOUSE_VILLA,
        description: 'Elite 4 BHK independent duplex villa situated in an exclusive secured gated enclave close to MIHAN IT SEZ. Includes landscaped private lawn, double-height ceiling in hall, and 3-car private porch.',
        price: 24500000,
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 3400,
        areaDisplay: 3400,
        areaUnit: 'Sq.Ft',
        bedrooms: 4,
        bathrooms: 4,
        balconies: 3,
        floor: 1,
        totalFloors: 2,
        furnishing: 'FULLY_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        propertyAge: '1-3 years',
        facing: 'NORTH_EAST',
        amenities: ['24x7 Security & CCTV', 'Power Backup', 'Club House & Community Hall', 'Swimming Pool', 'Gymnasium & Fitness'],
        location: { type: 'Point', coordinates: [79.0628, 21.0664] },
        address: 'Near AIIMS Campus, Wardha Road',
        locality: wardhaRoadDoc?._id,
        localityName: 'Wardha Road',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440025',
        owner: admin._id,
        assignedAgent: agent3._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: true,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Villa Front Elevation', isCover: true },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', caption: 'Garden & Patio', isCover: false },
        ],
        viewsCount: 812,
        enquiriesCount: 35,
      },
      {
        title: 'Spacious NMRDA Approved Residential Plot in Besa',
        slug: 'spacious-nmrda-approved-residential-plot-besa-nagpur-104',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'PLOT',
        subtype: PROPERTY_SUBTYPES.PLOT,
        description: 'Prime NMRDA sanction RL sanctioned residential corner plot with 40-ft wide tar road facing, underground electricity cabling, drainage line, and immediate registry.',
        price: 4500000,
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 1500,
        areaDisplay: 1500,
        areaUnit: 'Sq.Ft',
        bedrooms: 0,
        bathrooms: 0,
        balconies: 0,
        possessionStatus: 'READY_TO_MOVE',
        facing: 'EAST',
        amenities: ['Rainwater Harvesting', '24x7 Security & CCTV'],
        location: { type: 'Point', coordinates: [79.1027, 21.0851] },
        address: 'Besa-Ghogli Road, Near Podar International School, Besa',
        locality: besaDoc?._id,
        localityName: 'Besa',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440037',
        owner: admin._id,
        assignedAgent: agent3._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: false,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', caption: 'Layout Plot Ground View', isCover: true },
        ],
        viewsCount: 290,
        enquiriesCount: 19,
      },
      {
        title: 'Furnished 2 BHK Flat for Rent in Manish Nagar',
        slug: 'furnished-2-bhk-flat-for-rent-manish-nagar-nagpur-105',
        purpose: PROPERTY_PURPOSE.RENT,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.FLAT,
        description: 'Elegantly furnished 2 BHK apartment for rent. Includes AC in master bedroom, refrigerator, sofa set, dining table, water purifier, and covered reserved car parking.',
        price: 22000,
        priceUnit: 'Per Month',
        priceNegotiable: true,
        areaSqFt: 1050,
        areaDisplay: 1050,
        areaUnit: 'Sq.Ft',
        bedrooms: 2,
        bathrooms: 2,
        balconies: 1,
        floor: 2,
        totalFloors: 5,
        furnishing: 'FULLY_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        propertyAge: '1-3 years',
        facing: 'WEST',
        amenities: ['Power Backup', 'High Speed Lift', '24x7 Security & CCTV', 'Reserved Covered Parking'],
        location: { type: 'Point', coordinates: [79.0831, 21.0922] },
        address: 'Near Somalwada Square, Manish Nagar',
        locality: manishNagarDoc?._id,
        localityName: 'Manish Nagar',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440015',
        owner: admin._id,
        assignedAgent: agent3._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: false,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', caption: 'Furnished Living Room', isCover: true },
        ],
        viewsCount: 180,
        enquiriesCount: 11,
      },
      {
        title: 'Heritage Architectural Bungalow in Civil Lines',
        slug: 'heritage-architectural-bungalow-civil-lines-nagpur-106',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.HOUSE_VILLA,
        description: 'Rare opportunity to acquire a stately heritage colonial bungalow nestled on a sprawling 12,000 sq.ft private estate in prestigious Civil Lines. High ceilings, teakwood rafters, private driveway, and mature mahogany gardens.',
        price: 58000000, // 5.8 Crore
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 4800,
        areaDisplay: 4800,
        areaUnit: 'Sq.Ft',
        bedrooms: 5,
        bathrooms: 5,
        balconies: 4,
        floor: 1,
        totalFloors: 2,
        furnishing: 'SEMI_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        propertyAge: '10+ years',
        facing: 'EAST',
        amenities: ['24x7 Security & CCTV', 'Power Backup', 'Rainwater Harvesting', 'Reserved Covered Parking'],
        location: { type: 'Point', coordinates: [79.0725, 21.1558] },
        address: 'Palm Road, Near Raj Bhavan, Civil Lines',
        locality: civilLinesDoc?._id,
        localityName: 'Civil Lines',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440001',
        owner: admin._id,
        assignedAgent: agent2._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: true,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', caption: 'Heritage Estate View', isCover: true },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Private Grounds', isCover: false },
        ],
        viewsCount: 1420,
        enquiriesCount: 42,
      },
      {
        title: 'Executive Sky Penthouse with Terrace in Ramdaspeth',
        slug: 'executive-sky-penthouse-terrace-ramdaspeth-nagpur-107',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.FLAT,
        description: 'Duplex sky penthouse on the 12th & 13th floors offering uninterrupted 360-degree skyline views of Nagpur. Features private rooftop infinity plunge pool, Jacuzzi, Italian kitchen, and biometric access.',
        price: 21500000, // 2.15 Crore
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 2950,
        areaDisplay: 2950,
        areaUnit: 'Sq.Ft',
        bedrooms: 4,
        bathrooms: 4,
        balconies: 3,
        floor: 12,
        totalFloors: 13,
        furnishing: 'FULLY_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        propertyAge: '1-3 years',
        facing: 'NORTH',
        reraNumber: 'P50500019230',
        amenities: ['Swimming Pool', 'Gymnasium & Fitness', 'High Speed Lift', '24x7 Security & CCTV', 'Power Backup'],
        location: { type: 'Point', coordinates: [79.0718, 21.1372] },
        address: 'Canal Road, Near Care Hospital, Ramdaspeth',
        locality: ramdaspethDoc?._id,
        localityName: 'Ramdaspeth',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440010',
        owner: admin._id,
        assignedAgent: agent1._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: true,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', caption: 'Penthouse Living Deck', isCover: true },
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Skyline Terrace', isCover: false },
        ],
        viewsCount: 960,
        enquiriesCount: 28,
      },
      {
        title: 'Grade-A Corporate Office Suite on Central Avenue, Sitabuldi',
        slug: 'grade-a-corporate-office-suite-sitabuldi-nagpur-108',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'COMMERCIAL',
        subtype: PROPERTY_SUBTYPES.COMMERCIAL_OFFICE,
        description: 'Prime commercial office space situated inside an ultra-modern glass facade business tower right at Sitabuldi Metro interchange. Ideal for IT consultation, banking headquarters, or law firms.',
        price: 16500000, // 1.65 Crore
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 1450,
        areaDisplay: 1450,
        areaUnit: 'Sq.Ft',
        bedrooms: 0,
        bathrooms: 2,
        balconies: 0,
        floor: 5,
        totalFloors: 10,
        furnishing: 'SEMI_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        amenities: ['Power Backup', 'High Speed Lift', '24x7 Security & CCTV', 'Fire Fighting Systems'],
        location: { type: 'Point', coordinates: [79.0839, 21.1466] },
        address: 'Central Avenue Commercial Complex, Sitabuldi',
        locality: sitabuldiDoc?._id,
        localityName: 'Sitabuldi',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440012',
        owner: admin._id,
        assignedAgent: agent1._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: false,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', caption: 'Corporate Suite Interior', isCover: true },
        ],
        viewsCount: 410,
        enquiriesCount: 16,
      },
      {
        title: 'Boutique 3 BHK Garden Apartment in Shankar Nagar',
        slug: 'boutique-3-bhk-garden-apartment-shankar-nagar-nagpur-109',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.FLAT,
        description: 'Quiet sanctuary in Shankar Nagar West. Gated boutique low-rise with only 12 residences. Large landscaped balcony, servant quarter, and solar backup.',
        price: 11800000, // 1.18 Crore
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 1680,
        areaDisplay: 1680,
        areaUnit: 'Sq.Ft',
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        floor: 3,
        totalFloors: 4,
        furnishing: 'SEMI_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        facing: 'EAST',
        amenities: ['24x7 Security & CCTV', 'Power Backup', 'High Speed Lift', 'Reserved Covered Parking'],
        location: { type: 'Point', coordinates: [79.0588, 21.1345] },
        address: 'Opposite LAD Ground, Shankar Nagar',
        locality: shankarNagarDoc?._id,
        localityName: 'Shankar Nagar',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440010',
        owner: admin._id,
        assignedAgent: agent2._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: true,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Garden View Hall', isCover: true },
        ],
        viewsCount: 680,
        enquiriesCount: 24,
      },
      {
        title: '3 BHK High-Rise Flat with Clubhouse in Besa',
        slug: '3-bhk-high-rise-flat-clubhouse-besa-nagpur-110',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.FLAT,
        description: 'Modern high-rise residential apartment with club amenities, children play zone, jogging track, and 24-hr municipal water supply.',
        price: 6800000, // 68 Lakhs
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 1380,
        areaDisplay: 1380,
        areaUnit: 'Sq.Ft',
        bedrooms: 3,
        bathrooms: 2,
        balconies: 2,
        floor: 7,
        totalFloors: 12,
        furnishing: 'UNFURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        facing: 'NORTH',
        amenities: ['Club House & Community Hall', 'Gymnasium & Fitness', 'Swimming Pool', 'High Speed Lift', '24x7 Security & CCTV'],
        location: { type: 'Point', coordinates: [79.1027, 21.0851] },
        address: 'Besa Square, Near Podar International School, Besa',
        locality: besaDoc?._id,
        localityName: 'Besa',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440037',
        owner: admin._id,
        assignedAgent: agent3._id,
        status: PROPERTY_STATUS.LIVE,
        isVerified: true,
        isFeatured: false,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
        coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', caption: 'High Rise Facade', isCover: true },
        ],
        viewsCount: 310,
        enquiriesCount: 15,
      },
      // PENDING MODERATION LISTINGS (for the Admin Moderation Queue!)
      {
        title: 'New Launch 3 BHK Apartment in Pratap Nagar (Awaiting Verification)',
        slug: 'new-launch-3-bhk-apartment-pratap-nagar-nagpur-111',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.FLAT,
        description: 'Upcoming contemporary residence in Pratap Nagar. Spacious rooms, cross ventilation, close to VNIT campus.',
        price: 9200000,
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 1420,
        areaDisplay: 1420,
        areaUnit: 'Sq.Ft',
        bedrooms: 3,
        bathrooms: 2,
        balconies: 1,
        floor: 3,
        totalFloors: 6,
        furnishing: 'UNFURNISHED',
        possessionStatus: 'UNDER_CONSTRUCTION',
        facing: 'EAST',
        amenities: ['Power Backup', 'High Speed Lift', '24x7 Security & CCTV'],
        location: { type: 'Point', coordinates: [79.0567, 21.1189] },
        address: 'Pramod Mahajan Marg, Pratap Nagar',
        locality: pratapNagarDoc?._id,
        localityName: 'Pratap Nagar',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440022',
        owner: admin._id,
        status: PROPERTY_STATUS.PENDING_REVIEW,
        isVerified: false,
        isFeatured: false,
        coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Elevation', isCover: true },
        ],
      },
      {
        title: 'NMRDA Sanctioned 2000 Sq.Ft Plot on Wardha Road (Pending Verification)',
        slug: 'nmrda-sanctioned-plot-wardha-road-nagpur-112',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'PLOT',
        subtype: PROPERTY_SUBTYPES.PLOT,
        description: 'Corner plot with dual road access in emerging gated layout on Wardha Road. RL received, ready for construction.',
        price: 5200000,
        priceUnit: 'Total',
        priceNegotiable: true,
        areaSqFt: 2000,
        areaDisplay: 2000,
        areaUnit: 'Sq.Ft',
        bedrooms: 0,
        bathrooms: 0,
        balconies: 0,
        possessionStatus: 'READY_TO_MOVE',
        facing: 'NORTH',
        amenities: ['Rainwater Harvesting'],
        location: { type: 'Point', coordinates: [79.0628, 21.0664] },
        address: 'Near National Cancer Institute, Wardha Road',
        locality: wardhaRoadDoc?._id,
        localityName: 'Wardha Road',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440025',
        owner: admin._id,
        status: PROPERTY_STATUS.PENDING_REVIEW,
        isVerified: false,
        isFeatured: false,
        coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        images: [
          { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', caption: 'Layout Site Ground', isCover: true },
        ],
      }
    ];

    const seededPropertyDocs = [];
    for (const p of SAMPLE_PROPERTIES) {
      const doc = await Property.findOneAndUpdate({ slug: p.slug }, { $set: p }, { upsert: true, new: true });
      seededPropertyDocs.push(doc);

      // Create Verification document for pending listings
      if (p.status === PROPERTY_STATUS.PENDING_REVIEW) {
        await Verification.findOneAndUpdate(
          { property: doc._id },
          {
            $set: {
              property: doc._id,
              submittedBy: doc.owner,
              status: 'PENDING',
              slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          },
          { upsert: true }
        );
      }
    }

    // 8. Seed Sample CRM Inquiries / Leads
    console.log('[Seed]: Seeding CRM Leads...');
    const SAMPLE_LEADS = [
      {
        customerName: 'Anand Kulkarni',
        phoneNumber: '9823055441',
        email: 'anand.kulkarni@gmail.com',
        property: seededPropertyDocs[0]._id,
        propertyTitle: seededPropertyDocs[0].title,
        propertyOwner: admin._id,
        locality: 'Dharampeth',
        budget: 13500000,
        message: 'Interested in acquiring this 3 BHK flat. Requesting private viewing this weekend.',
        leadSource: LEAD_SOURCE.PROPERTY_ENQUIRY,
        status: LEAD_STATUS.NEW,
        assignedAgent: agent1._id,
      },
      {
        customerName: 'Meenakshi Iyer',
        phoneNumber: '9823066772',
        email: 'meenakshi.iyer@tcs.com',
        property: seededPropertyDocs[2]._id,
        propertyTitle: seededPropertyDocs[2].title,
        propertyOwner: admin._id,
        locality: 'Wardha Road',
        budget: 25000000,
        message: 'Looking for a luxury independent villa near MIHAN. Please share floor plans and title documents.',
        leadSource: LEAD_SOURCE.WHATSAPP_CLICK,
        status: LEAD_STATUS.CONTACTED,
        assignedAgent: agent3._id,
      },
      {
        customerName: 'Dr. Sameer Patil',
        phoneNumber: '9823077883',
        email: 'dr.patil@wockhardt.com',
        property: seededPropertyDocs[5]._id,
        propertyTitle: seededPropertyDocs[5].title,
        propertyOwner: admin._id,
        locality: 'Civil Lines',
        budget: 60000000,
        message: 'High net worth client seeking heritage bungalow in Civil Lines. Ready for direct owner discussion.',
        leadSource: LEAD_SOURCE.PHONE_CALL,
        status: LEAD_STATUS.SITE_VISIT_SCHEDULED,
        assignedAgent: agent2._id,
      },
      {
        customerName: 'Nitin Gadge',
        phoneNumber: '9823088994',
        email: 'nitin.gadge@yahoo.co.in',
        property: seededPropertyDocs[3]._id,
        propertyTitle: seededPropertyDocs[3].title,
        propertyOwner: admin._id,
        locality: 'Besa',
        budget: 4500000,
        message: 'Interested in buying NMRDA plot in Besa for immediate home construction.',
        leadSource: LEAD_SOURCE.PROPERTY_ENQUIRY,
        status: LEAD_STATUS.NEGOTIATION,
        assignedAgent: agent3._id,
      }
    ];

    for (const lead of SAMPLE_LEADS) {
      await Enquiry.findOneAndUpdate(
        { phoneNumber: lead.phoneNumber, property: lead.property },
        { $set: lead },
        { upsert: true }
      );
    }

    // 9. Seed Sample Site Visits
    console.log('[Seed]: Seeding Scheduled Site Visits...');
    const SAMPLE_VISITS = [
      {
        property: seededPropertyDocs[0]._id,
        user: admin._id,
        customerName: 'Anand Kulkarni',
        phoneNumber: '9823055441',
        email: 'anand.kulkarni@gmail.com',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        preferredTimeSlot: '10:00 AM - 12:00 PM',
        assignedAgent: agent1._id,
        status: SITE_VISIT_STATUS.CONFIRMED,
      },
      {
        property: seededPropertyDocs[5]._id,
        user: admin._id,
        customerName: 'Dr. Sameer Patil',
        phoneNumber: '9823077883',
        email: 'dr.patil@wockhardt.com',
        preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        preferredTimeSlot: '04:00 PM - 06:00 PM',
        assignedAgent: agent2._id,
        status: SITE_VISIT_STATUS.REQUESTED,
      }
    ];

    for (const sv of SAMPLE_VISITS) {
      await SiteVisit.findOneAndUpdate(
        { phoneNumber: sv.phoneNumber, property: sv.property },
        { $set: sv },
        { upsert: true }
      );
    }

    // 10. Seed Multilingual Content Pages (Blogs & Guides)
    console.log('[Seed]: Seeding Multilingual Content Pages...');
    const SAMPLE_CONTENT = [
      {
        title: 'Nagpur Metro Line 2 Expansion: Impact on Real Estate Prices',
        slug: 'nagpur-metro-expansion-real-estate-impact',
        category: 'BLOG',
        language: 'en',
        excerpt: 'How the Phase 2 extension of Nagpur Metro is catalyzing property appreciation across Hingna, Kanhan, and MIHAN corridors.',
        content: `Nagpur Metro has revolutionized urban transit across the Orange City. The upcoming Phase 2 expansion connects outlying residential hubs like Kanhan, Hingna, and Butibori directly to the city core. Investors and homebuyers are seeing consistent capital appreciation along the transit corridors.`,
        coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        author: admin._id,
        isPublished: true,
        tags: ['Metro', 'Investment', 'Infrastructure'],
      },
      {
        title: 'नागपूरमधील घरांची खरेदी: रेरा (RERA) आणि 7/12 उतारा तपासणी मार्गदर्शक',
        slug: 'nagpur-home-buying-rera-satbara-guide-mr',
        category: 'LOCALITY_GUIDE',
        language: 'mr',
        excerpt: 'नागपुरात फ्लॅट किंवा प्लॉट खरेदी करताना रेरा क्रमांक आणि ७/१२ सातबारा उतारा कसा तपासावा याविषयी संपूर्ण माहिती.',
        content: `नागपूरमध्ये जमीन किंवा नवीन घर खरेदी करताना महारेरा (MahaRERA) मंजुरी तपासणे अत्यंत महत्त्वाचे आहे. तसेच ग्रामीण व उपनगरांमध्ये एनएमआरडीए (NMRDA) ची मंजुरी आणि ७/१२ सातबारा वरील फेरफार नोंदी काळजीपूर्वक तपासल्या पाहिजेत.`,
        coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        author: admin._id,
        isPublished: true,
        tags: ['RERA', 'Satbara', 'Guide'],
      },
    ];

    for (const c of SAMPLE_CONTENT) {
      await ContentPage.findOneAndUpdate({ slug: c.slug }, { $set: c }, { upsert: true });
    }

    console.log('\n[Seed Completed]: All initial seed data inserted successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
