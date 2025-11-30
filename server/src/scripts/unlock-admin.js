#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

const runUnlock = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('🔓 Unlocking admin account...');
    await client.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE username = 'admin'`
    );
    console.log('✅ Admin account unlocked!');

    const result = await client.query(
      `SELECT username, failed_login_attempts, locked_until, is_active FROM users WHERE username = 'admin'`
    );

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('\nAdmin User Status:');
      console.log(`  Username: ${admin.username}`);
      console.log(`  Failed Attempts: ${admin.failed_login_attempts}`);
      console.log(`  Locked Until: ${admin.locked_until || 'Not locked'}`);
      console.log(`  Is Active: ${admin.is_active ? 'Yes' : 'No'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Database connection closed');
  }
};

runUnlock();
