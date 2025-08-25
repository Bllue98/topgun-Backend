import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { encrypt } from 'src/utils/encryption';

dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const addSecret = (key: string, value: string): void => {
  const encryptedValue = encrypt(value);
  const envFilePath = path.resolve(process.cwd(), '.env');
  const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
  envConfig[key] = encryptedValue;
  const envString = Object.entries(envConfig)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  fs.writeFileSync(envFilePath, envString);
  console.log(`Secret added: ${key}`);
};

// Usage: ts-node src/scripts/addSecret.ts <KEY> <VALUE>
const [key, value] = process.argv.slice(2);
if (!key || !value) {
  console.error('Usage: ts-node src/scripts/addSecret.ts <KEY> <VALUE>');
  throw new Error('Missing key or value');
}
addSecret(key, value);
