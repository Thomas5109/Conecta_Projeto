import 'dotenv/config';
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL não foi definida.');
}

export const pool = new Pool({
    connectionString: databaseUrl,
});