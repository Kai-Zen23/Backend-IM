require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('VoltVault Backend is running!');
});

// Initialize DB and start server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    // Continue running server even if DB fails, to show it's alive (for debugging)
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (DB Connection Failed)`);
    });
});
