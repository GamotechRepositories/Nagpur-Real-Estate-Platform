const fs = require('fs');
const path = require('path');
let S3Client, PutObjectCommand, DeleteObjectCommand;
try {
  const s3Module = require('@aws-sdk/client-s3');
  S3Client = s3Module.S3Client;
  PutObjectCommand = s3Module.PutObjectCommand;
  DeleteObjectCommand = s3Module.DeleteObjectCommand;
} catch (e) {
  // @aws-sdk/client-s3 not installed; fallback to local storage
}

const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'nagpur-real-estate-media';
const CLOUDFRONT_URL = (process.env.AWS_CLOUDFRONT_URL || '').replace(/\/$/, '');

// Check if valid AWS credentials exist (not dummy/placeholder)
const isAwsConfigured = () => {
  if (!S3Client) return false;
  const key = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  return (
    key &&
    secret &&
    !key.startsWith('dummy') &&
    !key.startsWith('your_') &&
    !secret.startsWith('dummy') &&
    !secret.startsWith('your_')
  );
};

let s3Client = null;
if (isAwsConfigured()) {
  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload single file to AWS S3 + CloudFront (with fallback to local storage)
 * @param {Object} file - Multer file object
 * @param {string} folder - Destination folder inside bucket (e.g. 'properties', 'projects')
 * @returns {Promise<{ url: string, key: string, provider: string }>}
 */
const uploadToS3OrLocal = async (file, folder = 'media') => {
  const ext = path.extname(file.originalname).toLowerCase();
  const uniqueName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  // If AWS S3 credentials are configured, upload to S3
  if (isAwsConfigured() && s3Client) {
    try {
      const fileStream = fs.createReadStream(file.path);
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueName,
        Body: fileStream,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000', // 1 year cache for CDN
      });

      await s3Client.send(command);

      // Clean up local temp file after S3 upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Return CloudFront CDN URL or S3 URL
      const cdnUrl = CLOUDFRONT_URL
        ? `${CLOUDFRONT_URL}/${uniqueName}`
        : `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${uniqueName}`;

      return {
        url: cdnUrl,
        key: uniqueName,
        provider: 'AWS_S3_CLOUDFRONT',
      };
    } catch (err) {
      console.warn('AWS S3 upload failed or credentials invalid, falling back to local storage:', err.message);
      // Fallback: keep local file and return local URL
    }
  }

  // Fallback to local storage
  const localUrl = `/uploads/${file.filename}`;
  return {
    url: localUrl,
    key: file.filename,
    provider: 'LOCAL_STORAGE',
  };
};

/**
 * Upload multiple files to AWS S3 or Local
 */
const uploadMultipleToS3OrLocal = async (files, folder = 'media') => {
  const results = [];
  for (const file of files) {
    const uploaded = await uploadToS3OrLocal(file, folder);
    results.push(uploaded);
  }
  return results;
};

module.exports = {
  uploadToS3OrLocal,
  uploadMultipleToS3OrLocal,
  isAwsConfigured,
};

