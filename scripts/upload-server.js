const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const PORT = process.env.UPLOAD_SERVER_PORT || 5174;
const app = express();

const publicDir = path.join(__dirname, '..', 'public');
const tempDir = path.join(publicDir, 'temp');

// ensure public/temp exists
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-z0-9_.-]/gi, '_');
    cb(null, safe);
  }
});

const upload = multer({ storage });

app.use('/temp', express.static(tempDir));

app.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = '/temp/' + req.file.filename;
  return res.json({ success: true, url });
});

app.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`);
  console.log(`Files served from ${tempDir} at /temp`);
});
