'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Account,
  Transaction,
  Circle,
  CircleExpense,
  Settlement,
  CreditCard,
  EMI,
  Loan,
  Budget,
  Goal,
  Reminder
} from '@/lib/types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  FirebaseUser
} from '@/lib/firebase';
import {
  subscribeToUserCollection,
  saveUserDoc,
  deleteUserDoc,
  clearUserFirestoreData,
  seedUserSampleData
} from '@/lib/firebaseSync';
import { deriveKey } from '@/lib/encryption';
import {
  SAMPLE_USER,
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
} from '@/lib/sampleData';

interface DataContextType {
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isDevMode: boolean;
  setIsDevMode: (dev: boolean) => void;
  accounts: Account[];
  transactions: Transaction[];
  circles: Circle[];
  circleExpenses: CircleExpense[];
  settlements: Settlement[];
  creditCards: CreditCard[];
  emis: EMI[];
  loans: Loan[];
  budgets: Budget[];
  goals: Goal[];
  reminders: Reminder[];
  categories: string[];
  isDemoMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  
  // Auth Methods
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;

  // Data Handlers
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (categoryName: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  addCircle: (circle: Omit<Circle, 'id' | 'createdAt' | 'totalExpenses' | 'settledAmount' | 'outstandingAmount' | 'inviteCode'>) => void;
  addCircleExpense: (expense: Omit<CircleExpense, 'id' | 'createdAt'>) => void;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  addEMI: (emi: Omit<EMI, 'id' | 'createdAt'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, currentAmount: number) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  markReminderPaid: (id: string) => void;
  
  // Clean Ledger & Developer Seeding
  resetToCleanLedger: () => Promise<void>;
  loadSampleDemoData: () => Promise<void>;
}

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Lifestyle',
  'Financial',
  'Salary',
  'Groceries',
  'Rent',
  'Fuel',
  'Subscriptions',
  'EMI',
  'Medical',
  'Education',
  'Investments',
  'Entertainment',
  'Personal Care'
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'guest',
    email: 'guest@khatakithab.app',
    displayName: 'Guest User',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    createdAt: new Date().toISOString()
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [circleExpenses, setCircleExpenses] = useState<CircleExpense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [emis, setEmis] = useState<EMI[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | undefined>(undefined);

  // 1. Listen to Firebase Authentication state
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        setUser({
          id: fUser.uid,
          email: fUser.email || 'user@khatakithab.app',
          displayName: fUser.displayName || fUser.email?.split('@')[0] || 'User',
          photoURL: fUser.photoURL || undefined,
          currency: '₹',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          createdAt: new Date().toISOString()
        });
        // Derive per-user encryption key
        try {
          const key = await deriveKey(fUser.uid);
          setCryptoKey(key);
        } catch (e) {
          console.warn('Failed to derive encryption key:', e);
          setCryptoKey(undefined);
        }
      } else {
        setUser({
          id: 'guest',
          email: 'guest@khatakithab.app',
          displayName: 'Guest User',
          currency: '₹',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          createdAt: new Date().toISOString()
        });
        setCryptoKey(undefined);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Realtime Firestore Sync when authenticated or LocalStorage when guest
  useEffect(() => {
    if (authLoading) return;

    if (firebaseUser) {
      // Authenticated: Subscribe to Firestore Collections
      const userId = firebaseUser.uid;
      const unsubs = [
        subscribeToUserCollection<Account>(userId, 'accounts', setAccounts, undefined, cryptoKey),
        subscribeToUserCollection<Transaction>(userId, 'transactions', setTransactions, undefined, cryptoKey),
        subscribeToUserCollection<Circle>(userId, 'circles', setCircles, undefined, cryptoKey),
        subscribeToUserCollection<CircleExpense>(userId, 'circleExpenses', setCircleExpenses, undefined, cryptoKey),
        subscribeToUserCollection<Settlement>(userId, 'settlements', setSettlements, undefined, cryptoKey),
        subscribeToUserCollection<CreditCard>(userId, 'creditCards', setCreditCards, undefined, cryptoKey),
        subscribeToUserCollection<EMI>(userId, 'emis', setEmis, undefined, cryptoKey),
        subscribeToUserCollection<Loan>(userId, 'loans', setLoans, undefined, cryptoKey),
        subscribeToUserCollection<Budget>(userId, 'budgets', setBudgets, undefined, cryptoKey),
        subscribeToUserCollection<Goal>(userId, 'goals', setGoals, undefined, cryptoKey),
        subscribeToUserCollection<Reminder>(userId, 'reminders', setReminders, undefined, cryptoKey)
      ];

      return () => {
        unsubs.forEach((unsub) => unsub());
      };
    } else {
      // Unauthenticated / Local Storage Fallback
      try {
        const savedTxns = localStorage.getItem('khatakithab_txns') || localStorage.getItem('rupee_khata_txns');
        if (savedTxns) setTransactions(JSON.parse(savedTxns));
        const savedAccounts = localStorage.getItem('khatakithab_accounts') || localStorage.getItem('rupee_khata_accounts');
        if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
        const savedCircles = localStorage.getItem('khatakithab_circles') || localStorage.getItem('rupee_khata_circles');
        if (savedCircles) setCircles(JSON.parse(savedCircles));
        const savedCExp = localStorage.getItem('khatakithab_cexpenses') || localStorage.getItem('rupee_khata_cexpenses');
        if (savedCExp) setCircleExpenses(JSON.parse(savedCExp));
        const savedSet = localStorage.getItem('khatakithab_settlements') || localStorage.getItem('rupee_khata_settlements');
        if (savedSet) setSettlements(JSON.parse(savedSet));
        const savedCategories = localStorage.getItem('khatakithab_categories') || localStorage.getItem('rupee_khata_categories');
        if (savedCategories) setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
    }
  }, [firebaseUser, authLoading, cryptoKey]);

  // Sync to LocalStorage when unauthenticated
  useEffect(() => {
    if (!firebaseUser && !authLoading) {
      try {
        localStorage.setItem('khatakithab_txns', JSON.stringify(transactions));
        localStorage.setItem('khatakithab_accounts', JSON.stringify(accounts));
        localStorage.setItem('khatakithab_circles', JSON.stringify(circles));
        localStorage.setItem('khatakithab_cexpenses', JSON.stringify(circleExpenses));
        localStorage.setItem('khatakithab_settlements', JSON.stringify(settlements));
        localStorage.setItem('khatakithab_categories', JSON.stringify(categories));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  }, [firebaseUser, authLoading, transactions, accounts, circles, circleExpenses, settlements, categories]);

  // 3. Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auth Methods
  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase auth not initialized');
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase auth not initialized');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) throw new Error('Firebase auth not initialized');
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
    }
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    // Clear local state
    setTransactions([]);
    setAccounts([]);
    setCircles([]);
    setCircleExpenses([]);
    setSettlements([]);
    setCreditCards([]);
    setEmis([]);
    setLoans([]);
    setBudgets([]);
    setGoals([]);
    setReminders([]);
  };

  // Handlers (Firestore + Local Sync)
  const addTransaction = async (txnData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTxn: Transaction = {
      ...txnData,
      id: `txn_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'transactions', newTxn.id, newTxn, cryptoKey);
    } else {
      setTransactions((prev) => [newTxn, ...prev]);
    }

    // Update account balances
    const targetAccount = accounts.find((acc) => acc.id === txnData.accountId);
    if (targetAccount) {
      let balanceChange = 0;
      if (txnData.type === 'income') balanceChange = txnData.amount;
      else if (txnData.type === 'expense' || txnData.type === 'transfer') balanceChange = -txnData.amount;

      const updatedAcc = { ...targetAccount, currentBalance: targetAccount.currentBalance + balanceChange };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'accounts', updatedAcc.id, updatedAcc, cryptoKey);
      } else {
        setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
      }
    }

    if (txnData.type === 'transfer' && txnData.toAccountId) {
      const toAcc = accounts.find((acc) => acc.id === txnData.toAccountId);
      if (toAcc) {
        const updatedToAcc = { ...toAcc, currentBalance: toAcc.currentBalance + txnData.amount };
        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'accounts', updatedToAcc.id, updatedToAcc, cryptoKey);
        } else {
          setAccounts((prev) => prev.map((a) => (a.id === updatedToAcc.id ? updatedToAcc : a)));
        }
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    const txnToDelete = transactions.find((t) => t.id === id);
    if (!txnToDelete) return;

    if (firebaseUser) {
      await deleteUserDoc(firebaseUser.uid, 'transactions', id);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }

    // Revert account balance impact
    const targetAccount = accounts.find((acc) => acc.id === txnToDelete.accountId);
    if (targetAccount) {
      let balanceChange = 0;
      if (txnToDelete.type === 'income') balanceChange = -txnToDelete.amount;
      else if (txnToDelete.type === 'expense' || txnToDelete.type === 'transfer') balanceChange = txnToDelete.amount;

      const updatedAcc = { ...targetAccount, currentBalance: targetAccount.currentBalance + balanceChange };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'accounts', updatedAcc.id, updatedAcc, cryptoKey);
      } else {
        setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
      }
    }
  };

  const addAccount = async (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = { ...accData, id: `acc_${Date.now()}` };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'accounts', newAcc.id, newAcc, cryptoKey);
    } else {
      setAccounts((prev) => [...prev, newAcc]);
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const existing = accounts.find((a) => a.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'accounts', id, updated, cryptoKey);
    } else {
      setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
  };

  const addCircle = async (circleData: Omit<Circle, 'id' | 'createdAt' | 'totalExpenses' | 'settledAmount' | 'outstandingAmount' | 'inviteCode'>) => {
    const newCircle: Circle = {
      ...circleData,
      id: `circle_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalExpenses: 0,
      settledAmount: 0,
      outstandingAmount: 0,
      inviteCode: `${circleData.name.toUpperCase().replace(/\s+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'circles', newCircle.id, newCircle, cryptoKey);
    } else {
      setCircles((prev) => [newCircle, ...prev]);
    }
  };

  const addCircleExpense = async (expData: Omit<CircleExpense, 'id' | 'createdAt'>) => {
    const newCExpense: CircleExpense = {
      ...expData,
      id: `cexp_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'circleExpenses', newCExpense.id, newCExpense, cryptoKey);
    } else {
      setCircleExpenses((prev) => [newCExpense, ...prev]);
    }

    const circle = circles.find((c) => c.id === expData.circleId);
    if (circle) {
      const total = circle.totalExpenses + expData.amount;
      const updatedCircle = { ...circle, totalExpenses: total, outstandingAmount: total - circle.settledAmount };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'circles', circle.id, updatedCircle, cryptoKey);
      } else {
        setCircles((prev) => prev.map((c) => (c.id === circle.id ? updatedCircle : c)));
      }
    }
  };

  const addSettlement = async (setData: Omit<Settlement, 'id' | 'createdAt'>) => {
    const newSettlement: Settlement = {
      ...setData,
      id: `set_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'settlements', newSettlement.id, newSettlement, cryptoKey);
    } else {
      setSettlements((prev) => [newSettlement, ...prev]);
    }

    const circle = circles.find((c) => c.id === setData.circleId);
    if (circle) {
      const settled = circle.settledAmount + setData.amount;
      const updatedCircle = {
        ...circle,
        settledAmount: settled,
        outstandingAmount: Math.max(0, circle.totalExpenses - settled)
      };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'circles', circle.id, updatedCircle, cryptoKey);
      } else {
        setCircles((prev) => prev.map((c) => (c.id === circle.id ? updatedCircle : c)));
      }
    }
  };

  const addCreditCard = async (cardData: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = { ...cardData, id: `cc_${Date.now()}` };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'creditCards', newCard.id, newCard, cryptoKey);
    } else {
      setCreditCards((prev) => [...prev, newCard]);
    }
  };

  const addEMI = async (emiData: Omit<EMI, 'id' | 'createdAt'>) => {
    const newEMI: EMI = { ...emiData, id: `emi_${Date.now()}`, createdAt: new Date().toISOString() };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emis', newEMI.id, newEMI, cryptoKey);
    } else {
      setEmis((prev) => [...prev, newEMI]);
    }
  };

  const addLoan = async (loanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = { ...loanData, id: `loan_${Date.now()}` };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'loans', newLoan.id, newLoan, cryptoKey);
    } else {
      setLoans((prev) => [...prev, newLoan]);
    }
  };

  const addBudget = async (bgtData: Omit<Budget, 'id' | 'spent'>) => {
    const newBgt: Budget = { ...bgtData, id: `bgt_${Date.now()}`, spent: 0 };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'budgets', newBgt.id, newBgt, cryptoKey);
    } else {
      setBudgets((prev) => [...prev, newBgt]);
    }
  };

  const addGoal = async (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goalData, id: `goal_${Date.now()}` };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'goals', newGoal.id, newGoal, cryptoKey);
    } else {
      setGoals((prev) => [...prev, newGoal]);
    }
  };

  const updateGoal = async (id: string, currentAmount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const updated = { ...goal, currentAmount };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'goals', id, updated, cryptoKey);
    } else {
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
  };

  const addReminder = async (remData: Omit<Reminder, 'id'>) => {
    const newRem: Reminder = { ...remData, id: `rem_${Date.now()}` };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'reminders', newRem.id, newRem, cryptoKey);
    } else {
      setReminders((prev) => [...prev, newRem]);
    }
  };

  const markReminderPaid = async (id: string) => {
    const rem = reminders.find((r) => r.id === id);
    if (!rem) return;
    const updated = { ...rem, status: 'paid' as const };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'reminders', id, updated, cryptoKey);
    } else {
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  };

  const addCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
  };

  // Clean Ledger Action (Available to all users)
  const resetToCleanLedger = async () => {
    if (firebaseUser) {
      await clearUserFirestoreData(firebaseUser.uid);
    } else {
      localStorage.clear();
    }
    setAccounts([]);
    setTransactions([]);
    setCircles([]);
    setCircleExpenses([]);
    setSettlements([]);
    setCreditCards([]);
    setEmis([]);
    setLoans([]);
    setBudgets([]);
    setGoals([]);
    setReminders([]);
    setCategories(DEFAULT_CATEGORIES);
  };

  // Developer Restricted Action: Load Sample Demo Data
  const loadSampleDemoData = async () => {
    if (firebaseUser) {
      await seedUserSampleData(firebaseUser.uid);
    } else {
      localStorage.clear();
      setAccounts(SAMPLE_ACCOUNTS);
      setTransactions(SAMPLE_TRANSACTIONS);
      setCircles(SAMPLE_CIRCLES);
      setCircleExpenses(SAMPLE_CIRCLE_EXPENSES);
      setSettlements(SAMPLE_SETTLEMENTS);
      setCreditCards(SAMPLE_CREDIT_CARDS);
      setEmis(SAMPLE_EMIS);
      setLoans(SAMPLE_LOANS);
      setBudgets(SAMPLE_BUDGETS);
      setGoals(SAMPLE_GOALS);
      setReminders(SAMPLE_REMINDERS);
    }
  };

  return (
    <DataContext.Provider
      value={{
        user,
        firebaseUser,
        authLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isDevMode,
        setIsDevMode,
        accounts,
        transactions,
        circles,
        circleExpenses,
        settlements,
        creditCards,
        emis,
        loans,
        budgets,
        goals,
        reminders,
        categories,
        isDemoMode: !firebaseUser,
        searchQuery,
        setSearchQuery,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        addTransaction,
        deleteTransaction,
        addCategory,
        addAccount,
        updateAccount,
        addCircle,
        addCircleExpense,
        addSettlement,
        addCreditCard,
        addEMI,
        addLoan,
        addBudget,
        addGoal,
        updateGoal,
        addReminder,
        markReminderPaid,
        resetToCleanLedger,
        loadSampleDemoData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
