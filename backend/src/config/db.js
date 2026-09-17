import pg from 'pg';
import { ENV } from './env.js';
const { Pool } = pg;

export const pool = new Pool({
    connectionString: ENV.SUPABASE_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});