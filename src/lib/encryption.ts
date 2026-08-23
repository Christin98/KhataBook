/**
 * KhataKithab Client-Side Encryption Module
 *
 * Uses AES-256-GCM via the browser built-in Web Crypto API.
 * Keys are derived per-user using PBKDF2 from their Firebase UID.
 * No encryption keys are ever stored - derived fresh each session.
 */

const APP_SALT = 'KhataKithab_AES256_Salt_v1';

export const ENCRYPTED_FIELDS: Record<string, string[]> = {
  transactions: ['amount', 'description', 'notes', 'paymentMethod'],
  accounts: ['currentBalance', 'openingBalance', 'name', 'bankName'],
  creditCards: ['creditLimit', 'currentOutstanding', 'minimumDue', 'annualFee'],
  loans: ['principal', 'outstandingPrincipal', 'emiAmount', 'lender'],
  emis: ['purchaseAmount', 'emiAmount', 'principalAmount', 'downPayment'],
  budgets: ['monthlyLimit', 'spent'],
  goals: ['targetAmount', 'currentAmount', 'name'],
  reminders: ['amount', 'title', 'notes'],
  circleExpenses: ['amount', 'title', 'notes'],
  settlements: ['amount', 'notes']
};

const ENC_PREFIX = 'enc:';

export async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(APP_SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptValue(key: CryptoKey, value: string | number): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = encoder.encode(String(value));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return ENC_PREFIX + ivB64 + ':' + ctB64;
}

export async function decryptValue(key: CryptoKey, encrypted: string): Promise<string> {
  if (!encrypted.startsWith(ENC_PREFIX)) return encrypted;
  const payload = encrypted.slice(ENC_PREFIX.length);
  const colonIdx = payload.indexOf(':');
  const ivB64 = payload.slice(0, colonIdx);
  const ctB64 = payload.slice(colonIdx + 1);
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

export async function encryptFields(
  data: Record<string, any>,
  fields: string[],
  key: CryptoKey
): Promise<Record<string, any>> {
  const result = { ...data };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = await encryptValue(key, result[field]);
    }
  }
  return result;
}

export async function decryptFields(
  data: Record<string, any>,
  fields: string[],
  key: CryptoKey
): Promise<Record<string, any>> {
  const result = { ...data };
  for (const field of fields) {
    if (typeof result[field] === 'string' && result[field].startsWith(ENC_PREFIX)) {
      const decrypted = await decryptValue(key, result[field]);
      result[field] = isNaN(Number(decrypted)) ? decrypted : Number(decrypted);
    }
  }
  return result;
}

export function isEncrypted(value: any): boolean {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX);
}