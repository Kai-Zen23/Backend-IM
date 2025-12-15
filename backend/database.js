const { Pool } = require('pg');

// Use DATABASE_URL if available (Render provides this), otherwise use local config
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
    try {
        const client = await pool.connect();
        try {
            console.log('Connected to PostgreSQL database');
            await client.query(`
                CREATE TABLE IF NOT EXISTS entries (
                    id SERIAL PRIMARY KEY,
                    type TEXT NOT NULL,
                    name TEXT NOT NULL,
                    identity TEXT,
                    secret TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('Entries table verified/created');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
};

module.exports = { pool, initDb };
