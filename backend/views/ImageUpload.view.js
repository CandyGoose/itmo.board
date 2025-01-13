const {
    uploadMiddleware,
    uploadFile,
    uploadFileByUrl,
} = require('../controllers/ImageUpload');

module.exports = function (app) {
    app.post('/uploads', uploadMiddleware, uploadFile);

    app.post('/uploads-by-url', uploadFileByUrl);
};
