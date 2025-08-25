import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { decrypt } from 'src/utils/encryption';

dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const envFilePath = path.resolve(process.cwd(), '.env');
const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
const decryptedEnv: Record<string, string> = {};

// Preserve the original lines including comments and empty lines
const lines = envFileContent.split('\n');

const decryptedLines = lines.map((line) => {
  if (line.trim() === '' || line.trim().startsWith('#')) {
    return line;
  }
  const [key, value] = line.split('=');
  if (key && value !== undefined) {
    const decryptedValue = decrypt(value);
    decryptedEnv[key] = decryptedValue;
    return `${key}=${decryptedValue}`;
  }
  return line;
});

const decryptedEnvString = decryptedLines.join('\n');

fs.writeFileSync(envFilePath, decryptedEnvString);
console.log('All environment variables have been decrypted.');
