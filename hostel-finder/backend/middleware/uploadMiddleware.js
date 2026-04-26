// middleware/uploadMiddleware.js
// Multer configuration for listing image uploads.
// Files are saved to backend/uploads/ and served as static assets.
// Max 10 images, 5MB each, JPEG/PNG/WebP only.

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists at startup
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Store files on disk with a unique timestamped filename
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `listing-${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

// Reject anything that isn't an image
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 10,                  // max 10 files per request
  },
});

module.exports = upload;
