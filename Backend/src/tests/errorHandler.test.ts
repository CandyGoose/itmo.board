import { errorHandler } from '../errorHandler';
import { Request, Response } from 'express';

describe('Error Handler Tests', () => {
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

    it('should return 500 status and correct error message', () => {
        const error = new Error('Test error');
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {}); // Мокаем console.error

        errorHandler(error, req as Request, res as Response); // Вызов функции errorHandler

        // Проверяем, что функция вызовет статус 500 и вернет сообщение 'Internal server error'
        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            message: 'Internal server error',
        });

        // Проверяем, что console.error был вызван с выводом ошибки
        expect(consoleSpy).toHaveBeenCalledWith(error.stack);

        consoleSpy.mockRestore(); // Восстанавливаем console.error после теста
    });
});
