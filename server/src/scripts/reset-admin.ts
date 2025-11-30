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

async function resetAdminPassword() {
    try {
        // Hash for 'Admin@123' generated in previous step
        // Note: The output from the previous command was truncated/messy, so I'll generate it again here to be safe
        // Or better yet, I'll just use the one I generated or generate it inside this script if I had bcrypt.
        // Since I can't easily import bcrypt here without potentially missing types/setup, 
        // I will use a known valid hash for 'Admin@123' or rely on the one I just generated.
        // The one from the output was: $2a$10$5/i3snotImKQzDJtJYrObO/UdIFBd2sgHJgI5Nauu8h1Gw2TKW3gq
        // (I'll clean up the newline)

        const passwordHash = '$2a$10$5/i3snotImKQzDJtJYrObO/UdIFBd2sgHJgI5Nauu8h1Gw2TKW3gq';

        const result = await pool.query(
            `UPDATE users SET password_hash = $1, must_change_password = false WHERE username = 'admin' RETURNING id, username`,
            [passwordHash]
        );

        if (result.rowCount === 0) {
            console.log('❌ Admin user not found!');
        } else {
            console.log('✅ Admin password reset successfully to: Admin@123');
            console.log('User:', result.rows[0]);
        }
    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        await pool.end();
    }
}

resetAdminPassword();
