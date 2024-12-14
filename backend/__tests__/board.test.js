const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const boardRoutes = require('../views/board.view');
const app = express();
const Board = require('../models/board.model');

let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    app.use(express.json());
    boardRoutes(app);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Board Controller Tests', () => {
    let boardId;

    it('should create a new board', async () => {
        const newBoard = {
            title: 'Test Board',
            orgId: 'org123',
            authorId: 'user123',
            imageUrl: 'http://example.com/image.png',
        };

        const response = await request(app)
            .post('/boards')
            .send(newBoard)
            .expect(200);

        expect(response.body.title).toBe(newBoard.title);
        expect(response.body.orgId).toBe(newBoard.orgId);
        expect(response.body.authorId).toBe(newBoard.authorId);
        expect(response.body.imageUrl).toBe(newBoard.imageUrl);
        boardId = response.body._id;
    });

    it('should get all boards', async () => {
        const response = await request(app)
            .get('/boards')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a board by ID', async () => {
        const response = await request(app)
            .get(`/boards/${boardId}`)
            .expect(200);

        expect(response.body._id).toBe(boardId);
        expect(response.body.title).toBe('Test Board');
    });

    it('should return 500 for getById when DB fails', async () => {
        // Симулируем ошибку при поиске по ID
        jest.spyOn(Board, 'findOne').mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .get(`/boards/${boardId}`)
            .expect(500);

        expect(response.body.error).toBe('Database error');
    });

    it('should return 500 for createBoard when DB fails', async () => {
        // Симулируем ошибку при создании доски
        jest.spyOn(Board, 'create').mockRejectedValue(new Error('Database error'));

        const newBoard = {
            title: 'Test Board',
            orgId: 'org123',
            authorId: 'user123',
            imageUrl: 'http://example.com/image.png',
        };

        const response = await request(app)
            .post('/boards')
            .send(newBoard)
            .expect(500);

        expect(response.body.error).toBe('Database error');
    });

    it('should return 500 for updateBoard when DB fails', async () => {
        // Симулируем ошибку при обновлении доски
        jest.spyOn(Board, 'updateOne').mockRejectedValue(new Error('Database error'));

        const updatedBoard = {
            title: 'Updated Test Board',
            orgId: 'org123',
            authorId: 'user123',
            imageUrl: 'http://example.com/updated-image.png',
        };

        const response = await request(app)
            .put(`/boards/${boardId}`)
            .send(updatedBoard)
            .expect(500);

        expect(response.body.error).toBe('Database error');
    });

    it('should return 500 for deleteBoard when DB fails', async () => {
        // Симулируем ошибку при удалении доски
        jest.spyOn(Board, 'deleteOne').mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .delete(`/boards/${boardId}`)
            .expect(500);

        expect(response.body.error).toBe('Database error');
    });

    it('should return 500 for renameBoard when DB fails', async () => {
        // Симулируем ошибку при переименовании доски
        jest.spyOn(Board, 'updateOne').mockRejectedValue(new Error('Database error'));

        const updatedTitle = {
            title: 'Renamed Board',
        };

        const response = await request(app)
            .put(`/boards/title/${boardId}`)
            .send(updatedTitle)
            .expect(500);

        expect(response.body.error).toBe('Database error');
    });
});
