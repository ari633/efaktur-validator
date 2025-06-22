const express = require('express');
const multer = require('multer');
const path = require('path');
const validateRoutes = require('./routes/validate.route');

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF or JPG files are allowed'), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'storages/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const app = express();
const upload = multer({ storage, fileFilter: fileFilter });

app.use(express.json());
app.use('/validate-efaktur', upload.single('file'), validateRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
