import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function seed(): Promise<void> {
  // Connect directly for seeding — first try to create the database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
  });

  try {
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'ledger_db';
    const dbCheck = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );
    if (dbCheck.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Created database "${dbName}"`);
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    }
  } catch (err: any) {
    console.error('⚠️  Database creation check:', err.message);
  } finally {
    await adminPool.end();
  }

  // Now connect to the actual database
  const { initializeDatabase, default: pool } = await import('./setup');
  await initializeDatabase();

  // Check if already seeded
  const existingUsers = await pool.query('SELECT COUNT(*) as count FROM users');
  if (parseInt(existingUsers.rows[0].count) > 0) {
    console.log('⚠️  Database already seeded. Skipping...');
    await pool.end();
    return;
  }

  const passwordHash = bcrypt.hashSync('password123', 10);

  // Insert users
  const users = [
    ['Venkatareddy26', 'thor47222@gmail.com', passwordHash, 'admin', 'active', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyNNSmxRlcMZ4NBnplMe9mQmATig1KI9zeWK6acMO6nFweCL94jv5ewztqQFEhK-5vWYu49j6ESfzP7Q4sJ2I3up8XkJZ-zcuj3iJTd91I4vXJ3mZHj_we2JyjCBch8lVa2CUxOj1u_KcxgDicrbS1g1iRDxBpDGzvUmUjdIfxmFOly8NjTspVmbSI2jmdsIs9RddhV04ZQ2O5KliMr2j3kAqWq7rPbeokdOHCFjHvT0i-rbVhUUbAlnXDErZSzcVVhoCa9sOzFdY'],
    ['Sarah Chen', 's.chen@ledger.arch', passwordHash, 'analyst', 'active', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAw91l13C0-Lo6RV6i7F7ta_xEAgo3CZTgG5Vg5FWGw6XIEtVuKh4vuI-x2mSnr8wfYjXAWcFGBjXQXip4w24J2if0PBUa0rNmFfibkgCgt9kqd0k3gX7lf4bhnqzfVc8ztwSCGjqAVpsGfsTMhvfPRF2KC5pHC_KlaCZAL8xGueVG3tmQPKoYxVu1X2_NiAegczKK__-C3LP7mnycCBJyYQrDou5Iftp7X_8H-pRpqn-PA5fc-G2SVCftxMWA4G4NrrE0T6MFUDLo'],
    ['Marcus Thorne', 'm.thorne@partner.com', passwordHash, 'viewer', 'inactive', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5Povac2k2vCN4KnpQRPq0d6YRJqzHTphrhm0fKgfu7zjEsR7czZc9B-FRUY5boVuggDfEEgiKzdAaX4cc95wg4xFOZW4gsLNPKfKOhgZzCDCgXhZhtocOrZ3_b0ulmw0jnVcNt_x6BXMo4Oek294IOr7c8TfiVpXR-MrisdxVzJs43XpK6LIW9vGjZHHqpJFsUy5XWnAFvhmxwwP_Mkrci-nCdi6mVCegFZ7PVYyIwfSladiPIaV5QRswYayWbDnfTouvQuH-aHQ'],
    ['Elara Mist', 'e.mist@ledger.arch', passwordHash, 'analyst', 'active', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnYLWwW5F05zksKbssUBMEvHGCMVvIgR3xeA5Xyfu-ShQRlgHYfNMTGIoUO6p3HmymW5UG4QkfwnxlGg3C06C17QXKaeNeVBL6L2nuNbgNUiypJP3GgXkRxFjTiwkHN55EZ3LDQh3oBm1KmUS8QTqoxPd5OY5TPDlZVy2Z2M3laeHtpKqegx-ewuyppuwwPUJs-jVS8IpZtpWvRGCtvcdJX-zqdW1SphDSuT8oeUJr-ceFn8y9nwC4lcWOQPgTpLA0Uvg-kB290jA'],
  ];

  for (const u of users) {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status, avatar_url) VALUES ($1, $2, $3, $4, $5, $6)',
      u
    );
  }
  console.log('✅ Seeded 4 users');

  // Insert financial records
  const records = [
    [1, 12400.00, 'income', 'Treasury', '2024-11-28', 'Treasury Transfer - Enterprise vault allocation', 'verified'],
    [1, 2150.00, 'expense', 'Operations', '2024-11-27', 'Operational Assets - Equipment and infrastructure', 'pending'],
    [1, 84900.00, 'expense', 'Payroll', '2024-10-24', 'Payroll Disbursement - Q4 salary processing', 'cleared'],
    [1, 8450.00, 'income', 'Salary', '2024-11-24', 'Monthly disbursement from TechCorp Ltd.', 'verified'],
    [1, 2100.00, 'expense', 'Housing', '2024-11-01', 'Main residence payment - Unit 4B', 'cleared'],
    [1, 342.15, 'expense', 'Lifestyle', '2024-11-22', 'Whole Foods Market - Organic Selection', 'verified'],
    [1, 1220.50, 'income', 'Investments', '2024-11-18', 'Quarterly payout - Vanguard Portfolio', 'verified'],
    [1, 188.40, 'expense', 'Lifestyle', '2024-11-15', 'Blue Hill Farm - Client Dinner', 'cleared'],
    [2, 5200.00, 'income', 'Consulting', '2024-11-20', 'Data analytics consulting - Quarter 4', 'verified'],
    [2, 890.00, 'expense', 'Software', '2024-11-19', 'Annual Tableau license renewal', 'verified'],
    [1, 15000.00, 'income', 'Treasury', '2024-11-10', 'Capital injection from primary fund', 'verified'],
    [1, 3200.00, 'expense', 'Marketing', '2024-11-08', 'Digital marketing campaign - November push', 'cleared'],
    [2, 1500.00, 'expense', 'Travel', '2024-11-05', 'Business travel - NYC client meetings', 'pending'],
    [1, 42150.00, 'income', 'Investments', '2024-10-30', 'Portfolio dividend distribution - Q3', 'verified'],
    [1, 7800.00, 'expense', 'Utilities', '2024-10-28', 'Enterprise infrastructure - cloud services', 'cleared'],
    [4, 3800.00, 'income', 'Consulting', '2024-11-25', 'Financial modeling advisory services', 'verified'],
    [4, 450.00, 'expense', 'Software', '2024-11-21', 'Bloomberg terminal monthly subscription', 'verified'],
  ];

  for (const r of records) {
    await pool.query(
      'INSERT INTO financial_records (user_id, amount, type, category, date, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      r
    );
  }
  console.log('✅ Seeded 17 financial records');
  console.log('🎉 Database seeding complete!');
  console.log('\n📋 Login credentials (all users):');
  console.log('   Password: password123');
  console.log('   Admin:   thor47222@gmail.com (Venkatareddy26)');
  console.log('   Analyst: s.chen@ledger.arch');
  console.log('   Viewer:  m.thorne@partner.com');
  console.log('   Analyst: e.mist@ledger.arch');

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
