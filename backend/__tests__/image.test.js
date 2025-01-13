const fs = require('fs');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const imageUploadRoutes = require('../views/ImageUpload.view');
const app = express();
const path = require('path');
const {
    uploadFileByUrl,
    mimeToExtension,
} = require('../controllers/ImageUpload');

let mongoServer;
global.fetch = jest.fn();

function createMockReqRes(overrides = {}) {
    const req = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
        body: {},
        file: null,
        ...overrides,
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    return { req, res };
}

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

describe('uploadFileByUrl', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should respond with 400 if url is not provided', async () => {
        const { req, res } = createMockReqRes();
        await uploadFileByUrl(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'URL not provided' });
    });

    it('should handle fetch failures (non-OK response)', async () => {
        const { req, res } = createMockReqRes({
            body: { url: 'http://example.com/test.png' },
        });

        // Mock fetch returning a 404 or similar
        global.fetch.mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found',
        });

        await uploadFileByUrl(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Failed to upload file from URL',
        });
    });

    it('should reject unsupported MIME type', async () => {
        const { req, res } = createMockReqRes({
            body: { url: 'http://example.com/test.exe' },
        });

        global.fetch.mockResolvedValue({
            ok: true,
            headers: {
                get: () => 'application/octet-stream', // unsupported
            },
            arrayBuffer: async () => new ArrayBuffer(8),
        });

        await uploadFileByUrl(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Unsupported image mime type',
        });
    });

    it('should handle exceptions and return 500', async () => {
        const { req, res } = createMockReqRes({
            body: { url: 'http://example.com/test.png' },
        });

        global.fetch.mockImplementation(() => {
            throw new Error('Network failure');
        });

        await uploadFileByUrl(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Failed to upload file from URL',
        });
    });
});

describe('mimeToExtension', () => {
    test('should return correct extension for known mime types', () => {
        expect(mimeToExtension('image/jpeg')).toBe('.jpg');
        expect(mimeToExtension('image/png')).toBe('.png');
        expect(mimeToExtension('image/gif')).toBe('.gif');
        expect(mimeToExtension('image/svg+xml')).toBe('.svg');
    });

    test('should return empty string for unknown mime types', () => {
        expect(mimeToExtension('application/json')).toBe('');
        expect(mimeToExtension('text/plain')).toBe('');
    });
});
