const { uploadMiddleware, uploadFile } = require('../controllers/ImageUpload');

module.exports = function (app) {
    app.post('/uploads', uploadMiddleware, uploadFile);
};
