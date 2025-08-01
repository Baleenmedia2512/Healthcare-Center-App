#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Setup script for healthcare-center-app
 * Prepares the application for deployment on Vercel with Supabase
 */

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Helper functions
const logStep = (step) => console.log(`\n${colors.bright}${colors.cyan}[SETUP] ${step}${colors.reset}`);
const logSuccess = (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`);
const logWarning = (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`);
const logError = (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`);

// Main setup function
async function setupApp() {
  try {
    console.log(`\n${colors.bright}${colors.green}====================================${colors.reset}`);
    console.log(`${colors.bright}${colors.green} Healthcare Center App Setup${colors.reset}`);
    console.log(`${colors.bright}${colors.green}====================================${colors.reset}\n`);
    
    // Check for environment variables
    logStep('Checking environment variables...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      logWarning(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
      logWarning('Please ensure these are set in your .env file or deployment environment');
    } else {
      logSuccess('All required environment variables are present');
    }
    
    // Install dependencies
    logStep('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('Dependencies installed');
    
    // Generate Prisma client
    logStep('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    logSuccess('Prisma client generated');
    
    // Initialize storage directories
    logStep('Initializing storage directories...');
    try {
      const storageDir = path.join(process.cwd(), 'public', 'uploads', 'clinic-assets');
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      
      const logosDir = path.join(storageDir, 'logos');
      if (!fs.existsSync(logosDir)) {
        fs.mkdirSync(logosDir, { recursive: true });
      }
      
      const faviconsDir = path.join(storageDir, 'favicons');
      if (!fs.existsSync(faviconsDir)) {
        fs.mkdirSync(faviconsDir, { recursive: true });
      }
      
      logSuccess('Storage directories created');
    } catch (error) {
      logWarning(`Error creating storage directories: ${error.message}`);
    }
    
    // Build the application
    logStep('Building the application...');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Application built successfully');
    
    console.log(`\n${colors.bright}${colors.green}====================================${colors.reset}`);
    console.log(`${colors.bright}${colors.green} Setup Complete${colors.reset}`);
    console.log(`${colors.bright}${colors.green}====================================${colors.reset}\n`);
    console.log(`You can now start the application with ${colors.bright}npm start${colors.reset}`);
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
setupApp();
