const mongoose = require('mongoose');
const Project = require('../models/Project');
const Property = require('../models/Property');
const Builder = require('../models/Builder');
const slugify = require('slugify');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get Projects in Nagpur (with real-time property inventory counts)
 */
const getProjects = async (req, res, next) => {
  try {
    const { locality, status, featured, all, page = 1, limit = 50 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNumber - 1) * pageSize;

    const filter = {};
    if (all !== 'true') {
      filter.isPublished = true;
    }
    if (locality) filter.localityName = { $regex: new RegExp(locality, 'i') };
    if (status) filter.projectStatus = status;
    if (featured === 'true') filter.isFeatured = true;

    const [projects, totalCount] = await Promise.all([
      Project.find(filter)
        .populate('builder', 'name logo website contactPerson contactPhone')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Project.countDocuments(filter),
    ]);

    // Attach inventory counts to each project
    const enrichedProjects = await Promise.all(
      projects.map(async (p) => {
        const unitCount = await Property.countDocuments({ project: p._id });
        const liveUnitCount = await Property.countDocuments({ project: p._id, status: 'LIVE' });
        return {
          ...p,
          totalUnitsPosted: unitCount,
          liveUnitsPosted: liveUnitCount,
        };
      })
    );

    return sendSuccess(res, 'Projects fetched successfully', enrichedProjects, {
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
 * Get Project Details by ID or Slug (including all linked property units)
 */
const getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const isId = mongoose.Types.ObjectId.isValid(slug);
    const query = isId ? { $or: [{ _id: slug }, { slug }] } : { slug };

    const project = await Project.findOne(query).populate('builder');

    if (!project) {
      return sendError(res, 'Project not found', 'NOT_FOUND', {}, 404);
    }

    // Fetch all properties/units belonging to this project
    const properties = await Property.find({ project: project._id })
      .populate('owner', 'name phone email role')
      .populate('assignedAgent', 'name phone email avatar')
      .populate('assignedAgents', 'name phone email avatar')
      .sort({ createdAt: -1 })
      .lean();

    const projectObj = project.toObject();
    projectObj.properties = properties;
    projectObj.totalUnitsPosted = properties.length;
    projectObj.liveUnitsPosted = properties.filter((p) => p.status === 'LIVE').length;
    projectObj.pendingUnitsPosted = properties.filter((p) => p.status === 'PENDING_REVIEW').length;
    projectObj.soldUnitsPosted = properties.filter((p) => p.status === 'SOLD').length;

    return sendSuccess(res, 'Project details and properties retrieved successfully', projectObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Properties under a Specific Project
 */
const getProjectProperties = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isId = mongoose.Types.ObjectId.isValid(id);
    const query = isId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };

    const project = await Project.findOne(query);
    if (!project) {
      return sendError(res, 'Project not found', 'NOT_FOUND', {}, 404);
    }

    const properties = await Property.find({ project: project._id })
      .populate('owner', 'name phone email role')
      .populate('assignedAgent', 'name phone email avatar')
      .populate('assignedAgents', 'name phone email avatar')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 'Project properties retrieved successfully', properties);
  } catch (error) {
    next(error);
  }
};

/**
 * Create or Update Project (Admin / Content Editor)
 */
const createOrUpdateProject = async (req, res, next) => {
  try {
    const body = req.body;
    const targetId = req.params.id || body._id;

    if (!body.name) {
      return sendError(res, 'Project name is required', 'VALIDATION_ERROR', {}, 400);
    }

    if (!body.slug && body.name) {
      body.slug = slugify(body.name, { lower: true, strict: true });
    }

    // Coordinates default
    if (!body.location || !body.location.coordinates || body.location.coordinates.length < 2) {
      body.location = {
        type: 'Point',
        coordinates: [Number(body.longitude) || 79.0882, Number(body.latitude) || 21.1458],
      };
    }

    let project;
    if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
      project = await Project.findByIdAndUpdate(targetId, { $set: body }, { new: true, runValidators: true });
    } else {
      project = await Project.findOneAndUpdate(
        { slug: body.slug },
        { $set: body },
        { new: true, upsert: true, runValidators: true }
      );
    }

    return sendSuccess(res, 'Project saved successfully', project, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Project (Admin)
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return sendError(res, 'Project not found', 'NOT_FOUND', {}, 404);
    }
    return sendSuccess(res, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectBySlug,
  getProjectProperties,
  createOrUpdateProject,
  deleteProject,
};

