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

function getFileHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function storeImageIfNotExists(buffer, originalName, mimeType) {
    const hash = getFileHash(buffer);

    let imageDoc = await Image.findOne({ hash });
    if (imageDoc) {
        return { imageDoc, deduplicated: true };
    }

    const extension = path.extname(originalName) || mimeToExtension(mimeType);
    const filename = `${uuidv4()}${extension}`;
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fullPath = path.join(uploadDir, filename);
    fs.writeFileSync(fullPath, buffer);

    imageDoc = await Image.create({
        filename,
        path: path.join('uploads', filename),
        originalName,
        mimeType,
        hash,
    });

    return { imageDoc, deduplicated: false };
}

exports.uploadFile = async (req, res) => {
    try {
        if (req.fileValidationError || !req.file) {
            return res
                .status(400)
                .json({ error: 'No file uploaded or invalid file type.' });
        }

        const { file } = req;
        const { imageDoc, deduplicated } = await storeImageIfNotExists(
            file.buffer,
            file.originalname,
            file.mimetype,
        );

        return res.status(200).json({
            url: `${req.protocol}://${req.get('host')}/${imageDoc.path}`,
            deduplicated,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to upload file' });
    }
};

exports.uploadFileByUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL not provided' });
        }

        const remoteRes = await fetch(url);
        if (!remoteRes.ok) {
            throw new Error(`Failed to fetch image: ${remoteRes.statusText}`);
        }

        const contentType = remoteRes.headers.get('content-type') || '';
        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            return res
                .status(400)
                .json({ error: 'Unsupported image mime type' });
        }

        const fileBuffer = Buffer.from(await remoteRes.arrayBuffer());
        const { imageDoc, deduplicated } = await storeImageIfNotExists(
            fileBuffer,
            'downloaded-from-url',
            contentType,
        );

        return res.status(200).json({
            url: `${req.protocol}://${req.get('host')}/${imageDoc.path}`,
            deduplicated,
        });
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ error: 'Failed to upload file from URL' });
    }
};

function mimeToExtension(mimeType) {
    switch (mimeType) {
        case 'image/jpeg':
        case 'image/jpg':
            return '.jpg';
        case 'image/png':
            return '.png';
        case 'image/gif':
            return '.gif';
        case 'image/svg+xml':
            return '.svg';
        default:
            return '';
    }
}
exports.mimeToExtension = mimeToExtension;
