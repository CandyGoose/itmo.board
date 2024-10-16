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

    it('should return 201 and correct message for POST /data', async () => {
        const response = await request(app)
            .post('/data')
            .send({ data: 'Some data' });
        expect(response.status).toBe(201); // Ожидаем 201
        expect(response.body.message).toBe('Data added'); // Проверяем сообщение
        expect(response.body.data).toBe('Some data'); // Проверяем переданные данные
    });

    it('should return 400 when data is not provided', async () => {
        const response = await request(app)
            .post('/data')
            .send({}); // Отправляем пустой запрос
        expect(response.status).toBe(400); // Ожидаем 400
        expect(response.body.message).toBe('Invalid data'); // Проверяем сообщение об ошибке
    });
});