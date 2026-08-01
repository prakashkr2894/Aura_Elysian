import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';

interface CloudinaryImageUploadProps {
  onImageUpload: (url: string) => void;
  onMultipleImageUpload?: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  className?: string;
}

export const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({
  onImageUpload,
  onMultipleImageUpload,
  multiple = false,
  maxFiles = 5,
  folder = 'aura-elysian',
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploadMultipleImages, isUploading, error } = useCloudinaryUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('Please select only image files');
      return;
    }

    if (multiple && validFiles.length > maxFiles) {
      alert(`Please select no more than ${maxFiles} images`);
      return;
    }

    setSelectedFiles(validFiles);
    
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      if (multiple) {
        const results = await uploadMultipleImages(selectedFiles, folder);
        const urls = results.map(result => result.secure_url);
        onMultipleImageUpload?.(urls);
      } else {
        const result = await uploadImage(selectedFiles[0], folder);
        onImageUpload(result.secure_url);
      }
      
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {

    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors cursor-pointer"
        onClick={openFileDialog}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <motion.div
          className="flex flex-col items-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-700">
              {multiple ? 'Upload Images' : 'Upload Image'}
            </p>
            <p className="text-sm text-gray-500">
              {multiple 
                ? `Select up to ${maxFiles} images` 
                : 'Click to select an image'
              }
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Preview Images */}
      {previewUrls.length > 0 && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {previewUrls.map((url, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <motion.button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Image' : 'Images'}
              </span>
            </div>
          )}
        </motion.button>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};
