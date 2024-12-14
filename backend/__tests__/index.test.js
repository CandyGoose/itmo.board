const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const allowedOrigins = ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", 'http://localhost:3000');
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Private-Network", true);
    res.setHeader("Access-Control-Max-Age", 7200);
    next();
});

app.use(bodyParser.json());

// Пример маршрута
app.get('/test', (req, res) => {
    res.status(200).send('Hello, world!');
});

app.listen(4000, () => {
    console.log('Server is running at http://localhost:4000');
});

beforeAll(() => {
    return mongoose.connect('mongodb://localhost:27017/mango', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(() => {
    return mongoose.connection.close();
});

describe('Server API', () => {
    it('should return 200 for GET /test', async () => {
        const res = await request(app).get('/test');
        expect(res.status).toBe(200);
        expect(res.text).toBe('Hello, world!');
    });

    it('should allow CORS from allowed origin', async () => {
        const res = await request(app)
            .get('/test')
            .set('Origin', 'http://localhost:3000');
        expect(res.status).toBe(200);
        expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/unknown');
        expect(res.status).toBe(404);
    });
});
