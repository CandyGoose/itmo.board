import { Pool } from 'pg';

const pool = new Pool({
    user: 'your-username',
    host: 'localhost',
    database: 'your-database',
    password: 'your-password',
    port: 5432,
});

export const query = async (text: string, params?: any[]) => {
    const res = await pool.query(text, params);
    return res.rows;
};
