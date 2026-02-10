import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { createRequire } from 'module';

const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const require_ = createRequire(resolve(projectRoot, 'package.json'));

console.log('=== Project Root ===');
console.log(projectRoot);

// Check .npmrc
console.log('\n=== .npmrc ===');
const npmrc = resolve(projectRoot, '.npmrc');
if (existsSync(npmrc)) {
  console.log(readFileSync(npmrc, 'utf8'));
} else {
  console.log('NOT FOUND');
}

// Check if .pnpm directory exists
const pnpmDir = resolve(projectRoot, 'node_modules', '.pnpm');
console.log('\n=== .pnpm store exists ===');
console.log(existsSync(pnpmDir));

// Check express versions
console.log('\n=== express ===');
try {
  const expressPath = require_.resolve('express/package.json');
  const expressPkg = JSON.parse(readFileSync(expressPath, 'utf8'));
  console.log(`Root resolve: ${expressPkg.version} at ${expressPath}`);
} catch (e) {
  console.log('Root: NOT FOUND -', e.message);
}

// Check the genkit-core nested express
const genkitExpressGlob = resolve(projectRoot, 'node_modules', '@genkit-ai', 'core', 'node_modules', 'express', 'package.json');
if (existsSync(genkitExpressGlob)) {
  const pkg = JSON.parse(readFileSync(genkitExpressGlob, 'utf8'));
  console.log(`@genkit-ai/core nested: ${pkg.version}`);
} else {
  console.log('@genkit-ai/core nested: NONE (uses hoisted)');
}

// Check import-in-the-middle versions  
console.log('\n=== import-in-the-middle ===');
try {
  const iitmPath = require_.resolve('import-in-the-middle/package.json');
  const iitmPkg = JSON.parse(readFileSync(iitmPath, 'utf8'));
  console.log(`Root resolve: ${iitmPkg.version} at ${iitmPath}`);
} catch (e) {
  console.log('Root: NOT FOUND -', e.message);
}

const otelIitm = resolve(projectRoot, 'node_modules', '@opentelemetry', 'instrumentation', 'node_modules', 'import-in-the-middle', 'package.json');
if (existsSync(otelIitm)) {
  const pkg = JSON.parse(readFileSync(otelIitm, 'utf8'));
  console.log(`@opentelemetry/instrumentation nested: ${pkg.version}`);
} else {
  console.log('@opentelemetry/instrumentation nested: NONE (uses hoisted)');
}

// List what's in .pnpm if it exists
if (existsSync(pnpmDir)) {
  console.log('\n=== .pnpm express entries ===');
  try {
    const entries = readdirSync(pnpmDir).filter(e => e.startsWith('express@'));
    entries.forEach(e => console.log(e));
    if (entries.length === 0) console.log('NONE');
  } catch (e) {
    console.log('Error reading .pnpm:', e.message);
  }
  
  console.log('\n=== .pnpm import-in-the-middle entries ===');
  try {
    const entries = readdirSync(pnpmDir).filter(e => e.startsWith('import-in-the-middle@'));
    entries.forEach(e => console.log(e));
    if (entries.length === 0) console.log('NONE');
  } catch (e) {
    console.log('Error reading .pnpm:', e.message);
  }
}

// Check next.js version
console.log('\n=== next.js ===');
try {
  const nextPath = require_.resolve('next/package.json');
  const nextPkg = JSON.parse(readFileSync(nextPath, 'utf8'));
  console.log(`Version: ${nextPkg.version}`);
} catch (e) {
  console.log('NOT FOUND');
}

// Check lock file type
console.log('\n=== Lock files ===');
console.log('pnpm-lock.yaml:', existsSync(resolve(projectRoot, 'pnpm-lock.yaml')));
console.log('package-lock.json:', existsSync(resolve(projectRoot, 'package-lock.json')));
console.log('yarn.lock:', existsSync(resolve(projectRoot, 'yarn.lock')));
