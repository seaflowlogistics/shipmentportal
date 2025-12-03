import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';

dotenv.config();

// CockroachDB SSL configuration
const sslConfig = process.env.DATABASE_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: process.env.DATABASE_CA_CERT
        ? (() => {
            try {
                const certPath = process.env.DATABASE_CA_CERT.replace('~', os.homedir());
                return fs.readFileSync(certPath).toString();
            } catch (err) {
                console.warn('SSL certificate file not found, using default verification');
                return undefined;
            }
          })()
        : undefined,
} : false;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Test database connection
pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

export default pool;
