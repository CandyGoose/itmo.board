const fs = require('fs');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const imageUploadRoutes = require('../views/ImageUpload.view');
const app = express();
const path = require('path');

let mongoServer;

describe('Image Upload Tests', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        app.use(express.json());
        imageUploadRoutes(app);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should upload an image and return a 200 with a JSON url property', async () => {
        const testImagePath = path.join(__dirname, 'test-image.png');
        const response = await request(app)
            .post('/uploads')
            .attach('file', testImagePath);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('url');
        expect(response.body.deduplicated).toBe(false);
    });

    it('should return deduplicated=true if the same file is uploaded again', async () => {
        const testImagePath = path.join(__dirname, 'test-image.png');
        const response = await request(app)
            .post('/uploads')
            .attach('file', testImagePath);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('url');
        expect(response.body.deduplicated).toBe(true);
    });

    it('should fail with 400 if no file is provided', async () => {
        const response = await request(app).post('/uploads');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty(
            'error',
            'No file uploaded or invalid file type.',
        );
    });

    it('should reject an invalid file type', async () => {
        const tmpFilePath = path.join(__dirname, 'invalid-file.txt');
        fs.writeFileSync(tmpFilePath, 'This is a test content');

        const response = await request(app)
            .post('/uploads')
            .attach('file', tmpFilePath);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');

        fs.unlinkSync(tmpFilePath);
    });
});
