const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

// Ensure uploads directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(__dirname, "../../uploads");
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload only images"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Process and save image
const processImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    await ensureUploadDir();

    const filename = `user-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.jpeg`;
    const filepath = path.join(__dirname, "../../uploads", filename);

    // Process image with sharp
    await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    req.file.filename = filename;
    next();
  } catch (error) {
    console.error("Image processing error:", error);
    res.status(400).json({ error: "Error processing image" });
  }
};

module.exports = {
  uploadSingle: upload.single("profileImage"),
  processImage,
};
