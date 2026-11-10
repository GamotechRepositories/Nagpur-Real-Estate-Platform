import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Star,
  Loader2,
  Plus,
} from 'lucide-react';
import apiClient from '../../api/client';

export const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const backendOrigin = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Universal Photo & Media Uploader (AWS S3 + CloudFront Ready)
 * Supports Single & Multi-image upload, drag-and-drop, preview, and cover photo selection.
 */
export const PhotoUploader = ({
  value,
  onChange,
  multiple = false,
  folder = 'general',
  label = 'Upload Photo',
  helperText = 'JPG, PNG, or WEBP up to 10MB',
  maxFiles = 15,
  aspect = 'video', // 'video' | 'square' | 'avatar'
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Normalize value for multi vs single
  const imageList = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : value
    ? [value]
    : [];

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setError('');
    setIsUploading(true);

    try {
      if (multiple) {
        // Multi-file upload
        const formData = new FormData();
        formData.append('folder', folder);
        const filesToUpload = Array.from(files).slice(0, maxFiles - imageList.length);

        if (filesToUpload.length === 0) {
          setError(`Maximum ${maxFiles} photos allowed.`);
          setIsUploading(false);
          return;
        }

        filesToUpload.forEach((f) => {
          formData.append('files', f);
        });

        const res = await apiClient.post('/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedUrls = res.data?.data?.map((item) => item.url) || [];
        const nextList = [...imageList, ...uploadedUrls];
        onChange(nextList);
      } else {
        // Single file upload
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await apiClient.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedUrl = res.data?.data?.url || '';
        onChange(uploadedUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove) => {
    if (multiple) {
      const nextList = imageList.filter((_, idx) => idx !== indexToRemove);
      onChange(nextList);
    } else {
      onChange('');
    }
  };

  const handleSetCover = (indexToCover) => {
    if (!multiple || indexToCover === 0) return;
    const selected = imageList[indexToCover];
    const remaining = imageList.filter((_, idx) => idx !== indexToCover);
    onChange([selected, ...remaining]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">{label}</label>
          {multiple && (
            <span className="text-[11px] text-slate-400 font-medium">
              {imageList.length} / {maxFiles} uploaded
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Upload Dropzone */}
      {(!multiple && imageList.length === 0) || (multiple && imageList.length < maxFiles) ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-teal-500 bg-teal-50/50'
              : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50'
          } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                {isUploading ? (
                  <span>Uploading to Cloud...</span>
                ) : (
                  <>
                    <span className="text-teal-600 hover:underline">Click to browse</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Image Preview List */}
      {imageList.length > 0 && (
        <div
          className={
            multiple
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1'
              : 'pt-1'
          }
        >
          {imageList.map((url, idx) => (
            <div
              key={idx}
              className={`group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-2xs ${
                aspect === 'avatar'
                  ? 'w-24 h-24 rounded-full mx-auto'
                  : aspect === 'square'
                  ? 'aspect-square'
                  : 'aspect-video'
              }`}
            >
              <img
                src={getFullImageUrl(url)}
                alt={`Uploaded photo ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600';
                }}
              />

              {/* Cover Photo Badge on First Image */}
              {multiple && idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  Cover Photo
                </span>
              )}

              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                {multiple && idx !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetCover(idx);
                    }}
                    className="p-1.5 bg-white text-slate-700 hover:text-teal-600 rounded-lg shadow-xs transition-colors"
                    title="Set as Cover Photo"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="p-1.5 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow-xs transition-colors"
                  title="Remove Photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add More Button in Multi Mode */}
          {multiple && imageList.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 transition-colors"
            >
              <Plus className="w-5 h-5 mb-1" />
              <span className="text-[11px] font-semibold">Add More</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;

