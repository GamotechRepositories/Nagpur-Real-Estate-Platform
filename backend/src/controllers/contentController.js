const ContentPage = require('../models/ContentPage');
const slugify = require('slugify');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get Content Pages (Blogs, Guides, FAQs)
 */
const getContentPages = async (req, res, next) => {
  try {
    const { category, language = 'en', tag } = req.query;
    const filter = { isPublished: true };

    if (category) filter.category = category.toUpperCase();
    if (language) filter.language = language;
    if (tag) filter.tags = tag;

    const pages = await ContentPage.find(filter)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 'Content pages retrieved', pages);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Content Page by Slug
 */
const getContentBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = await ContentPage.findOne({ slug }).populate('author', 'name avatar');

    if (!page) {
      return sendError(res, 'Content page not found', 'NOT_FOUND', {}, 404);
    }

    return sendSuccess(res, 'Content page retrieved', page);
  } catch (error) {
    next(error);
  }
};

/**
 * Create or Update Content (Admin / Editor)
 */
const upsertContent = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.slug && body.title) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }
    body.author = req.user._id;

    const page = await ContentPage.findOneAndUpdate(
      { slug: body.slug },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return sendSuccess(res, 'Content saved successfully', page, null, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContentPages,
  getContentBySlug,
  upsertContent,
};

