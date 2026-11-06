const Property = require('../models/Property');
const PropertyMedia = require('../models/PropertyMedia');
const Locality = require('../models/Locality');
const Verification = require('../models/Verification');
const SavedProperty = require('../models/SavedProperty');
const slugify = require('slugify');
const { sendSuccess, sendError } = require('../utils/response');
const { PROPERTY_STATUS, ROLES } = require('../constants');
const { logAudit } = require('../services/auditService');

/**
 * Public Property Search with Compound Filters, GeoJSON Radius, and Sorting
 */
const getProperties = async (req, res, next) => {
  try {
    const {
      purpose,
      category,
      subtype,
      locality,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      furnishing,
      possessionStatus,
      isVerified,
      isFeatured,
      search,
      lat,
      lng,
      radiusKm,
      sort = 'latest',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNumber - 1) * pageSize;

    // Base query: Only LIVE properties appear on public search
    const filter = { status: PROPERTY_STATUS.LIVE };

    if (purpose) filter.purpose = purpose.toUpperCase();
    if (category) filter.category = category.toUpperCase();
    if (subtype) filter.subtype = subtype.toUpperCase();
    if (furnishing) filter.furnishing = furnishing.toUpperCase();
    if (possessionStatus) filter.possessionStatus = possessionStatus.toUpperCase();
    if (isVerified === 'true') filter.isVerified = true;
    if (isFeatured === 'true') filter.isFeatured = true;

    // Locality filter
    if (locality) {
      filter.localityName = { $regex: new RegExp(locality.trim(), 'i') };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Area range
    if (minArea || maxArea) {
      filter.areaSqFt = {};
      if (minArea) filter.areaSqFt.$gte = Number(minArea);
      if (maxArea) filter.areaSqFt.$lte = Number(maxArea);
    }

    // Bedrooms (BHK)
    if (bedrooms) {
      const bhkList = bedrooms.toString().split(',').map((b) => parseInt(b.trim(), 10)).filter((n) => !isNaN(n));
      if (bhkList.length === 1) {
        filter.bedrooms = bhkList[0] >= 5 ? { $gte: 5 } : bhkList[0];
      } else if (bhkList.length > 1) {
        filter.bedrooms = { $in: bhkList };
      }
    }

    if (bathrooms) {
      filter.bathrooms = { $gte: parseInt(bathrooms, 10) };
    }

    // Text search on title/address/locality
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { localityName: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Geospatial Radius Search if coordinates provided
    if (lat && lng) {
      const radiusInMeters = (parseFloat(radiusKm) || 5) * 1000;
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)], // [longitude, latitude]
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    // Sorting definition
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'area_asc') sortOption = { areaSqFt: 1 };
    else if (sort === 'area_desc') sortOption = { areaSqFt: -1 };
    else if (sort === 'featured') sortOption = { isFeatured: -1, createdAt: -1 };

    // Execute query with pagination
    const [properties, totalCount] = await Promise.all([
      Property.find(filter)
        .populate('owner', 'name phone avatar')
        .populate('assignedAgent', 'name phone avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Property.countDocuments(filter),
    ]);

    // Check saved status if user is logged in
    let savedPropertyIds = new Set();
    if (req.user) {
      const saved = await SavedProperty.find({ user: req.user._id }).select('property');
      savedPropertyIds = new Set(saved.map((s) => s.property.toString()));
    }

    const formattedProperties = properties.map((prop) => ({
      ...prop,
      isSaved: savedPropertyIds.has(prop._id.toString()),
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return sendSuccess(res, 'Properties fetched successfully', formattedProperties, {
      totalCount,
      page: pageNumber,
      pageSize,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Property Details by Slug with View Increment
 */
const getPropertyBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const property = await Property.findOne({ slug })
      .populate('owner', 'name phone email avatar role')
      .populate('assignedAgent', 'name phone email avatar agentProfile')
      .populate('locality')
      .populate('project');

    if (!property) {
      return sendError(res, 'Property listing not found', 'NOT_FOUND', {}, 404);
    }

    // Only creator/staff can view non-live properties
    if (property.status !== PROPERTY_STATUS.LIVE) {
      const isOwner = req.user && req.user._id.toString() === property.owner._id.toString();
      const isStaff = req.user && [ROLES.SUPER_ADMIN, ROLES.MODERATOR, ROLES.CRM_MANAGER].includes(req.user.role);

      if (!isOwner && !isStaff) {
        return sendError(res, 'This property listing is currently not available to the public', 'FORBIDDEN', {}, 403);
      }
    }

    // Increment view count asynchronously
    Property.findByIdAndUpdate(property._id, { $inc: { viewsCount: 1 } }).exec();

    // Check if saved by current user
    let isSaved = false;
    if (req.user) {
      const saved = await SavedProperty.findOne({ user: req.user._id, property: property._id });
      isSaved = Boolean(saved);
    }

    return sendSuccess(res, 'Property details retrieved', {
      ...property.toObject(),
      isSaved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Similar Properties in Nagpur
 */
const getSimilarProperties = async (req, res, next) => {
  try {
    const { id } = req.params;
    const current = await Property.findById(id);

    if (!current) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    const minPrice = current.price * 0.7;
    const maxPrice = current.price * 1.3;

    const similar = await Property.find({
      _id: { $ne: current._id },
      status: PROPERTY_STATUS.LIVE,
      purpose: current.purpose,
      $or: [
        { localityName: current.localityName },
        { subtype: current.subtype, price: { $gte: minPrice, $lte: maxPrice } },
      ],
    })
      .limit(4)
      .lean();

    return sendSuccess(res, 'Similar properties fetched', similar);
  } catch (error) {
    next(error);
  }
};

/**
 * Create New Property Listing (Multi-Step Wizard Submission)
 */
const createProperty = async (req, res, next) => {
  try {
    const body = req.body;
    const isSaveAsDraft = req.query.draft === 'true';

    // Unique slug generator
    const baseSlug = slugify(`${body.title} in ${body.localityName} nagpur`, { lower: true, strict: true });
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    // Resolve Locality reference if exists
    let localityDoc = await Locality.findOne({
      name: { $regex: new RegExp(`^${body.localityName.trim()}$`, 'i') },
    });

    const status = isSaveAsDraft ? PROPERTY_STATUS.DRAFT : PROPERTY_STATUS.PENDING_REVIEW;

    const property = await Property.create({
      ...body,
      slug,
      locality: localityDoc ? localityDoc._id : undefined,
      owner: req.user._id,
      status,
      location: {
        type: 'Point',
        coordinates: [body.longitude, body.latitude], // [longitude, latitude]
      },
      coverImage: body.images && body.images.length > 0 ? body.images[0].url : '',
    });

    // If submitted for review, create verification entry for moderators
    if (status === PROPERTY_STATUS.PENDING_REVIEW) {
      const slaHours = 24; // 24-hour review SLA
      await Verification.create({
        property: property._id,
        status: 'PENDING',
        slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000),
      });
    }

    await logAudit({
      req,
      action: isSaveAsDraft ? 'CREATE_DRAFT_PROPERTY' : 'SUBMIT_PROPERTY_FOR_REVIEW',
      targetType: 'PROPERTY',
      targetId: property._id,
      notes: `Property titled "${property.title}" posted with status ${status}`,
    });

    return sendSuccess(
      res,
      isSaveAsDraft ? 'Property draft saved successfully' : 'Property submitted for admin verification',
      property,
      null,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update Property Listing
 */
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isStaff = [ROLES.SUPER_ADMIN, ROLES.MODERATOR].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return sendError(res, 'Unauthorized to edit this property listing', 'FORBIDDEN', {}, 403);
    }

    // If owner edits a rejected listing, set status back to PENDING_REVIEW for re-moderation
    if (isOwner && property.status === PROPERTY_STATUS.REJECTED) {
      req.body.status = PROPERTY_STATUS.PENDING_REVIEW;
      req.body.rejectionReason = '';

      await Verification.create({
        property: property._id,
        status: 'PENDING',
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    // Update location coordinates if provided
    if (req.body.longitude && req.body.latitude) {
      property.location = {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude],
      };
    }

    Object.assign(property, req.body);
    await property.save();

    await logAudit({
      req,
      action: 'UPDATE_PROPERTY',
      targetType: 'PROPERTY',
      targetId: property._id,
      notes: `Property ID ${property._id} updated by ${req.user.name}`,
    });

    return sendSuccess(res, 'Property listing updated successfully', property);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload and Attach Media
 */
const uploadPropertyMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isStaff = [ROLES.SUPER_ADMIN, ROLES.MODERATOR].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return sendError(res, 'Unauthorized to upload media for this property', 'FORBIDDEN', {}, 403);
    }

    if (!req.file && (!req.files || req.files.length === 0)) {
      return sendError(res, 'No files uploaded', 'FILE_MISSING', {}, 400);
    }

    const uploadedFiles = req.files || [req.file];
    const newMediaItems = [];

    for (const file of uploadedFiles) {
      const relativeUrl = `/uploads/${file.filename}`;
      const mediaItem = await PropertyMedia.create({
        property: property._id,
        url: relativeUrl,
        mediaType: file.mimetype.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
        title: file.originalname,
        isCover: property.images.length === 0,
      });

      property.images.push({
        url: relativeUrl,
        caption: file.originalname,
        isCover: property.images.length === 0,
      });

      if (!property.coverImage) {
        property.coverImage = relativeUrl;
      }

      newMediaItems.push(mediaItem);
    }

    await property.save();

    return sendSuccess(res, 'Media files uploaded and attached successfully', newMediaItems, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Property Sold or Rented (Owner or Admin)
 */
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedTransitions = [PROPERTY_STATUS.SOLD, PROPERTY_STATUS.RENTED, PROPERTY_STATUS.ARCHIVED];
    if (!allowedTransitions.includes(status)) {
      return sendError(res, 'Invalid status transition', 'INVALID_STATUS', {}, 400);
    }

    const property = await Property.findById(id);
    if (!property) {
      return sendError(res, 'Property not found', 'NOT_FOUND', {}, 404);
    }

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isStaff = [ROLES.SUPER_ADMIN, ROLES.MODERATOR].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return sendError(res, 'Unauthorized to change status of this property', 'FORBIDDEN', {}, 403);
    }

    property.status = status;
    await property.save();

    await logAudit({
      req,
      action: `SET_STATUS_${status}`,
      targetType: 'PROPERTY',
      targetId: property._id,
      notes: `Status changed to ${status}`,
    });

    return sendSuccess(res, `Property marked as ${status}`, property);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyBySlug,
  getSimilarProperties,
  createProperty,
  updateProperty,
  uploadPropertyMedia,
  updatePropertyStatus,
};

