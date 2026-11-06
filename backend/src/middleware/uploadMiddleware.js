const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedDocTypes = /pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/;

  const isImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) &&
                  allowedImageTypes.test(file.mimetype);
  const isDoc = allowedDocTypes.test(path.extname(file.originalname).toLowerCase()) &&
                allowedDocTypes.test(file.mimetype);

  if (isImage || isDoc) {
    return cb(null, true);
  }

  cb(new Error('Invalid file type! Only JPG, JPEG, PNG, WEBP, and PDF documents are permitted.'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter,
});

module.exports = {
  upload,
  uploadsDir,
};
