const Project = require('../models/Project');
const slugify = require('slugify');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get Projects in Nagpur
 */
const getProjects = async (req, res, next) => {
  try {
    const { locality, status, featured, page = 1, limit = 12 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNumber - 1) * pageSize;

    const filter = { isPublished: true };
    if (locality) filter.localityName = { $regex: new RegExp(locality, 'i') };
    if (status) filter.projectStatus = status;
    if (featured === 'true') filter.isFeatured = true;

    const [projects, totalCount] = await Promise.all([
      Project.find(filter)
        .populate('builder', 'name logo website')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Project.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Projects fetched successfully', projects, {
      totalCount,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Project Details by Slug
 */
const getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({ slug }).populate('builder');

    if (!project) {
      return sendError(res, 'Project not found', 'NOT_FOUND', {}, 404);
    }

    return sendSuccess(res, 'Project details retrieved', project);
  } catch (error) {
    next(error);
  }
};

/**
 * Create or Update Project (Admin)
 */
const createOrUpdateProject = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.slug && body.name) {
      body.slug = slugify(body.name, { lower: true, strict: true });
    }

    const project = await Project.findOneAndUpdate(
      { slug: body.slug },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return sendSuccess(res, 'Project saved successfully', project, null, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectBySlug,
  createOrUpdateProject,
};
