import request from 'supertest';
import express from 'express';
import routes from '../routes'; // Маршруты, которые вы тестируете

const app = express();
app.use(express.json()); // Middleware для обработки JSON
app.use('/', routes);

describe('Successful Routes Tests', () => {
    it('should return 200 and correct message for GET /data', async () => {
        const response = await request(app).get('/data');
        expect(response.status).toBe(200); // Ожидаем 200
        expect(response.body.message).toBe('Here is some data'); // Проверяем корректное сообщение
    });
});
