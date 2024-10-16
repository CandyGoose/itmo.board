import { query, untestedFunction, untestedCondition } from '../database';
import { Pool } from 'pg';

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
        connect: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

describe('Database Tests', () => {
    let pool: Pool;

    beforeEach(() => {
        pool = new Pool();
    });

    it('should return correct data from query', async () => {
        const rows = [{ id: 1, name: 'Test' }];
        (pool.query as jest.Mock).mockResolvedValue({ rows });

        const result = await query('SELECT * FROM users');
        // Тест пройдет, так как данные верны
        expect(result).toEqual(rows);
    });

    it('should throw an error for invalid query', async () => {
        (pool.query as jest.Mock).mockRejectedValue(new Error('Query error'));

        // Тест пройдет, так как запрос вызывает ошибку
        await expect(query('INVALID SQL')).rejects.toThrow('Query error');
    });

    describe('untestedFunction', () => {
        it('logs the correct message', () => {
            console.log = jest.fn();
            untestedFunction();
            expect(console.log).toHaveBeenCalledWith(
              'This function is not covered by tests',
            );
        });
    });

    describe('untestedCondition', () => {
        it('returns true message when condition is true', () => {
            const result = untestedCondition(true);
            expect(result).toBe('Condition is true');
        });

        it('returns false message when condition is false', () => {
            const result = untestedCondition(false);
            expect(result).toBe('Condition is false');
        });
    });
});