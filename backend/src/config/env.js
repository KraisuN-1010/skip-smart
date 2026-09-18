import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const ENV = {
  SUPABASE_CONNECTION_STRING: process.env.SUPABASE_CONNECTION_STRING,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
}