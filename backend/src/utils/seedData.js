require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const {
  User,
  AgentProfile,
  Property,
  Locality,
  Project,
  Builder,
  Amenity,
  AppSettings,
  ContentPage,
} = require('../models');
const { ROLES, PROPERTY_STATUS, PROPERTY_PURPOSE, PROPERTY_SUBTYPES } = require('../constants');

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
      overview: 'Home to the High Court of Bombay Nagpur Bench, Vidhan Bhavan, Raj Bhavan, and elite bungalows.',
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
            supportEmail: 'support@nagpurestate.com',
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
        isPhoneVerified: true,
        isEmailVerified: true,
        status: 'ACTIVE',
      });
      console.log(`[Seed]: Super Admin created: ${adminEmail} / Nagpur@Admin2026!`);
    }

    // 5. Seed Nagpur Real Estate Agent
    console.log('[Seed]: Creating Verified Nagpur Real Estate Agent...');
    let agentUser = await User.findOne({ phone: '9822112233' });
    if (!agentUser) {
      agentUser = await User.create({
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

      const agentProfile = await AgentProfile.create({
        user: agentUser._id,
        agencyName: 'Sharma Real Estate Consultants',
        reraNumber: 'A50500001234',
        bio: 'Over 12 years of specialized real estate consultancy in Dharampeth, Ramdaspeth, and Wardha Road corridors.',
        experienceYears: 12,
        areasServed: ['Dharampeth', 'Ramdaspeth', 'Wardha Road', 'Manish Nagar'],
        propertyTypes: ['FLAT', 'HOUSE_VILLA', 'COMMERCIAL_OFFICE'],
        rating: 4.9,
        reviewsCount: 38,
        verificationStatus: 'VERIFIED',
        isAvailable: true,
        contactPhone: '+91 9822112233',
        whatsappNumber: '+91 9822112233',
      });

      agentUser.agentProfile = agentProfile._id;
      await agentUser.save();
    }

    // 6. Seed Sample Live Properties
    console.log('[Seed]: Seeding Verified Properties in Nagpur...');
    const dharampethDoc = await Locality.findOne({ slug: 'dharampeth' });
    const manishNagarDoc = await Locality.findOne({ slug: 'manish-nagar' });
    const wardhaRoadDoc = await Locality.findOne({ slug: 'wardha-road' });
    const besaDoc = await Locality.findOne({ slug: 'besa' });

    const SAMPLE_PROPERTIES = [
      {
        title: 'Luxurious 3 BHK Apartment with Private Balcony in Dharampeth',
        slug: 'luxurious-3-bhk-apartment-in-dharampeth-nagpur-101',
        purpose: PROPERTY_PURPOSE.BUY,
        category: 'RESIDENTIAL',
        subtype: PROPERTY_SUBTYPES.FLAT,
        description: 'Spectacular 3 BHK flat situated in prime Dharampeth. Premium vitrified Italian tile flooring, modular German kitchen, panoramic city views, 2 covered car parkings, and state-of-the-art clubhouse amenities.',
        price: 13500000, // 1.35 Cr
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
        propertyAge: '1-3 years',
        facing: 'EAST',
        amenities: ['24x7 Security & CCTV', '100% Power Backup', 'High Speed Lift', 'Gymnasium & Fitness', 'Reserved Covered Parking'],
        location: { type: 'Point', coordinates: [79.0607, 21.1438] },
        address: 'Near Traffic Park, West High Court Road, Dharampeth',
        locality: dharampethDoc?._id,
        localityName: 'Dharampeth',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440010',
        owner: admin._id,
        assignedAgent: agentUser._id,
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
        price: 5800000, // 58 Lakhs
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
        assignedAgent: agentUser._id,
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
        price: 24500000, // 2.45 Cr
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
        amenities: ['24x7 Security & CCTV', 'Power Backup', 'Club House', 'Swimming Pool', 'Gymnasium & Fitness'],
        location: { type: 'Point', coordinates: [79.0628, 21.0664] },
        address: 'Near AIIMS Campus, Wardha Road',
        locality: wardhaRoadDoc?._id,
        localityName: 'Wardha Road',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440025',
        owner: admin._id,
        assignedAgent: agentUser._id,
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
        price: 4500000, // 45 Lakhs
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
        assignedAgent: agentUser._id,
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
        price: 22000, // 22,000 / month
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
        amenities: ['Power Backup', 'Lift', '24x7 Security & CCTV', 'Car Parking'],
        location: { type: 'Point', coordinates: [79.0831, 21.0922] },
        address: 'Near Somalwada Square, Manish Nagar',
        locality: manishNagarDoc?._id,
        localityName: 'Manish Nagar',
        city: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440015',
        owner: admin._id,
        assignedAgent: agentUser._id,
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
    ];

    for (const p of SAMPLE_PROPERTIES) {
      await Property.findOneAndUpdate({ slug: p.slug }, { $set: p }, { upsert: true });
    }

    // 7. Seed Sample Content Pages (Blogs & Guides)
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
