#!/usr/bin/env node

const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const generateResetToken = async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node generate-reset-token.js <username>');
    console.log('\nExample:');
    console.log('  node generate-reset-token.js john_doe');
    process.exit(1);
  }

  const username = args[0];
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Find user by username
    console.log(`🔍 Looking up user: ${username}`);
    const userResult = await client.query(
      'SELECT id, username, email, is_active FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ User not found: ${username}`);
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`✅ Found user: ${user.username} (${user.email})`);
    console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}\n`);

    if (!user.is_active) {
      console.log('⚠️  Warning: This user account is inactive');
    }

    // Delete existing reset tokens for this user
    console.log('🗑️  Clearing existing reset tokens...');
    await client.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [user.id]
    );

    // Generate new reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    console.log('🔐 Generating new reset token...');
    await client.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES ($1, $2, $3, $4)',
      [user.id, token, expiresAt, false]
    );

    console.log('✅ Reset token generated!\n');
    console.log('═'.repeat(80));
    console.log('PASSWORD RESET TOKEN');
    console.log('═'.repeat(80));
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Token: ${token}`);
    console.log(`Expires At: ${expiresAt.toISOString()}`);
    console.log(`Expires In: 1 hour`);
    console.log('═'.repeat(80));
    console.log('\n📝 Instructions for user:');
    console.log('1. Go to: /forgot-password');
    console.log('2. Paste this token in the "Reset Token" field');
    console.log('3. Click "Continue to Reset Password"');
    console.log('4. Enter new password and confirm\n');
    console.log('⏰ Token will expire in 1 hour if not used\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Database connection closed');
  }
};

generateResetToken();
