const { Client } = require('pg');
require('dotenv').config();

const testConnection = async () => {
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
    console.log('✅ Connected successfully!\n');

    // List all tables
    console.log('📋 Listing all tables:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in the database!');
    } else {
      console.log(`Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }

    // Check if users table exists and count rows
    console.log('\n👥 Checking users table:');
    try {
      const usersCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`  Users count: ${usersCount.rows[0].count}`);
      
      const users = await client.query('SELECT username, email, role FROM users LIMIT 5');
      console.log('  Sample users:');
      users.rows.forEach(user => {
        console.log(`    - ${user.username} (${user.email}) - ${user.role}`);
      });
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed');
  }
};

testConnection();
