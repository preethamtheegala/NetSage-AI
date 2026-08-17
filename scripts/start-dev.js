/**
 * NetSage AI — One-Command Startup Orchestrator
 * Validates dependencies, checks MongoDB, and concurrently boots all 3 microservices.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const concurrently = require('concurrently');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const ROOT_DIR = path.resolve(__dirname, '..');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/netsage-ai';
const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';

async function preflightCheck() {
  console.log('\n🔍 Running NetSage AI Pre-flight System Checks...');

  // 1. Check Node.js
  const nodeVer = process.version;
  const major = parseInt(nodeVer.slice(1).split('.')[0], 10);
  if (major < 18) {
    console.error(`❌ Node.js version >= 18 required. Current: ${nodeVer}`);
    process.exit(1);
  }
  console.log(`  ✅ Node.js: ${nodeVer}`);

  // 2. Check Python 3
  try {
    const pyVer = execSync('python3 --version', { encoding: 'utf8' }).trim();
    console.log(`  ✅ Python: ${pyVer}`);
  } catch (err) {
    console.error('❌ Python 3 is not found in PATH. Please install Python 3.9+.');
    process.exit(1);
  }

  // 3. Check MongoDB Connectivity
  console.log(`  ⏳ Checking MongoDB connection (${MONGODB_URI})...`);
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
    console.log('  ✅ MongoDB: Connected successfully');

    // Check if database needs auto-seeding
    const collections = await mongoose.connection.db.listCollections({ name: 'troubleshootingcases' }).toArray();
    let count = 0;
    if (collections.length > 0) {
      count = await mongoose.connection.db.collection('troubleshootingcases').countDocuments();
    }

    if (count === 0) {
      console.log('  🌱 Database is empty. Auto-seeding 35 sample cases...');
      await mongoose.disconnect();
      execSync('npm run seed --prefix backend', { stdio: 'inherit', cwd: ROOT_DIR });
    } else {
      console.log(`  ✅ Database contains ${count} troubleshooting cases (Data preserved).`);
      await mongoose.disconnect();
    }
  } catch (err) {
    console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ MongoDB is not running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please start your MongoDB service and run 'npm run dev' again.

• macOS (Homebrew):
  brew services start mongodb/brew/mongodb-community@7.0

• Linux (systemd):
  sudo systemctl start mongod

• Docker:
  docker run -d -p 27017:27017 --name netsage-mongo mongo:7.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    process.exit(1);
  }
}

async function waitForServices() {
  const checkUrl = async (url) => {
    try {
      const res = await axios.get(url, { timeout: 1500 });
      return res.status >= 200 && res.status < 400;
    } catch {
      return false;
    }
  };

  let pyReady = false;
  let backendReady = false;
  let frontendReady = false;
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts && (!pyReady || !backendReady || !frontendReady)) {
    await new Promise((r) => setTimeout(r, 1000));
    if (!pyReady) pyReady = await checkUrl('http://localhost:5002/health');
    if (!backendReady) backendReady = await checkUrl('http://localhost:5001/health');
    if (!frontendReady) frontendReady = await checkUrl('http://localhost:5173');
    attempts++;
  }

  if (pyReady && backendReady && frontendReady) {
    console.log(`
======================================================
🎉  NETSAGE AI IS READY
======================================================

  🌐 Frontend:            http://localhost:5173
  ⚙️  Backend API:         http://localhost:5001
  🔧 Python Rule Checker: http://localhost:5002
  🗄️  MongoDB:             Connected (${MONGODB_URI})
  🤖 AI Provider:         ${AI_PROVIDER.toUpperCase()} ${AI_PROVIDER === 'gemini' ? '(Google Gemini)' : '(Demo Mode)'}

  Open your browser to:   http://localhost:5173
======================================================
`);
  }
}

async function start() {
  await preflightCheck();

  console.log('\n🚀 Starting all NetSage AI microservices...\n');

  const { result } = concurrently(
    [
      {
        command: 'python3 app.py',
        name: 'RULE-CHECKER',
        cwd: path.join(ROOT_DIR, 'python_checker'),
        prefixColor: 'cyan',
      },
      {
        command: 'node server.js',
        name: 'BACKEND',
        cwd: path.join(ROOT_DIR, 'backend'),
        prefixColor: 'green',
      },
      {
        command: 'npm run dev',
        name: 'FRONTEND',
        cwd: path.join(ROOT_DIR, 'frontend'),
        prefixColor: 'magenta',
      },
    ],
    {
      prefix: '[{name}]',
      killOthers: ['failure', 'success'],
      restartTries: 0,
    }
  );

  // Poll in background for health readiness banner
  waitForServices();

  result.catch((err) => {
    // Process exited
  });
}

start();
