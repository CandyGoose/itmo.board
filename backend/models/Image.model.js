const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    originalName: String,
    mimeType: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    hash: {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model('Image', ImageSchema);
