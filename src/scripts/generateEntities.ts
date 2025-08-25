/* eslint-disable no-console */
/* eslint-disable security/detect-child-process */
import 'reflect-metadata';
import path from 'node:path';
import { spawn } from 'node:child_process';
import config from 'src/config/config';

// Contract:
// - Reads DB settings from src/config/config.ts (.env)
// - Invokes typeorm-model-generator to produce entities for MSSQL
// - Outputs to src/entities/_generated
// - Keeps existing entities untouched

const outDir = path.resolve(process.cwd(), 'src', 'entities', '_generated');

const defaultSkips = 'users,migrations';
const skipTables = process.env['SKIP_TABLES'] ?? defaultSkips; // avoid colliding with existing manual entity by default

const args = [
  'typeorm-model-generator',
  '-e',
  'mssql',
  '-h',
  config.database.host,
  '-p',
  String(config.database.port ?? 1433),
  '-d',
  config.database.database,
  '-u',
  config.database.user,
  '-x',
  config.database.password,
  '-s',
  'dbo',
  '--noConfig',
  '--skipSchema',
  '--cf',
  'pascal',
  '--ce',
  'pascal',
  '--cp',
  'camel',
  '--eol',
  'LF',
  '--strictMode',
  '?',
  ...(skipTables ? ['--skipTables', skipTables] : []),
  '-o',
  outDir
];

console.log('Generating entities into:', outDir);
const child = spawn('npx', args, {
  stdio: 'inherit',
  env: process.env,
  shell: true // ensure it resolves on Windows bash/cmd
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('Entity generation finished successfully.');
  } else {
    throw new Error(`Entity generation failed with code ${code}.`);
  }
});
