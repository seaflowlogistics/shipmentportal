const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

const updateAdminPassword = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? {
      rejectUnauthorized: true,
      ca: require('fs').readFileSync(process.env.DATABASE_CA_CERT).toString(),
    } : false,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Generate proper password hash for "Admin@123"
    const password = 'Admin@123';
    console.log(`🔐 Generating password hash for: ${password}`);
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(`✅ Hash generated: ${passwordHash.substring(0, 20)}...\n`);

    // Update admin user
    console.log('📝 Updating admin user password...');
    const result = await client.query(
      `UPDATE users 
       SET password_hash = $1, must_change_password = true 
       WHERE username = 'admin'
       RETURNING username, email, role`,
      [passwordHash]
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin user updated successfully!');
      console.log(`   Username: ${result.rows[0].username}`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Role: ${result.rows[0].role}`);
      console.log(`\n🔑 Login Credentials:`);
      console.log(`   Username: admin`);
      console.log(`   Password: Admin@123`);
      console.log(`\n⚠️  Please change this password after first login!`);
    } else {
      console.log('❌ Admin user not found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed');
  }
};

updateAdminPassword();
