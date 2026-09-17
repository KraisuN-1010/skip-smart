import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const ENV = {
  SUPABASE_CONNECTION_STRING: process.env.SUPABASE_CONNECTION_STRING,
}