const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // uploads folder must exist for this to work
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage });

exports.uploadMiddleware = upload.single('file');

exports.uploadFile = async (req, res) => {
    try {
        const { filename } = req.file;
        const fileUrl = `${req.protocol}://${req.get(
            'host',
        )}/uploads/${filename}`;

        return res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: error.message });
    }
};
