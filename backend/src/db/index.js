import { pool } from '../config/db.js';


/**
 * For single-statement queries. Grabs whichever client is free in the pool —
 * fine here since there's no multi-statement state to preserve.
 */
export const query = async (text, params = []) => {
    try {
        return await pool.query(text, params);
    } catch (err) {
        console.error('Query error:', err.message);
        throw err;
    }
}

/**
 * For anything that needs multiple statements to succeed or fail together
 * (creating a subject + its slots + its counters, bulk-inserting simulation
 * skips, etc). Checks out ONE client and runs every query in the callback
 * on that same client, so BEGIN/COMMIT/ROLLBACK apply to the same session.
 *
 * Usage:
 *   await withTransaction(async (client) => {
 *       const { rows } = await client.query('INSERT INTO subjects (...) VALUES (...) RETURNING id', [...]);
 *       await client.query('INSERT INTO subject_slots (...) VALUES (...)', [...]);
 *       return rows[0].id;
 *   });
 */
export const withTransaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Transaction rolled back:', err.message);
        throw err;
    } finally {
        client.release();
    }
}
