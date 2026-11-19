const mongoose = require('mongoose');
const slugify = require('slugify');
const Builder = require('../models/Builder');
const Project = require('../models/Project');
const Property = require('../models/Property');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const Verification = require('../models/Verification');
const { sendSuccess, sendError } = require('../utils/response');
const { PROPERTY_STATUS, ROLES } = require('../constants');
const { logAudit } = require('../services/auditService');

// Property category / type helpers
const isRent = (l) => {
  const p = (l?.purpose || '').toUpperCase();
  return p.includes('RENT') || p.includes('LEASE');
};

const isBuySale = (l) => {
  const p = (l?.purpose || '').toUpperCase();
  return p.includes('BUY') || p.includes('SALE') || (!p.includes('RENT') && !p.includes('LEASE'));
};

const isPlot = (l) => {
  const cat = (l?.category || '').toUpperCase();
  const sub = (l?.subtype || '').toUpperCase();
  const title = (l?.title || '').toUpperCase();
  return (
    cat === 'PLOT' ||
    cat === 'AGRICULTURAL' ||
    cat.includes('LAND') ||
    sub.includes('PLOT') ||
    sub.includes('LAND') ||
    title.includes('PLOT') ||
    title.includes('LAND') ||
    title.includes('LAYOUT')
  );
};

const isCommercial = (l) => {
  const cat = (l?.category || '').toUpperCase();
  const sub = (l?.subtype || '').toUpperCase();
  const title = (l?.title || '').toUpperCase();
  return (
    cat.includes('COMMERCIAL') ||
    sub.includes('COMMERCIAL') ||
    sub.includes('OFFICE') ||
    sub.includes('SHOP') ||
    sub.includes('RETAIL') ||
    sub.includes('WAREHOUSE') ||
    title.includes('COMMERCIAL') ||
    title.includes('OFFICE') ||
    title.includes('SHOP')
  );
};

const isVilla = (l) => {
  const sub = (l?.subtype || '').toUpperCase();
  const title = (l?.title || '').toUpperCase();
  if (sub.includes('PENTHOUSE') || title.includes('PENTHOUSE')) return false;
  return (
    sub.includes('VILLA') ||
    sub.includes('HOUSE_VILLA') ||
    sub.includes('BUNGALOW') ||
    title.includes('VILLA') ||
    title.includes('BUNGALOW') ||
    title.includes('INDEPENDENT HOUSE') ||
    title.includes('ROW HOUSE')
  );
};

const isApartment = (l) => {
  if (isPlot(l) || isCommercial(l) || isVilla(l)) return false;
  const cat = (l?.category || '').toUpperCase();
  const sub = (l?.subtype || '').toUpperCase();
  const title = (l?.title || '').toUpperCase();
  return (
    sub.includes('FLAT') ||
    sub.includes('APARTMENT') ||
    sub.includes('PENTHOUSE') ||
    cat === 'RESIDENTIAL' ||
    title.includes('FLAT') ||
    title.includes('APARTMENT') ||
    title.includes('PENTHOUSE') ||
    title.includes('BHK') ||
    Number(l?.bedrooms) > 0
  );
};

/**
 * Get List of Builders / Developers (Admin & Public)
 */
