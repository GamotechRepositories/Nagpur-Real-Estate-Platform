const mongoose = require('mongoose');

const propertyMediaSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, // For Cloudinary or S3 asset cleanup
      default: '',
    },
    mediaType: {
      type: String,
      enum: ['IMAGE', 'FLOOR_PLAN', 'VIDEO', 'DOCUMENT', 'BROCHURE'],
      default: 'IMAGE',
    },
    title: {
      type: String,
      default: '',
    },
    isCover: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PropertyMedia', propertyMediaSchema);
