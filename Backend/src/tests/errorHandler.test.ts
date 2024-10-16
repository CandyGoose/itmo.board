import { errorHandler } from '../errorHandler';
import { Request, Response } from 'express';

describe('Failing Error Handler Tests', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jsonMock,
        };
    });

    it('should fail because it expects wrong status and message', () => {
        const error = new Error('Test error');

        errorHandler(error, req as Request, res as Response); // Убираем next

        // Заведомо неправильные ожидания, чтобы тест провалился
        expect(res.status).toHaveBeenCalledWith(404); // Ожидаем статус 500, тест провалится
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Wrong error message' }); // Ожидаем неверное сообщение
    });
});