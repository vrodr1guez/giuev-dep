#!/usr/bin/env node

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

// Ensure necessary esbuild dependencies
const dependencies = [
  'esbuild',
  'esbuild-node-externals'
];

console.log('Checking esbuild dependencies...');

let needsInstall = false;

// Check if each dependency is installed
dependencies.forEach(dep => {
  try {
    const modulePath = join(process.cwd(), 'node_modules', dep);
    if (!existsSync(modulePath)) {
      console.log(`Missing dependency: ${dep}`);
      needsInstall = true;
    }
  } catch (error) {
    console.log(`Error checking dependency ${dep}:`, error.message);
    needsInstall = true;
  }
});

// Install missing dependencies
if (needsInstall) {
  console.log('Installing missing esbuild dependencies...');
  try {
    execSync('npm install --save-dev ' + dependencies.join(' '), {
      stdio: 'inherit'
    });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('All esbuild dependencies are already installed.');
}

console.log('esbuild setup complete.'); 