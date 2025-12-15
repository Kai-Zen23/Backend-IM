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
            // DROP TABLE for development to ensure schema update
            // await client.query('DROP TABLE IF EXISTS entries'); 
            // Creating with new schema
            await client.query(`
                    CREATE TABLE IF NOT EXISTS entries (
                        id SERIAL PRIMARY KEY,
                        type TEXT NOT NULL,
                        name TEXT NOT NULL,
                        username TEXT,
                        password TEXT,
                        url TEXT,
                        notes TEXT,
                        folder_id TEXT,
                        favorite BOOLEAN DEFAULT FALSE,
                        totp_secret TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
            `);
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL
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
