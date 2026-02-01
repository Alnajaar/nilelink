const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nilelink',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
});

console.log('Attempting to connect with:', {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nilelink',
    port: parseInt(process.env.DB_PORT || '5432'),
    password: (process.env.DB_PASSWORD || 'password') ? '****' : 'none'
});

pool.connect()
    .then(client => {
        console.log('✅ Connection successful!');
        return client.query('SELECT NOW()')
            .then(res => {
                console.log('Query successful:', res.rows[0]);
                client.release();
                process.exit(0);
            })
            .catch(e => {
                console.error('❌ Query failed:', e);
                client.release();
                process.exit(1);
            });
    })
    .catch(e => {
        console.error('❌ Connection failed:', e);
        process.exit(1);
    });
