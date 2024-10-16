import { query } from '../database';
import { Pool } from 'pg';

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
        connect: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

describe('Failing Database Tests', () => {
    let pool: Pool;

    beforeEach(() => {
        pool = new Pool();
    });

    it('should fail because it expects incorrect data from query', async () => {
        const rows = [{ id: 1, name: 'Test' }];
        (pool.query as jest.Mock).mockResolvedValue({ rows });

        const result = await query('SELECT * FROM users');
        // Этот тест провалится, так как ожидается другой результат
        expect(result).toEqual([{ id: 2, name: 'Incorrect' }]);
    });

    it('should fail because it expects no error from invalid query', async () => {
        (pool.query as jest.Mock).mockRejectedValue(new Error('Query error'));

        // Этот тест провалится, так как мы ожидаем успех, а будет ошибка
        await expect(query('INVALID SQL')).resolves.toEqual([{ id: 1, name: 'Test' }]);
    });
});