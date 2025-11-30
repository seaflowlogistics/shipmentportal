const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: require('fs').readFileSync(process.env.DATABASE_CA_CERT).toString()
  } : false
});

async function resetAdminPassword() {
  try {
    const newPassword = 'Admin@123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1, must_change_password = true 
       WHERE username = 'admin' 
       RETURNING username, email, role`,
      [passwordHash]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('User details:', result.rows[0]);
      console.log('\nYou can now login with:');
      console.log('  Username: admin');
      console.log('  Password: Admin@123');
    } else {
      console.log('❌ Admin user not found');
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetAdminPassword();
