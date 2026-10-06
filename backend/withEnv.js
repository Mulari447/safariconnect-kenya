#!/usr/bin/env node
// Load root .env, then run a command with the same env (for Prisma CLI, etc.)
require('./loadEnv');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node withEnv.js <command> [args...]');
  process.exit(1);
}

const result = spawnSync(args[0], args.slice(1), {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
