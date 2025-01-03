const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const imageUploadRoutes = require('../views/ImageUpload.view');
const app = express();

const path = require('path');

let mongoServer;
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

describe('Image Upload Tests', () => {
    it('should upload an image and return a 200 with a JSON url property', async () => {
        const testImagePath = path.join(__dirname, 'test-image.png');

        const response = await request(app)
            .post('/uploads')
            .attach('file', testImagePath)
            .expect(200);

        expect(response.body).toHaveProperty('url');
        expect(response.body.url).toContain('/uploads/');
    });

    it('should fail (500) if no file is provided', async () => {
        const response = await request(app).post('/uploads').expect(500);

        // Expect an error in the response
        expect(response.body).toHaveProperty('error');
    });
});
