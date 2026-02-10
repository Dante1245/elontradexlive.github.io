import { execSync } from 'child_process';
import { rmSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(process.cwd());

// Show .npmrc contents
const npmrc = resolve(root, '.npmrc');
if (existsSync(npmrc)) {
  console.log('[v0] .npmrc contents:', readFileSync(npmrc, 'utf-8'));
}

// Remove node_modules entirely
const nm = resolve(root, 'node_modules');
if (existsSync(nm)) {
  console.log('[v0] Removing node_modules...');
  rmSync(nm, { recursive: true, force: true });
  console.log('[v0] node_modules removed.');
} else {
  console.log('[v0] node_modules does not exist.');
}

// Remove pnpm lock
const lock = resolve(root, 'pnpm-lock.yaml');
if (existsSync(lock)) {
  console.log('[v0] Removing pnpm-lock.yaml...');
  rmSync(lock);
}

// Reinstall
console.log('[v0] Running pnpm install...');
execSync('pnpm install --no-frozen-lockfile', { cwd: root, stdio: 'inherit' });

// Check what we got
console.log('\n[v0] Checking installed versions:');
const expressPath = resolve(root, 'node_modules/express/package.json');
if (existsSync(expressPath)) {
  const pkg = JSON.parse(readFileSync(expressPath, 'utf-8'));
  console.log('[v0] express@' + pkg.version + ' at root node_modules');
}

const iitmPath = resolve(root, 'node_modules/import-in-the-middle/package.json');
if (existsSync(iitmPath)) {
  const pkg = JSON.parse(readFileSync(iitmPath, 'utf-8'));
  console.log('[v0] import-in-the-middle@' + pkg.version + ' at root node_modules');
}

// Check if .pnpm store still exists
const pnpmStore = resolve(root, 'node_modules/.pnpm');
if (existsSync(pnpmStore)) {
  console.log('[v0] WARNING: .pnpm store still exists (node-linker=hoisted may not be active)');
} else {
  console.log('[v0] OK: No .pnpm store (node-linker=hoisted is active)');
}
