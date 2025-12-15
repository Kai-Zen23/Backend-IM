const { pool } = require('./database');

const seedData = async () => {
    try {
        const client = await pool.connect();
        try {
            console.log('Seeding database...');

            // Clear existing data (optional, but good for reset)
            await client.query('TRUNCATE users, entries RESTART IDENTITY');

            // 1. Create Admin User
            // In a real app, password should be hashed (e.g., bcrypt). 
            // Saving plain text here as per prototype plan.
            await client.query(`
                INSERT INTO users (email, password)
                VALUES ($1, $2)
            `, ['admin@volt.vault', 'admin123']);
            console.log('Admin user created: admin@volt.vault / admin123');

            // 2. Create Initial Vault Entries
            const entries = [
                {
                    type: 'login',
                    name: 'Google',
                    username: 'james@gmail.com',
                    password: 'password123',
                    url: 'https://google.com',
                    folder_id: 'Personal',
                    favorite: true,
                    totp_secret: 'JBSWY3DPEHPK3PXP'
                },
                {
                    type: 'login',
                    name: 'GitHub',
                    username: 'dev-james',
                    password: 'secure-password-456',
                    url: 'https://github.com',
                    folder_id: 'Work',
                    favorite: true,
                    notes: 'This is the main dev account.'
                },
                {
                    type: 'note',
                    name: 'WiFi Password',
                    notes: 'Home: SuperSecretWiFi\nOffice: GuestNetwork123',
                    folder_id: 'Personal',
                    favorite: false
                }
            ];

            for (const entry of entries) {
                await client.query(`
                    INSERT INTO entries (type, name, username, password, url, notes, folder_id, favorite, totp_secret)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    entry.type,
                    entry.name,
                    entry.username || null,
                    entry.password || null,
                    entry.url || null,
                    entry.notes || null,
                    entry.folder_id || null,
                    entry.favorite || false,
                    entry.totp_secret || null
                ]);
            }
            console.log(`Seeded ${entries.length} vault entries.`);

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        // Close pool to allow script to exit
        await pool.end();
    }
};

seedData();
