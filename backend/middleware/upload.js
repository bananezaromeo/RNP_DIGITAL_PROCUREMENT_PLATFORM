// backend/middleware/upload.js
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const nationalIdDir = path.join(__dirname, '..', 'uploads', 'national_id');
const businessDir = path.join(__dirname, '..', 'uploads', 'business_license');

ensureDir(nationalIdDir);
ensureDir(businessDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'national_id') cb(null, nationalIdDir);
    else if (file.fieldname === 'business_license') cb(null, businessDir);
    else cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const safeName = `${Date.now()}-${file.fieldname}-${file.originalname.replace(/\s+/g,'_')}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  // accept pdf and images (jpg, png)
  const allowed = /pdf|jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only PDF or image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

module.exports = upload;
