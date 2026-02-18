import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/auth.js';
import { Readable } from 'stream';

const router = express.Router();

// Configure Cloudinary (lazy initialization)
let cloudinaryConfigured = false;
const configureCloudinary = () => {
  if (!cloudinaryConfigured) {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };
    
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new Error('Cloudinary configuration is missing. Please check your .env file.');
    }
    
    cloudinary.config(config);
    cloudinaryConfigured = true;

  }
};

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Images only (PNG, JPG, etc.)
const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Documents (CV / resume, PDFs, etc.) — stored as Cloudinary raw resources
const multerResumeUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or Word documents are allowed'), false);
    }
  },
});

// Base folder for all uploads
const BASE_FOLDER = 'Scanbit';

// Helper function to build full folder path
const buildFolderPath = (subfolder) => {
  if (!subfolder) {
    return BASE_FOLDER;
  }
  // If folder already starts with Scanbit, return as is
  if (subfolder.startsWith(BASE_FOLDER)) {
    return subfolder;
  }
  // Otherwise, prepend Scanbit/
  return `${BASE_FOLDER}/${subfolder}`;
};

// Helper function to upload image buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  // Ensure Cloudinary is configured
  configureCloudinary();
  
  // Build full folder path with Scanbit base
  const fullFolderPath = buildFolderPath(folder);
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: fullFolderPath,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Helper for raw files (PDF, docs) to Cloudinary
const uploadToCloudinaryRaw = (buffer, folder) => {
  configureCloudinary();
  const fullFolderPath = buildFolderPath(folder);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: fullFolderPath,
        resource_type: 'raw',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private
router.post('/image', protect, multerUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate and configure Cloudinary
    try {
      configureCloudinary();
    } catch (configError) {

      return res.status(500).json({
        success: false,
        message: configError.message || 'Cloudinary configuration is missing on server. Please check your .env file.'
      });
    }

    // Get folder from query parameter or default
    // If no folder specified, use 'general' subfolder within Scanbit
    const folder = req.query.folder || 'general';

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, folder);

    res.json({
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {

    const errorMessage = error.message || 'Failed to upload image';
    // Check if it's a Cloudinary error
    if (error.http_code) {

    }
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// @route   POST /api/upload/file
// @desc    Upload document (CV / resume) to Cloudinary as raw file
// @access  Private
router.post('/file', protect, multerResumeUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate and configure Cloudinary
    try {
      configureCloudinary();
    } catch (configError) {
      return res.status(500).json({
        success: false,
        message: configError.message || 'Cloudinary configuration is missing on server. Please check your .env file.'
      });
    }

    const folder = req.query.folder || 'resumes';
    const fileUrl = await uploadToCloudinaryRaw(req.file.buffer, folder);

    res.json({
      success: true,
      url: fileUrl,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    const errorMessage = error.message || 'Failed to upload file';
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images to Cloudinary
// @access  Private
router.post('/multiple', protect, multerUpload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Validate and configure Cloudinary
    try {
      configureCloudinary();
    } catch (configError) {

      return res.status(500).json({
        success: false,
        message: configError.message || 'Cloudinary configuration is missing on server. Please check your .env file.'
      });
    }

    // Get folder from query parameter or default
    // If no folder specified, use 'general' subfolder within Scanbit
    const folder = req.query.folder || 'general';

    // Upload all files
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, folder)
    );

    const urls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      urls: urls,
      message: `${urls.length} image(s) uploaded successfully`
    });
  } catch (error) {

    const errorMessage = error.message || 'Failed to upload images';
    // Check if it's a Cloudinary error
    if (error.http_code) {

    }
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

export default router;
