import { a, b, c } from '../server';

describe('Backend Tests', () => {
    it('should log the correct console output', () => {
        const consoleSpy = jest
            .spyOn(console, 'log')
            .mockImplementation(() => {}); // Мокаем console.log для отслеживания
        a();
        expect(consoleSpy).toHaveBeenCalledWith('It works!'); // Тест теперь пройдет, так как сообщение правильное
        consoleSpy.mockRestore(); // Восстановление состояния console после теста
    });

    it('should confirm that function a() returns nothing', () => {
        const returnValue = require('../server').a();
        expect(returnValue).toBeUndefined(); // Тест пройдет, так как a() возвращает void
    });
});
describe('function b', () => {
    it('logs the correct message', () => {
        console.log = jest.fn();
        b();
        expect(console.log).toHaveBeenCalledWith(
            "This is function b, but it's never tested",
        );
    });
});

describe('function c', () => {
    it('returns true message when condition is true', () => {
        const result = c(true);
        expect(result).toBe('Condition is true');
    });

    it('returns false message when condition is false', () => {
        const result = c(false);
        expect(result).toBe('Condition is false');
    });
});
