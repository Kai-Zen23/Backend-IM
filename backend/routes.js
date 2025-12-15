const express = require('express');
const router = express.Router();
const { pool } = require('./database');

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

// POST new entry
router.post('/entries', async (req, res) => {
    const { type, name, identity, secret } = req.body;
    if (!type || !name || !secret) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO entries (type, name, identity, secret) VALUES ($1, $2, $3, $4) RETURNING *',
            [type, name, identity, secret]
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
