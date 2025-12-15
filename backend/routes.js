const express = require('express');
const router = express.Router();
const { pool } = require('./database');

// POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && user.password === password) {
            // In a real app, generate a JWT token here
            res.json({ success: true, user: { id: user.id, email: user.email } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all entries
router.get('/entries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM entries ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// TEMPORARY: Seed Database Route
// Use this because we can't access the shell on Render Free Tier
router.get('/seed', async (req, res) => {
    try {
        console.log('Seeding database via endpoint...');
        // Clear data
        await pool.query('TRUNCATE users, entries RESTART IDENTITY');

        // Create Admin
        await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', ['admin@volt.vault', 'admin123']);

        // Create Entries
        const entries = [
            { type: 'login', name: 'Google', username: 'james@gmail.com', password: 'password123', url: 'https://google.com', folder_id: 'Personal', favorite: true, totp_secret: 'JBSWY3DPEHPK3PXP' },
            { type: 'login', name: 'GitHub', username: 'dev-james', password: 'secure-password-456', url: 'https://github.com', folder_id: 'Work', favorite: true, notes: 'Main dev account.' },
            { type: 'note', name: 'WiFi Password', notes: 'Home: SuperSecretWiFi', folder_id: 'Personal', favorite: false }
        ];

        for (const entry of entries) {
            await pool.query(
                'INSERT INTO entries (type, name, username, password, url, notes, folder_id, favorite, totp_secret) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [entry.type, entry.name, entry.username, entry.password, entry.url, entry.notes, entry.folder_id, entry.favorite, entry.totp_secret]
            );
        }

        res.send('Database Seeded Successfully! <br> Login with: <b>admin@volt.vault</b> / <b>admin123</b>');
    } catch (err) {
        console.error(err);
        res.status(500).send('Seeding failed: ' + err.message);
    }
});

// POST new entry
router.post('/entries', async (req, res) => {
    const { type, name, username, password, url, notes, folder_id, favorite, totp_secret } = req.body;

    // Basic validation
    if (!type || !name) {
        return res.status(400).json({ error: 'Missing required fields (type, name)' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO entries (
                type, name, username, password, url, notes, folder_id, favorite, totp_secret
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [type, name, username, password, url, notes, folder_id, favorite || false, totp_secret]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE entry
router.delete('/entries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM entries WHERE id = $1', [id]);
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
