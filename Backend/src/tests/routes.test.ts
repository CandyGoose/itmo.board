import request from 'supertest';
import express from 'express';
import routes from '../routes';

const app = express();
app.use(express.json()); // Middleware для обработки JSON
app.use('/', routes);

describe('Failing Routes Tests', () => {
    it('should fail because it expects the wrong status for GET /data', async () => {
        const response = await request(app).get('/data');
        expect(response.status).toBe(404); // Этот тест провалится, так как статус будет 200
    });

    it('should fail because it expects incorrect response body for POST /data', async () => {
        const response = await request(app)
            .post('/data')
            .send({ data: 'Some data' });
        expect(response.body.message).toBe('Wrong message'); // Этот тест провалится, так как сообщение другое
    });

    it('should fail because it expects invalid status for POST /data', async () => {
        const response = await request(app)
            .post('/data')
            .send({ data: 'Some data' });
        expect(response.status).toBe(400); // Этот тест провалится, так как статус 201
    });

    it('should fail because it expects 200 when data is not provided', async () => {
        const response = await request(app)
            .post('/data')
            .send({}); // Отправляем пустой запрос без данных
        expect(response.status).toBe(200); // Этот тест провалится, так как сервер вернет 400
    });
});