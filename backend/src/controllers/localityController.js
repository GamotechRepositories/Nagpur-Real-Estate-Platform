const Locality = require('../models/Locality');
const Property = require('../models/Property');
const slugify = require('slugify');
const { sendSuccess, sendError } = require('../utils/response');
const { PROPERTY_STATUS } = require('../constants');

/**
 * Get all Nagpur Localities with live property count
 */
const getLocalities = async (req, res, next) => {
  try {
    const { featured, search } = req.query;
    const filter = {};
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { pincode: { $regex: search, $options: 'i' } },
      ];
    }

    const localities = await Locality.find(filter).sort({ isFeatured: -1, name: 1 }).lean();

    // Aggregate live property counts for each locality
    const counts = await Property.aggregate([
      { $match: { status: PROPERTY_STATUS.LIVE } },
      { $group: { _id: '$localityName', count: { $sum: 1 } } },
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id.toLowerCase()] = curr.count;
      return acc;
    }, {});

    const enrichedLocalities = localities.map((loc) => ({
      ...loc,
      propertyCount: countMap[loc.name.toLowerCase()] || 0,
    }));

    return sendSuccess(res, 'Localities fetched successfully', enrichedLocalities);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Locality by Slug with Guide and Overview
 */
const getLocalityBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const locality = await Locality.findOne({ slug });

    if (!locality) {
      return sendError(res, 'Locality not found', 'NOT_FOUND', {}, 404);
    }

    // Dynamic live property count
    const propertyCount = await Property.countDocuments({
      status: PROPERTY_STATUS.LIVE,
      localityName: { $regex: new RegExp(`^${locality.name}$`, 'i') },
    });

    return sendSuccess(res, 'Locality details retrieved', {
      ...locality.toObject(),
      propertyCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or Update Locality (Admin)
 */
const upsertLocality = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.slug && body.name) {
      body.slug = slugify(body.name, { lower: true, strict: true });
    }

    const locality = await Locality.findOneAndUpdate(
      { slug: body.slug },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return sendSuccess(res, 'Locality saved successfully', locality, null, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocalities,
  getLocalityBySlug,
  upsertLocality,
};
