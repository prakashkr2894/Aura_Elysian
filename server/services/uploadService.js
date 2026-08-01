import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadSingleImage = async (file, folder = 'aura-elysian') => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder: `aura-elysian/${folder}`,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' }
        ]
      }
    );
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error?.message || error);
    throw new Error('Failed to upload image to Cloudinary: ' + (error?.message || error));
  }
};

const uploadMultipleImages = async (files, folder = 'aura-elysian') => {
  const results = await Promise.all(files.map(file => uploadSingleImage(file, folder)));
  return results;
};

const deleteImage = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

export { upload, uploadSingleImage, uploadMultipleImages, deleteImage };
