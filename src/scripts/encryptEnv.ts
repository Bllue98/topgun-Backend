import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { encrypt } from 'src/utils/encryption';

dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const envFilePath = path.resolve(process.cwd(), '.env');
const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
const encryptedEnv: Record<string, string> = {};

// Preserve the original lines including comments and empty lines
const lines = envFileContent.split('\n');

const encryptedLines = lines.map((line) => {
  if (line.trim() === '' || line.trim().startsWith('#')) {
    return line;
  }
  const [key, value] = line.split('=');
  if (key && value !== undefined) {
    const encryptedValue = encrypt(value);
    encryptedEnv[key] = encryptedValue;
    return `${key}=${encryptedValue}`;
  }
  return line;
});

const encryptedEnvString = encryptedLines.join('\n');

fs.writeFileSync(envFilePath, encryptedEnvString);
console.log('All environment variables have been encrypted.');