const getBuilders = async (req, res, next) => {
  try {
    const { search, city } = req.query;
    const filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { contactPerson: { $regex: search.trim(), $options: 'i' } },
        { reraNumber: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (city) {
      filter.operatingCities = { $regex: new RegExp(city, 'i') };
    }

    const builders = await Builder.find(filter)
      .populate('user', 'name phone email avatar status lastLoginAt')
      .sort({ createdAt: -1 });

    // Attach dynamic project count and listings count for each builder
    const enrichedBuilders = await Promise.all(
      builders.map(async (b) => {
        const bObj = b.toObject();
        const projectQuery = {
          $or: [
            { builder: b._id },
            { builderUser: b.user?._id || b.user },
            { builderName: new RegExp(`^${b.name.trim()}$`, 'i') },
          ],
        };
        const projects = await Project.find(projectQuery).select('_id');
        const projectIds = projects.map((p) => p._id);

        const propertyQuery = {
          $or: [
            { owner: b.user?._id || b.user },
            { project: { $in: projectIds } },
          ],
        };

        const [totalProjectsCount, totalListingsCount] = await Promise.all([
          Project.countDocuments(projectQuery),
          Property.countDocuments(propertyQuery),
        ]);

        bObj.dynamicTotalProjects = totalProjectsCount;
        bObj.dynamicTotalListings = totalListingsCount;
        return bObj;
      })
    );

    return sendSuccess(res, 'Builders fetched successfully', enrichedBuilders);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Builder Details by ID with Projects, Units, and Leads
 */
const getBuilderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const builder = await Builder.findOne({
      $or: [{ _id: id }, { user: id }, { slug: id }],
    }).populate('user', 'name phone email avatar status createdAt lastLoginAt');

    if (!builder) {
      return sendError(res, 'Builder profile not found', 'NOT_FOUND', {}, 404);
    }

    const userId = builder.user?._id || builder.user;

    // Fetch Builder's Projects
    const projectFilter = {
      $or: [
        { builder: builder._id },
        { builderUser: userId },
        { builderName: new RegExp(`^${builder.name.trim()}$`, 'i') },
      ],
    };
    const projects = await Project.find(projectFilter).sort({ createdAt: -1 }).lean();
    const projectIds = projects.map((p) => p._id);

    // Fetch Builder's Listings / Units
    const propertyFilter = {
      $or: [
        { owner: userId },
        { project: { $in: projectIds } },
      ],
    };

    const listings = await Property.find(propertyFilter)
      .populate('project', 'name slug localityName reraNumber projectStatus')
      .populate('assignedAgent', 'name phone email avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch Inquiries / Leads for builder properties
    const propertyIds = listings.map((l) => l._id);
    let leads = [];
    if (propertyIds.length > 0) {
      leads = await Enquiry.find({ property: { $in: propertyIds } })
        .populate('property', 'title price localityName coverImage')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    }

    // Classify Listings
    const classification = {
      apartments: listings.filter(isApartment),
      commercial: listings.filter(isCommercial),
      plots: listings.filter(isPlot),
      villas: listings.filter(isVilla),
      forSale: listings.filter(isBuySale),
      forRent: listings.filter(isRent),
      live: listings.filter((l) => l.status === PROPERTY_STATUS.LIVE),
      underModeration: listings.filter((l) => l.status === PROPERTY_STATUS.PENDING_REVIEW),
      soldOrClosed: listings.filter((l) => l.status === PROPERTY_STATUS.SOLD || l.status === PROPERTY_STATUS.RENTED),
    };

    const totalPortfolioValue = listings.reduce((sum, l) => sum + (Number(l.price) || 0), 0);
    const totalViews = listings.reduce((sum, l) => sum + (Number(l.viewsCount) || 0), 0);

    return sendSuccess(res, 'Builder details retrieved', {
      profile: builder,
      projects,
      listings,
      leads,
      metrics: {
        totalProjects: projects.length,
        totalListings: listings.length,
        apartmentsCount: classification.apartments.length,
        commercialCount: classification.commercial.length,
        plotsCount: classification.plots.length,
        villasCount: classification.villas.length,
        forSaleCount: classification.forSale.length,
        forRentCount: classification.forRent.length,
        liveCount: classification.live.length,
        pendingReviewCount: classification.underModeration.length,
        soldCount: classification.soldOrClosed.length,
        totalPortfolioValue,
        totalViews,
        leadsCount: leads.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Onboard / Create New Builder
 */
const createBuilderByAdmin = async (req, res, next) => {
  try {
    const {
      name, // Company Name e.g. "Godrej Properties"
      contactPerson, // Person Name e.g. "Vikram Malhotra"
      phone,
      email,
      password,
      avatar,
      logo,
      coverImage,
      reraNumber,
      establishedYear,
      experienceYears = 5,
      address = 'Nagpur, Maharashtra',
      website = '',
      description = '',
      operatingCities = ['Nagpur'],
    } = req.body;

    if (!name || !phone) {
      return sendError(res, 'Company name and phone number are required', 'VALIDATION_ERROR', {}, 400);
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : undefined;

    // 1. Find or create User with role BUILDER
    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      user = await User.create({
        name: contactPerson ? contactPerson.trim() : cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password: password ? password.trim() : 'Nagpur@Builder2026!',
        avatar: avatar ? avatar.trim() : (logo ? logo.trim() : ''),
        role: ROLES.BUILDER,
        status: 'ACTIVE',
        isPhoneVerified: true,
      });
    } else {
      user.role = ROLES.BUILDER;
      if (contactPerson) user.name = contactPerson.trim();
      if (cleanEmail && !user.email) user.email = cleanEmail;
      if (password && password.trim()) user.password = password.trim();
      if (avatar || logo) user.avatar = (avatar || logo).trim();
      user.status = 'ACTIVE';
      await user.save();
    }

    // 2. Slug generation
    const baseSlug = slugify(cleanName, { lower: true, strict: true });
    let slug = baseSlug;
    const existingSlug = await Builder.findOne({ slug });
    if (existingSlug && String(existingSlug.user) !== String(user._id)) {
      slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 3. Find or create Builder Profile
    let builder = await Builder.findOne({
      $or: [{ user: user._id }, { name: cleanName }],
    });

    if (!builder) {
      builder = new Builder({
        user: user._id,
        name: cleanName,
        slug,
        contactPerson: contactPerson ? contactPerson.trim() : user.name,
        contactPhone: cleanPhone,
        contactEmail: cleanEmail,
        reraNumber: reraNumber ? reraNumber.trim() : '',
        establishedYear: establishedYear ? Number(establishedYear) : undefined,
        experienceYears: Number(experienceYears) || 5,
        address: address ? address.trim() : '',
        website: website ? website.trim() : '',
        logo: logo ? logo.trim() : '',
        coverImage: coverImage ? coverImage.trim() : '',
        description: description ? description.trim() : '',
        operatingCities: Array.isArray(operatingCities) ? operatingCities : ['Nagpur'],
        verificationStatus: 'VERIFIED',
        isActive: true,
        isAvailable: true,
      });
    } else {
      builder.user = user._id;
      builder.name = cleanName;
      if (contactPerson) builder.contactPerson = contactPerson.trim();
      builder.contactPhone = cleanPhone;
      if (cleanEmail) builder.contactEmail = cleanEmail;
      if (reraNumber) builder.reraNumber = reraNumber.trim();
      if (establishedYear) builder.establishedYear = Number(establishedYear);
      if (experienceYears) builder.experienceYears = Number(experienceYears);
      if (address) builder.address = address.trim();
      if (website) builder.website = website.trim();
      if (logo) builder.logo = logo.trim();
      if (coverImage) builder.coverImage = coverImage.trim();
      if (description) builder.description = description.trim();
      builder.verificationStatus = 'VERIFIED';
      builder.isActive = true;
    }

    await builder.save();

    // Link user to builderProfile
    user.builderProfile = builder._id;
    await user.save();

    await logAudit({
      req,
      action: 'ONBOARD_BUILDER',
      targetType: 'BUILDER',
      targetId: builder._id,
      notes: `Builder "${cleanName}" onboarded with RERA: ${reraNumber || 'N/A'}`,
    });

    const populated = await Builder.findById(builder._id).populate('user', 'name phone email avatar status');
    return sendSuccess(res, 'Builder onboarded and verified successfully', populated, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Builder Profile & Password
 */
const updateBuilderByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      contactPerson,
      phone,
      email,
      password,
      avatar,
      logo,
      coverImage,
      reraNumber,
      establishedYear,
      experienceYears,
      address,
      website,
      description,
      status,
      verificationStatus,
      isActive,
      isAvailable,
    } = req.body;

    const builder = await Builder.findOne({
      $or: [{ _id: id }, { user: id }],
    }).populate('user');

    if (!builder) {
      return sendError(res, 'Builder profile not found', 'NOT_FOUND', {}, 404);
    }

    // Update User model
    const userId = builder.user?._id || builder.user;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        if (contactPerson && contactPerson.trim()) user.name = contactPerson.trim();
        else if (name && name.trim() && !user.name) user.name = name.trim();

        if (phone && phone.trim()) {
          const cleanPhone = phone.trim();
          if (cleanPhone !== user.phone) {
            const existingPhone = await User.findOne({
              phone: cleanPhone,
              _id: { $ne: user._id },
            });
            if (existingPhone) {
              return sendError(res, 'Phone number already registered with another account', 'DUPLICATE_PHONE', {}, 409);
            }
            user.phone = cleanPhone;
          }
        }

        if (email !== undefined) {
          const cleanEmail = email ? email.trim().toLowerCase() : '';
          if (cleanEmail && cleanEmail !== user.email) {
            const existingEmail = await User.findOne({
              email: cleanEmail,
              _id: { $ne: user._id },
            });
            if (existingEmail) {
              return sendError(res, 'Email already registered with another account', 'DUPLICATE_EMAIL', {}, 409);
            }
            user.email = cleanEmail;
          } else if (!cleanEmail) {
            user.email = undefined;
          }
        }

        if (password && password.trim()) {
          user.password = password.trim();
        }

        if (avatar && avatar.trim()) user.avatar = avatar.trim();
        else if (logo && logo.trim()) user.avatar = logo.trim();

        if (status && ['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
          user.status = status;
        }

        await user.save();
      }
    }

    // Update Builder fields
    if (name !== undefined && name.trim()) builder.name = name.trim();
    if (contactPerson !== undefined) builder.contactPerson = contactPerson.trim();
    if (phone !== undefined) builder.contactPhone = phone.trim();
    if (email !== undefined) builder.contactEmail = email.trim();
    if (reraNumber !== undefined) builder.reraNumber = reraNumber.trim();
    if (establishedYear !== undefined) builder.establishedYear = Number(establishedYear);
    if (experienceYears !== undefined) builder.experienceYears = Number(experienceYears);
    if (address !== undefined) builder.address = address.trim();
    if (website !== undefined) builder.website = website.trim();
    if (logo !== undefined) builder.logo = logo.trim();
    if (coverImage !== undefined) builder.coverImage = coverImage.trim();
    if (description !== undefined) builder.description = description.trim();
    if (verificationStatus !== undefined) builder.verificationStatus = verificationStatus;
    if (isActive !== undefined) builder.isActive = isActive;
    if (isAvailable !== undefined) builder.isAvailable = isAvailable;

    await builder.save();

    const populated = await Builder.findById(builder._id).populate('user', 'name phone email avatar status');
    return sendSuccess(res, 'Builder updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Partner Portal (Builder): Get Workspace Stats
 */
const getMyBuilderStats = async (req, res, next) => {
  try {
    const builder = await Builder.findOne({ user: req.user._id });
    const userId = req.user._id;

    const projectFilter = builder
      ? {
          $or: [
            { builder: builder._id },
            { builderUser: userId },
            { builderName: new RegExp(`^${builder.name.trim()}$`, 'i') },
          ],
        }
      : { builderUser: userId };

    const projects = await Project.find(projectFilter).lean();
    const projectIds = projects.map((p) => p._id);

    const propertyFilter = {
      $or: [
        { owner: userId },
        { project: { $in: projectIds } },
      ],
    };

    const listings = await Property.find(propertyFilter).lean();
    const propertyIds = listings.map((l) => l._id);

    let leadsCount = 0;
    if (propertyIds.length > 0) {
      leadsCount = await Enquiry.countDocuments({ property: { $in: propertyIds } });
    }

    const liveCount = listings.filter((l) => l.status === PROPERTY_STATUS.LIVE).length;
    const pendingReviewCount = listings.filter((l) => l.status === PROPERTY_STATUS.PENDING_REVIEW).length;
    const soldCount = listings.filter((l) => l.status === PROPERTY_STATUS.SOLD || l.status === PROPERTY_STATUS.RENTED).length;
    const totalViews = listings.reduce((sum, l) => sum + (Number(l.viewsCount) || 0), 0);
    const totalPortfolioValue = listings.reduce((sum, l) => sum + (Number(l.price) || 0), 0);

    return sendSuccess(res, 'Builder workspace stats retrieved', {
      totalProjects: projects.length,
      totalInventory: listings.length,
      liveCount,
      pendingReviewCount,
      soldCount,
      leadsCount,
      totalViews,
      totalPortfolioValue,
      builderProfile: builder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Partner Portal (Builder): Get My Projects
 */
const getMyProjects = async (req, res, next) => {
  try {
    const builder = await Builder.findOne({ user: req.user._id });
    const userId = req.user._id;

    const projectFilter = builder
      ? {
          $or: [
            { builder: builder._id },
            { builderUser: userId },
            { builderName: new RegExp(`^${builder.name.trim()}$`, 'i') },
          ],
        }
      : { builderUser: userId };

    const projects = await Project.find(projectFilter).sort({ createdAt: -1 }).lean();

    // Attach unit count for each project
    const enrichedProjects = await Promise.all(
      projects.map(async (p) => {
        const unitCount = await Property.countDocuments({ project: p._id });
        const liveUnitCount = await Property.countDocuments({ project: p._id, status: PROPERTY_STATUS.LIVE });
        return {
          ...p,
          totalUnitsPosted: unitCount,
          liveUnitsPosted: liveUnitCount,
        };
      })
    );

    return sendSuccess(res, 'Builder projects retrieved', enrichedProjects);
  } catch (error) {
    next(error);
  }
};

/**
 * Partner Portal (Builder): Create Project
 */
const createMyProject = async (req, res, next) => {
  try {
    const body = req.body;
    let builder = await Builder.findOne({ user: req.user._id });

    if (!builder) {
      // Auto-create minimal builder profile if not existing
      const baseSlug = slugify(req.user.name || 'Builder', { lower: true, strict: true });
      builder = await Builder.create({
        user: req.user._id,
        name: body.builderName || req.user.name || 'Developer Partner',
        slug: `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
        contactPhone: req.user.phone,
        contactEmail: req.user.email,
        reraNumber: body.reraNumber || '',
        verificationStatus: 'VERIFIED',
      });
      req.user.builderProfile = builder._id;
      await req.user.save();
    }

    if (!body.name) {
      return sendError(res, 'Project name is required', 'VALIDATION_ERROR', {}, 400);
    }

    const baseSlug = slugify(body.name, { lower: true, strict: true });
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const project = await Project.create({
      ...body,
      slug,
      builder: builder._id,
      builderUser: req.user._id,
      builderName: builder.name,
      reraNumber: body.reraNumber ? body.reraNumber.trim() : builder.reraNumber,
      isPublished: true,
      location: {
        type: 'Point',
        coordinates: [Number(body.longitude) || 79.0882, Number(body.latitude) || 21.1458],
      },
    });

    // Update builder projects count
    const totalProjects = await Project.countDocuments({ builder: builder._id });
    builder.totalProjects = totalProjects;
    await builder.save();

    await logAudit({
      req,
      action: 'BUILDER_CREATE_PROJECT',
      targetType: 'PROJECT',
      targetId: project._id,
      notes: `Project "${project.name}" created by builder "${builder.name}"`,
    });

    return sendSuccess(res, 'Project added successfully', project, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Partner Portal (Builder): Get My Listings / Units
 */
const getMyProperties = async (req, res, next) => {
  try {
    const builder = await Builder.findOne({ user: req.user._id });
    const userId = req.user._id;

    let projectIds = [];
    if (builder) {
      const projects = await Project.find({
        $or: [
          { builder: builder._id },
          { builderUser: userId },
          { builderName: new RegExp(`^${builder.name.trim()}$`, 'i') },
        ],
      }).select('_id');
      projectIds = projects.map((p) => p._id);
    }

    const propertyFilter = {
      $or: [
        { owner: userId },
        ...(projectIds.length > 0 ? [{ project: { $in: projectIds } }] : []),
      ],
    };

    const properties = await Property.find(propertyFilter)
      .populate('project', 'name slug localityName reraNumber projectStatus')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 'Builder properties retrieved', properties);
  } catch (error) {
    next(error);
  }
};

/**
 * Partner Portal (Builder): Create Property Unit Under Project (Goes to Admin Moderation)
 */
const createMyPropertyUnit = async (req, res, next) => {
  try {
    const body = req.body;
    const builder = await Builder.findOne({ user: req.user._id });

    if (!body.title || !body.localityName) {
      return sendError(res, 'Title and locality are required', 'VALIDATION_ERROR', {}, 400);
    }

    const baseSlug = slugify(`${body.title} in ${body.localityName} nagpur`, { lower: true, strict: true });
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const projectId = body.project && mongoose.Types.ObjectId.isValid(body.project) ? body.project : undefined;

    // Builder listings MUST go to admin moderation as PENDING_REVIEW
    const status = PROPERTY_STATUS.PENDING_REVIEW;

    const property = await Property.create({
      ...body,
      slug,
      project: projectId,
      owner: req.user._id,
      status,
      location: {
        type: 'Point',
        coordinates: [Number(body.longitude) || 79.0882, Number(body.latitude) || 21.1458],
      },
      coverImage: body.images && body.images.length > 0 ? body.images[0].url : '',
    });

    // Create Verification record for Admin Moderation Queue
    const slaHours = 24;
    await Verification.create({
      property: property._id,
      status: 'PENDING',
      slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000),
    });

    await logAudit({
      req,
      action: 'BUILDER_POST_UNIT_FOR_REVIEW',
      targetType: 'PROPERTY',
      targetId: property._id,
      notes: `Builder unit "${property.title}" posted and submitted to admin moderation queue`,
    });

    return sendSuccess(res, 'Property unit submitted for admin verification', property, null, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBuilders,
  getBuilderById,
  createBuilderByAdmin,
  updateBuilderByAdmin,
  getMyBuilderStats,
  getMyProjects,
  createMyProject,
  getMyProperties,
  createMyPropertyUnit,
};
