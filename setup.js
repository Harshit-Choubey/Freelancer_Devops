#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Freelance Marketplace...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 14) {
  console.error('❌ Node.js version 14 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Create necessary directories
const directories = ['uploads', 'logs'];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found');
  console.log('   Please create a .env file with the following variables:');
  console.log('   - DATABASE_URL');
  console.log('   - JWT_SECRET');
  console.log('   - EMAIL_USER');
  console.log('   - EMAIL_PASS');
  console.log('   See .env file for example configuration\n');
} else {
  console.log('✅ .env file found');
}

// Install dependencies if node_modules doesn't exist
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    console.error('   Please run: npm install');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed');
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma client');
  console.error('   Please run: npx prisma generate');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Configure your .env file with database and email settings');
console.log('2. Push database schema: npm run db:push');
console.log('3. Start the development server: npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\nFor more information, see README.md');