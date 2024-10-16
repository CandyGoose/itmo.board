import { Pool } from 'pg';

const pool = new Pool({
    user: 'your-username',
    host: 'localhost',
    database: 'your-database',
    password: 'your-password',
    port: 5432,
});

export const query = async (text: string, params?: unknown[]) => {
    const res = await pool.query(text, params);
    return res.rows;
};

// Дополнительная не покрытая функция
export function untestedFunction() {
    console.log('This function is not covered by tests');
}

// Ещё один не покрытый код
export function untestedCondition(condition: boolean): string {
    if (condition) {
        return 'Condition is true';
    } else {
        return 'Condition is false';
    }
}
