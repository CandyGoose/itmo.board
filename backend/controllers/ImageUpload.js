const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const Image = require('../models/Image.model');

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
];

function fileFilter(req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        req.fileValidationError = 'Forbidden extension';
        cb(null, false, req.fileValidationError);
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
});

exports.uploadMiddleware = upload.single('file');

exports.uploadFile = async (req, res) => {
    try {
        if (req.fileValidationError || !req.file) {
            return res
                .status(400)
                .json({ error: 'No file uploaded or invalid file type.' });
        }

        const fileBuffer = req.file.buffer;
        const hash = crypto
            .createHash('sha256')
            .update(fileBuffer)
            .digest('hex');
        let imageDoc = await Image.findOne({ hash });

        if (imageDoc) {
            return res.status(200).json({
                url: `${req.protocol}://${req.get('host')}/${imageDoc.path}`,
                deduplicated: true,
            });
        }

        const ext = path.extname(req.file.originalname);
        const filename = `${uuidv4()}${ext}`;
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fullPath = path.join(uploadDir, filename);
        fs.writeFileSync(fullPath, fileBuffer);

        imageDoc = await Image.create({
            filename,
            path: `uploads/${filename}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            hash,
        });

        return res.status(200).json({
            url: `${req.protocol}://${req.get('host')}/${imageDoc.path}`,
            deduplicated: false,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to upload file' });
    }
};
