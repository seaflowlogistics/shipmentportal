import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updateSchema() {
    try {
        console.log('🔄 Updating database schema...');

        const queries = [
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(255)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS invoice_item_count INTEGER`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS customs_r_form VARCHAR(255)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS bl_awb_no VARCHAR(255)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS container_no VARCHAR(255)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS container_type VARCHAR(255)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS cbm DECIMAL(10, 2)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(10, 2)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS package_count VARCHAR(255)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS cleared_date DATE`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expense_macl DECIMAL(10, 2)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expense_mpl DECIMAL(10, 2)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expense_mcs DECIMAL(10, 2)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expense_transportation DECIMAL(10, 2)`,
            `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expense_liner DECIMAL(10, 2)`
        ];

        for (const query of queries) {
            await pool.query(query);
            console.log(`✅ Executed: ${query}`);
        }

        console.log('🎉 Schema update completed successfully!');
    } catch (error) {
        console.error('❌ Error updating schema:', error);
    } finally {
        await pool.end();
    }
}

updateSchema();
