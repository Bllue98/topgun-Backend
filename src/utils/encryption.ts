import * as crypto from 'crypto';

const algorithm = 'aes-256-ctr';

// Using Base64 encoding to add an extra layer of obfuscation
const part1 = obfuscate(btoa('vOVH6sdmp'));
const part2 = obfuscate(btoa('NWjRRIqCc'));
const part3 = obfuscate(btoa('7rdxs01lwHzfr3'));

// This adds a prefix and reverses the string to make it less recognizable
function obfuscate(input: string): string {
  return 'OBF' + input.split('').reverse().join('');
}

// Function to reverse the obfuscation process
function deobfuscate(input: string): string {
  return input.slice(3).split('').reverse().join('');
}

// Decodes from Base64, reverses each part, and combines them
function getObfuscatedKey(): Buffer {
  const decodedPart1 = atob(deobfuscate(part1));
  const decodedPart2 = atob(deobfuscate(part2));
  const decodedPart3 = atob(deobfuscate(part3));

  const combinedKey =
    decodedPart1.split('').reverse().join('') +
    decodedPart2.split('').reverse().join('') +
    decodedPart3.split('').reverse().join('');
  return Buffer.from(combinedKey);
}

const iv = crypto.randomBytes(16);

// Encrypt function
export const encrypt = (text: string): string => {
  const secretKey = getObfuscatedKey();
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return 'ENC:' + iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt function
export const decrypt = (hash: string): string => {
  if (!hash.startsWith('ENC:')) {
    return hash;
  }

  // Remove the 'ENC:' prefix
  const encryptedString = hash.slice(4);

  const [ivHex, encryptedText] = encryptedString.split(':');
  if (!ivHex || !encryptedText) {
    throw new Error('Invalid encrypted format');
  }

  try {
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const secretKey = getObfuscatedKey();
    const decipher = crypto.createDecipheriv(algorithm, secretKey, ivBuffer);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    throw new Error('Decryption failed');
  }
};

function btoa(input: string): string {
  return Buffer.from(input).toString('base64');
}

function atob(input: string): string {
  return Buffer.from(input, 'base64').toString();
}
