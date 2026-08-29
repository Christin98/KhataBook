import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { encryptFields, decryptFields, ENCRYPTED_FIELDS } from './encryption';
import {
  SAMPLE_ACCOUNTS,
  SAMPLE_TRANSACTIONS,
  SAMPLE_CIRCLES,
  SAMPLE_CIRCLE_EXPENSES,
  SAMPLE_SETTLEMENTS,
  SAMPLE_CREDIT_CARDS,
  SAMPLE_EMIS,
  SAMPLE_LOANS,
  SAMPLE_BUDGETS,
  SAMPLE_GOALS,
  SAMPLE_REMINDERS
} from './sampleData';
import { validateFinancialPayload, FinancialValidationError } from './moneySafe';

/**
 * Subscribe to a specific collection for a given user in Firestore.
 * Realtime callback receives array of documents.
 */
export function subscribeToUserCollection<T>(
  userId: string,
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (err: Error) => void,
  cryptoKey?: CryptoKey
): () => void {
  if (!db || !userId) {
    onUpdate([]);
    return () => {};
  }

  const fieldsToDecrypt = ENCRYPTED_FIELDS[collectionName] || [];

  try {
    const colRef = collection(db, 'users', userId, collectionName);
    const unsub = onSnapshot(
      colRef,
      async (snapshot) => {
        const rawDocs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as Record<string, any>[];

        if (cryptoKey && fieldsToDecrypt.length > 0) {
          const decrypted = await Promise.all(
            rawDocs.map((d) => decryptFields(d, fieldsToDecrypt, cryptoKey))
          );
          onUpdate(decrypted as T[]);
        } else {
          onUpdate(rawDocs as T[]);
        }
      },
      (error) => {
        console.warn(`Firestore subscription error for ${collectionName}:`, error);
        if (onError) onError(error);
      }
    );
    return unsub;
  } catch (e) {
    console.error(`Failed setting up Firestore listener for ${collectionName}:`, e);
    if (onError && e instanceof Error) onError(e);
    return () => {};
  }
}

/**
 * Recursively remove undefined values from objects/arrays before passing to Firestore setDoc()
 */
export function sanitizeFirestoreData(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val === undefined) {
      return; // Skip undefined fields
    }
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      clean[key] = sanitizeFirestoreData(val);
    } else if (Array.isArray(val)) {
      clean[key] = val.map((item) =>
        item !== null && typeof item === 'object' ? sanitizeFirestoreData(item) : item
      );
    } else {
      clean[key] = val;
    }
  });
  return clean;
}

/**
 * Save or update a document in a user's collection in Firestore.
 */
export async function saveUserDoc(
  userId: string,
  collectionName: string,
  docId: string,
  data: Record<string, any>,
  cryptoKey?: CryptoKey
): Promise<void> {
  if (!db || !userId || !docId) return;

  // Enforce financial validation and clean sanitization
  const validation = validateFinancialPayload(collectionName, data);
  if (!validation.isValid) {
    console.error(`Validation error in saveUserDoc for ${collectionName}:`, validation.errors);
    throw new FinancialValidationError(collectionName, validation.errors);
  }

  const docRef = doc(db, 'users', userId, collectionName, docId);
  let cleanData = sanitizeFirestoreData({ ...validation.sanitized, userId });
  const fieldsToEncrypt = ENCRYPTED_FIELDS[collectionName] || [];
  if (cryptoKey && fieldsToEncrypt.length > 0) {
    cleanData = sanitizeFirestoreData(await encryptFields(cleanData, fieldsToEncrypt, cryptoKey));
  }
  await setDoc(docRef, cleanData, { merge: true });
}

/**
 * Delete a document from a user's collection in Firestore.
 */
export async function deleteUserDoc(
  userId: string,
  collectionName: string,
  docId: string
): Promise<void> {
  if (!db || !userId || !docId) return;
  const docRef = doc(db, 'users', userId, collectionName, docId);
  await deleteDoc(docRef);
}

/**
 * Reset and clear all user data collections in Firestore (Clean Ledger).
 */
export async function clearUserFirestoreData(userId: string): Promise<void> {
  if (!db || !userId) return;

  const collectionNames = [
    'accounts',
    'transactions',
    'circles',
    'circleExpenses',
    'settlements',
    'creditCards',
    'emis',
    'loans',
    'budgets',
    'goals',
    'reminders'
  ];

  for (const colName of collectionNames) {
    const colRef = collection(db, 'users', userId, colName);
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
    }
  }
}

/**
 * RESTRICTED: Load sample demo data into user's Firestore (For developer testing only).
 */
export async function seedUserSampleData(userId: string): Promise<void> {
  if (!db || !userId) return;

  // Clear existing first
  await clearUserFirestoreData(userId);

  const batch = writeBatch(db);

  SAMPLE_ACCOUNTS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'accounts', item.id);
    batch.set(docRef, sanitizeFirestoreData({ ...item, userId }));
  });

  SAMPLE_TRANSACTIONS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'transactions', item.id);
    batch.set(docRef, sanitizeFirestoreData({ ...item, userId }));
  });

  SAMPLE_CIRCLES.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'circles', item.id);
    batch.set(docRef, sanitizeFirestoreData({ ...item, ownerId: userId }));
  });

  SAMPLE_CIRCLE_EXPENSES.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'circleExpenses', item.id);
    batch.set(docRef, sanitizeFirestoreData(item));
  });

  SAMPLE_SETTLEMENTS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'settlements', item.id);
    batch.set(docRef, sanitizeFirestoreData(item));
  });

  SAMPLE_CREDIT_CARDS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'creditCards', item.id);
    batch.set(docRef, sanitizeFirestoreData({ ...item, userId }));
  });

  SAMPLE_EMIS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'emis', item.id);
    batch.set(docRef, sanitizeFirestoreData(item));
  });

  SAMPLE_LOANS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'loans', item.id);
    batch.set(docRef, sanitizeFirestoreData({ ...item, userId }));
  });

  SAMPLE_BUDGETS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'budgets', item.id);
    batch.set(docRef, sanitizeFirestoreData({ ...item, userId }));
  });

  SAMPLE_GOALS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'goals', item.id);
    batch.set(docRef, sanitizeFirestoreData({ ...item, userId }));
  });

  SAMPLE_REMINDERS.forEach((item) => {
    const docRef = doc(db, 'users', userId, 'reminders', item.id);
    batch.set(docRef, sanitizeFirestoreData({ ...item, userId }));
  });

  await batch.commit();
}
