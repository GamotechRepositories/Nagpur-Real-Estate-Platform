const { uploadToS3OrLocal, uploadMultipleToS3OrLocal } = require('../services/s3Service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Upload a single image/photo
 */
const uploadSinglePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No photo uploaded. Please select an image file.', 'FILE_MISSING', {}, 400);
    }

    const folder = req.body.folder || 'general';
    const result = await uploadToS3OrLocal(req.file, folder);

    return sendSuccess(res, 'Photo uploaded successfully', result, null, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple photos (e.g., property gallery, project elevation + floor plans)
 */
const uploadMultiplePhotos = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) {
      return sendError(res, 'No photos uploaded. Please select at least one image file.', 'FILE_MISSING', {}, 400);
    }

    const folder = req.body.folder || 'properties';
    const results = await uploadMultipleToS3OrLocal(files, folder);

    return sendSuccess(res, `${results.length} photos uploaded successfully`, results, null, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSinglePhoto,
  uploadMultiplePhotos,
};

