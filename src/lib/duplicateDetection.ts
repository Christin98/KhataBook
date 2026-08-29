import { Transaction, TransactionType } from './types';
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

/**
 * Fast, deterministic FNV-1a hash function for strings
 */
function fnv1a(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return hash.toString(36);
}

/**
 * Normalize and generate a unique deterministic fingerprint for a transaction.
 * Any identical entry with matching core attributes (type, amount, date, account, category, description)
 * produces the exact same fingerprint.
 */
export function generateTransactionFingerprint(txn: {
  userId?: string;
  type: TransactionType;
  amount: number;
  date: string;
  accountId: string;
  toAccountId?: string;
  category?: string;
  description?: string;
}): string {
  const normType = (txn.type || 'expense').trim().toLowerCase();
  const normAmount = Number(txn.amount || 0).toFixed(2);
  const normDate = (txn.date || '').trim().substring(0, 10);
  const normAccount = (txn.accountId || '').trim();
  const normToAccount = (txn.toAccountId || '').trim();
  const normCategory = (txn.category || '').trim().toLowerCase();
  const normDesc = (txn.description || '').trim().toLowerCase();
  const normUser = (txn.userId || 'user').trim();

  const rawKey = `${normUser}|${normType}|${normAmount}|${normDate}|${normAccount}|${normToAccount}|${normCategory}|${normDesc}`;
  return `fp_${fnv1a(rawKey)}`;
}

/**
 * Custom Error thrown when a duplicate transaction is detected
 */
export class DuplicateTransactionError extends Error {
  isDuplicate: boolean;
  duplicateOf?: Transaction;

  constructor(message: string, duplicateOf?: Transaction) {
    super(message);
    this.name = 'DuplicateTransactionError';
    this.isDuplicate = true;
    this.duplicateOf = duplicateOf;
  }
}

/**
 * Centralized duplicate detection checker against existing in-memory transactions.
 */
export function checkDuplicateTransaction(
  newTxn: Omit<Transaction, 'id' | 'createdAt'>,
  existingTransactions: Transaction[]
): { isDuplicate: boolean; duplicateOf?: Transaction; reason?: string } {
  const newFingerprint = generateTransactionFingerprint(newTxn);

  const duplicate = existingTransactions.find((existing) => {
    const existingFp = existing.fingerprint || generateTransactionFingerprint(existing);
    return existingFp === newFingerprint;
  });

  if (duplicate) {
    const formattedAmount = `₹${Number(newTxn.amount).toLocaleString('en-IN')}`;
    return {
      isDuplicate: true,
      duplicateOf: duplicate,
      reason: `A duplicate transaction for ${formattedAmount} on ${newTxn.date} with description "${newTxn.description || newTxn.category}" already exists in this account.`
    };
  }

  return { isDuplicate: false };
}

/**
 * Unique Database Constraint: Check if transaction fingerprint exists in Firestore
 */
export async function checkFirestoreFingerprintConstraint(
  userId: string,
  fingerprint: string
): Promise<boolean> {
  if (!db || !userId || !fingerprint) return false;
  try {
    const fpRef = doc(db, 'users', userId, 'transaction_fingerprints', fingerprint);
    const snap = await getDoc(fpRef);
    return snap.exists();
  } catch (e) {
    console.warn('Firestore fingerprint check note:', e);
    return false;
  }
}

/**
 * Unique Database Constraint: Save fingerprint in Firestore
 */
export async function saveFirestoreFingerprintConstraint(
  userId: string,
  fingerprint: string,
  txnId: string
): Promise<void> {
  if (!db || !userId || !fingerprint) return;
  try {
    const fpRef = doc(db, 'users', userId, 'transaction_fingerprints', fingerprint);
    await setDoc(fpRef, {
      fingerprint,
      txnId,
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Firestore fingerprint write note:', e);
  }
}

/**
 * Unique Database Constraint: Remove fingerprint from Firestore on deletion
 */
export async function deleteFirestoreFingerprintConstraint(
  userId: string,
  fingerprint: string
): Promise<void> {
  if (!db || !userId || !fingerprint) return;
  try {
    const fpRef = doc(db, 'users', userId, 'transaction_fingerprints', fingerprint);
    await deleteDoc(fpRef);
  } catch (e) {
    console.warn('Firestore fingerprint delete note:', e);
  }
}
