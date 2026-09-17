import { pool } from '../config/db.js';

try {
    const { rows } = await pool.query('SELECT now(), current_database()');
    console.log('Connected:', rows[0]);
} catch (err) {
    console.error('Failed:', err.message);
} finally {
    await pool.end();
}