#!/usr/bin/env node

/**
 * TestSprite Test Runner
 * 
 * This script helps run TestSprite tests by:
 * 1. Starting the dev server if not running
 * 2. Providing the correct URL for TestSprite web interface
 * 3. Running basic health checks
 */

import { spawn } from 'child_process';
import http from 'http';
import fetch from 'node-fetch';

const DEV_PORT = 8080;
const DEV_URL = `http://localhost:${DEV_PORT}`;

async function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(DEV_URL, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startDevServer() {
  console.log('🚀 Starting development server...');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });

  // Wait for server to start
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    if (await checkServerRunning()) {
      console.log(`✅ Development server is running at ${DEV_URL}`);
      return devProcess;
    }
    
    console.log(`⏳ Waiting for server to start... (${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new Error('Failed to start development server');
}

async function runBasicTests() {
  console.log('🧪 Running basic health checks...');
  
  try {
    const response = await fetch(DEV_URL);
    if (response.ok) {
      console.log('✅ Server is responding correctly');
      
      const html = await response.text();
      if (html.includes('<html') || html.includes('<!DOCTYPE')) {
        console.log('✅ Server is serving HTML content');
      } else {
        console.log('⚠️  Server response may not be HTML');
      }
    } else {
      console.log(`❌ Server returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }
}

async function main() {
  console.log('🎯 TestSprite Test Runner');
  console.log('========================');
  
  try {
    // Check if server is already running
    if (await checkServerRunning()) {
      console.log(`✅ Development server is already running at ${DEV_URL}`);
    } else {
      const devProcess = await startDevServer();
      
      // Keep the process running
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down development server...');
        devProcess.kill();
        process.exit(0);
      });
    }
    
    // Run basic tests
    await runBasicTests();
    
    console.log('\n📋 TestSprite Configuration:');
    console.log(`   Project Root: ${process.cwd()}`);
    console.log(`   Start URL: ${DEV_URL}`);
    console.log(`   Test Config: testsprite.config.json`);
    console.log(`   API Key: Configured in TestSprite CLI`);
    
    console.log('\n🌐 Next Steps:');
    console.log('   1. Open TestSprite web interface');
    console.log(`   2. Use URL: ${DEV_URL}`);
    console.log('   3. Run your tests through the web interface');
    console.log('   4. Or try: npm run test:e2e (if CLI issues are resolved)');
    
    // Keep the script running
    console.log('\n⏳ Press Ctrl+C to stop the development server...');
    await new Promise(() => {}); // Keep running indefinitely
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

export { checkServerRunning, startDevServer, runBasicTests };
