const SavedProperty = require('../models/SavedProperty');
const SavedSearch = require('../models/SavedSearch');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get User Saved Properties
 */
const getSavedProperties = async (req, res, next) => {
  try {
    const saved = await SavedProperty.find({ user: req.user._id })
      .populate('property')
      .sort({ createdAt: -1 });

    const properties = saved.map((s) => s.property).filter(Boolean);

    return sendSuccess(res, 'Saved properties retrieved', properties);
  } catch (error) {
    next(error);
  }
};

/**
 * Save Property
 */
const saveProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const existing = await SavedProperty.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existing) {
      return sendSuccess(res, 'Property is already in your saved list', existing);
    }

    const saved = await SavedProperty.create({
      user: req.user._id,
      property: propertyId,
    });

    return sendSuccess(res, 'Property saved to wishlist', saved, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Saved Property
 */
const removeSavedProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    await SavedProperty.findOneAndDelete({
      user: req.user._id,
      property: propertyId,
    });

    return sendSuccess(res, 'Property removed from saved wishlist');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Saved Searches
 */
const getSavedSearches = async (req, res, next) => {
  try {
    const searches = await SavedSearch.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Saved searches retrieved', searches);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Saved Search Alert
 */
const createSavedSearch = async (req, res, next) => {
  try {
    const { title, filters, alertFrequency } = req.body;
    const search = await SavedSearch.create({
      user: req.user._id,
      title: title || 'Custom Property Alert',
      filters,
      alertFrequency: alertFrequency || 'DAILY',
    });

    return sendSuccess(res, 'Search alert saved successfully', search, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Saved Search
 */
const deleteSavedSearch = async (req, res, next) => {
  try {
    const { id } = req.params;
    await SavedSearch.findOneAndDelete({ _id: id, user: req.user._id });
    return sendSuccess(res, 'Saved search deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavedProperties,
  saveProperty,
  removeSavedProperty,
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
};

