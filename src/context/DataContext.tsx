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
  CreditCardStatement,
  CreditCardPayment,
  CardPaymentType,
  EMI,
  EMIPayment,
  Loan,
  LoanPayment,
  LoanInterestType,
  Budget,
  Goal,
  Reminder,
  RecurringPayment,
  Subscription,
  DetectedRecurringSuggestion,
  AppNotification,
  NotificationType,
  DatePeriod
} from '@/lib/types';
import { detectRecurringTransactions, normalizeMerchant } from '@/lib/recurringDetection';
import { APP_INFO } from '@/lib/constants';
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
  generateTransactionFingerprint,
  checkDuplicateTransaction,
  DuplicateTransactionError,
  checkFirestoreFingerprintConstraint,
  saveFirestoreFingerprintConstraint,
  deleteFirestoreFingerprintConstraint
} from '@/lib/duplicateDetection';
import {
  safeRound,
  toSafeMoney,
  toSafeSignedMoney,
  toSafePercentage,
  toSafeTenure,
  toSafeInterestRate
} from '@/lib/moneySafe';
import {
  calculateEMIDetailedSummary,
  calculateLoanDetailedSummary,
  calculateLoanAmortizationSchedule,
  calculateLoanEMI
} from '@/lib/calculations';
import {
  SAMPLE_USER,
  SAMPLE_ACCOUNTS,
  SAMPLE_TRANSACTIONS,
  SAMPLE_CIRCLES,
  SAMPLE_CIRCLE_EXPENSES,
  SAMPLE_SETTLEMENTS,
  SAMPLE_CREDIT_CARDS,
  SAMPLE_STATEMENTS,
  SAMPLE_PAYMENTS,
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
  cardStatements: CreditCardStatement[];
  cardPayments: CreditCardPayment[];
  emis: EMI[];
  emiPayments: EMIPayment[];
  loans: Loan[];
  loanPayments: LoanPayment[];
  recurringPayments: RecurringPayment[];
  subscriptions: Subscription[];
  ignoredSuggestionKeys: string[];
  detectedRecurringSuggestions: DetectedRecurringSuggestion[];
  budgets: Budget[];
  goals: Goal[];
  reminders: Reminder[];
  categories: string[];
  expenseCategories: string[];
  incomeCategories: string[];
  isDemoMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  isWhatsNewOpen: boolean;
  setIsWhatsNewOpen: (open: boolean) => void;

  // Global Date Period Preferences
  selectedPeriod: DatePeriod;
  setSelectedPeriod: (period: DatePeriod) => Promise<boolean>;
  preferencesError: string | null;
  setPreferencesError: (err: string | null) => void;
  
  // Notification Center
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  browserNotificationPermission: NotificationPermission;
  requestBrowserNotificationPermission: () => Promise<NotificationPermission>;
  sendBrowserNotification: (title: string, options?: NotificationOptions) => void;
  
  // Auth Methods
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;

  // Data Handlers
  addTransaction: (
    transaction: Omit<Transaction, 'id' | 'createdAt'>,
    options?: { allowDuplicate?: boolean }
  ) => Promise<void>;
  deleteTransaction: (id: string) => void;
  addCategory: (categoryName: string, type?: 'expense' | 'income') => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addCircle: (circle: Omit<Circle, 'id' | 'createdAt' | 'totalExpenses' | 'settledAmount' | 'outstandingAmount' | 'inviteCode'>) => void;
  addCircleExpense: (expense: Omit<CircleExpense, 'id' | 'createdAt'>) => void;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
  
  // Credit Cards & Statements
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => void;
  archiveCreditCard: (id: string) => void;
  restoreCreditCard: (id: string) => void;
  addCardStatement: (statement: Omit<CreditCardStatement, 'id' | 'createdAt'>) => void;
  updateCardStatement: (id: string, updates: Partial<CreditCardStatement>) => void;
  recordCardPayment: (payment: {
    cardId: string;
    amount: number;
    paymentDate: string;
    paymentType: CardPaymentType;
    sourceAccountId?: string;
    statementId?: string;
    notes?: string;
  }) => void;

  // EMIs
  addEMI: (emi: Omit<EMI, 'id' | 'createdAt'>) => Promise<void>;
  updateEMI: (id: string, updates: Partial<EMI>) => Promise<void>;
  editEMI: (id: string, updates: Partial<EMI>) => Promise<void>;
  recordEMIPayment: (payment: {
    emiId: string;
    cardId: string;
    installmentNumber: number;
    amount: number;
    paymentDate: string;
    sourceAccountId?: string;
    notes?: string;
  }) => Promise<void>;
  payEMIInstallment: (emiId: string, sourceAccountId?: string) => Promise<void>;
  precloseEMI: (emiId: string, precloseAmount: number, sourceAccountId?: string) => Promise<void>;
  archiveEMI: (id: string) => Promise<void>;
  restoreEMI: (id: string) => Promise<void>;
  deleteEMI: (id: string, softDelete?: boolean) => Promise<void>;

  // Loans
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editLoan: (id: string, updates: Partial<Loan>) => Promise<void>;
  recordLoanPayment: (payment: {
    loanId: string;
    installmentNumber: number;
    amount: number;
    paymentDate: string;
    principalComponent?: number;
    interestComponent?: number;
    sourceAccountId?: string;
    notes?: string;
  }) => Promise<void>;
  archiveLoan: (id: string) => Promise<void>;
  restoreLoan: (id: string) => Promise<void>;
  deleteLoan: (id: string, softDelete?: boolean) => Promise<void>;

  // Recurring Payments
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecurringPayment: (id: string, updates: Partial<RecurringPayment>) => Promise<void>;
  deleteRecurringPayment: (id: string) => Promise<void>;

  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;

  // Detection & Suggestion Controls
  keepSuggestion: (suggestion: DetectedRecurringSuggestion, targetType: 'recurring' | 'subscription') => Promise<void>;
  ignoreSuggestion: (key: string) => Promise<void>;
  restoreIgnoredSuggestions: () => Promise<void>;

  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal> | number) => void;
  deleteGoal: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  markReminderPaid: (id: string) => void;
  
  // Clean Ledger & Developer Seeding
  resetToCleanLedger: () => Promise<void>;
  loadSampleDemoData: () => Promise<void>;
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Rent',
  'Fuel',
  'Subscriptions',
  'EMI',
  'Medical',
  'Education',
  'Lifestyle',
  'Financial',
  'Investments',
  'Entertainment',
  'Personal Care'
];

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Cashback',
  'Freelance / Consulting',
  'Investments / Dividends',
  'Bonus / Allowance',
  'Rental Income',
  'Refunds',
  'Gifts & Grants',
  'Other Income'
];

export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES
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
  const [cardStatements, setCardStatements] = useState<CreditCardStatement[]>([]);
  const [cardPayments, setCardPayments] = useState<CreditCardPayment[]>([]);
  const [emis, setEmis] = useState<EMI[]>([]);
  const [emiPayments, setEmiPayments] = useState<EMIPayment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanPayments, setLoanPayments] = useState<LoanPayment[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [ignoredSuggestionKeys, setIgnoredSuggestionKeys] = useState<string[]>([]);

  const detectedRecurringSuggestions = React.useMemo(() => {
    return detectRecurringTransactions(transactions, recurringPayments, subscriptions, ignoredSuggestionKeys);
  }, [transactions, recurringPayments, subscriptions, ignoredSuggestionKeys]);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(DEFAULT_INCOME_CATEGORIES);
  const categories = Array.from(new Set([...expenseCategories, ...incomeCategories]));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState<boolean>(false);

  // Global Date Period Preferences (All time on initial launch/when no valid period exists)
  const [selectedPeriod, setSelectedPeriodState] = useState<DatePeriod>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('khatakithab_selected_period');
        const validPeriods: DatePeriod[] = ['all_time', 'this_month', 'last_month', 'last_3_months', 'last_6_months', 'this_year'];
        if (saved && validPeriods.includes(saved as DatePeriod)) {
          return saved as DatePeriod;
        }
      } catch (e) {}
    }
    return 'all_time';
  });

  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  // Function to change and persist selected period
  const setSelectedPeriod = async (newPeriod: DatePeriod): Promise<boolean> => {
    const validPeriods: DatePeriod[] = ['all_time', 'this_month', 'last_month', 'last_3_months', 'last_6_months', 'this_year'];
    const safePeriod: DatePeriod = validPeriods.includes(newPeriod) ? newPeriod : 'all_time';
    const prevPeriod = selectedPeriod;

    // 1. Recalculate all affected views immediately
    setSelectedPeriodState(safePeriod);
    setPreferencesError(null);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('khatakithab_selected_period', safePeriod);
      } catch (e) {}
    }

    // 2. Persist via PUT /api/preferences without resetting any other preference
    try {
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datePeriod: safePeriod })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Server rejected preference update');
      }

      // If user is authenticated, sync with Firestore document
      if (firebaseUser) {
        try {
          await saveUserDoc(
            firebaseUser.uid,
            'preferences',
            'general',
            {
              datePeriod: safePeriod,
              updatedAt: new Date().toISOString()
            },
            cryptoKey
          );
        } catch (e) {
          console.warn('Firestore preference save note:', e);
        }
      }

      return true;
    } catch (err: any) {
      console.error('Failed to persist datePeriod:', err);
      // 5. If saving fails, restore previously saved selection and show a clear error
      setSelectedPeriodState(prevPeriod);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('khatakithab_selected_period', prevPeriod);
        } catch (e) {}
      }
      setPreferencesError(`Failed to save period preference: ${err?.message || 'Network error'}. Restored to previous selection.`);
      setTimeout(() => setPreferencesError(null), 6000);
      return false;
    }
  };

  // Notification State
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedRead = localStorage.getItem('khatakithab_read_notifications');
        if (savedRead) setReadNotificationIds(JSON.parse(savedRead));

        const savedDismissed = localStorage.getItem('khatakithab_dismissed_notifications');
        if (savedDismissed) setDismissedNotificationIds(JSON.parse(savedDismissed));

        if ('Notification' in window) {
          setBrowserNotificationPermission(Notification.permission);
        }

        // Check if new version was released
        const lastSeenVersion = localStorage.getItem('khatakithab_last_seen_version');
        if (!lastSeenVersion) {
          localStorage.setItem('khatakithab_last_seen_version', APP_INFO.version);
        }
      } catch (e) {}
    }

    // Load server-persisted preferences in background without jarring layout shift
    const fetchServerPreferences = async () => {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.preferences?.datePeriod) {
            const validPeriods: DatePeriod[] = ['all_time', 'this_month', 'last_month', 'last_3_months', 'last_6_months', 'this_year'];
            if (validPeriods.includes(data.preferences.datePeriod)) {
              setSelectedPeriodState(data.preferences.datePeriod);
              if (typeof window !== 'undefined') {
                localStorage.setItem('khatakithab_selected_period', data.preferences.datePeriod);
              }
            }
          }
        }
      } catch (e) {}
    };
    fetchServerPreferences();
  }, []);
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
        subscribeToUserCollection<EMIPayment>(userId, 'emiPayments', setEmiPayments, undefined, cryptoKey),
        subscribeToUserCollection<Loan>(userId, 'loans', setLoans, undefined, cryptoKey),
        subscribeToUserCollection<LoanPayment>(userId, 'loanPayments', setLoanPayments, undefined, cryptoKey),
        subscribeToUserCollection<RecurringPayment>(userId, 'recurringPayments', setRecurringPayments, undefined, cryptoKey),
        subscribeToUserCollection<Subscription>(userId, 'subscriptions', setSubscriptions, undefined, cryptoKey),
        subscribeToUserCollection<{ id: string; keys: string[] }>(
          userId,
          'ignoredSuggestions',
          (list) => {
            const item = list.find((x) => x.id === 'default');
            if (item?.keys) setIgnoredSuggestionKeys(item.keys);
          },
          undefined,
          cryptoKey
        ),
        subscribeToUserCollection<Budget>(userId, 'budgets', setBudgets, undefined, cryptoKey),
        subscribeToUserCollection<Goal>(userId, 'goals', setGoals, undefined, cryptoKey),
        subscribeToUserCollection<Reminder>(userId, 'reminders', setReminders, undefined, cryptoKey),
        subscribeToUserCollection<Record<string, any>>(
          userId,
          'preferences',
          (prefsList) => {
            const generalPref = prefsList.find((p) => p.id === 'general');
            if (generalPref?.datePeriod) {
              const validPeriods: DatePeriod[] = ['all_time', 'this_month', 'last_month', 'last_3_months', 'last_6_months', 'this_year'];
              if (validPeriods.includes(generalPref.datePeriod as DatePeriod)) {
                setSelectedPeriodState(generalPref.datePeriod as DatePeriod);
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.setItem('khatakithab_selected_period', generalPref.datePeriod);
                  } catch (e) {}
                }
              }
            } else if (selectedPeriod) {
              // Push local session period to newly created Firestore preferences
              saveUserDoc(
                userId,
                'preferences',
                'general',
                {
                  datePeriod: selectedPeriod,
                  updatedAt: new Date().toISOString()
                },
                cryptoKey
              ).catch(() => {});
            }
          },
          undefined,
          cryptoKey
        )
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
        const savedCards = localStorage.getItem('khatakithab_credit_cards');
        if (savedCards) setCreditCards(JSON.parse(savedCards));
        const savedStmts = localStorage.getItem('khatakithab_statements');
        if (savedStmts) setCardStatements(JSON.parse(savedStmts));
        const savedPmts = localStorage.getItem('khatakithab_payments');
        if (savedPmts) setCardPayments(JSON.parse(savedPmts));
        const savedEmis = localStorage.getItem('khatakithab_emis');
        if (savedEmis) setEmis(JSON.parse(savedEmis));
        const savedEmiPayments = localStorage.getItem('khatakithab_emi_payments');
        if (savedEmiPayments) setEmiPayments(JSON.parse(savedEmiPayments));
        const savedLoans = localStorage.getItem('khatakithab_loans');
        if (savedLoans) setLoans(JSON.parse(savedLoans));
        const savedLoanPayments = localStorage.getItem('khatakithab_loan_payments');
        if (savedLoanPayments) setLoanPayments(JSON.parse(savedLoanPayments));
        const savedRecurring = localStorage.getItem('khatakithab_recurring_payments');
        if (savedRecurring) setRecurringPayments(JSON.parse(savedRecurring));
        const savedSubscriptions = localStorage.getItem('khatakithab_subscriptions');
        if (savedSubscriptions) setSubscriptions(JSON.parse(savedSubscriptions));
        const savedIgnored = localStorage.getItem('khatakithab_ignored_suggestions');
        if (savedIgnored) setIgnoredSuggestionKeys(JSON.parse(savedIgnored));
        const savedBudgets = localStorage.getItem('khatakithab_budgets');
        if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
        const savedGoals = localStorage.getItem('khatakithab_goals');
        if (savedGoals) setGoals(JSON.parse(savedGoals));
        const savedReminders = localStorage.getItem('khatakithab_reminders');
        if (savedReminders) setReminders(JSON.parse(savedReminders));
        const savedExpCategories = localStorage.getItem('khatakithab_expense_categories');
        if (savedExpCategories) {
          setExpenseCategories(JSON.parse(savedExpCategories));
        } else {
          const savedCategories = localStorage.getItem('khatakithab_categories') || localStorage.getItem('rupee_khata_categories');
          if (savedCategories) {
            const parsed = JSON.parse(savedCategories) as string[];
            setExpenseCategories(parsed.filter((c) => !DEFAULT_INCOME_CATEGORIES.includes(c)));
          }
        }
        const savedIncCategories = localStorage.getItem('khatakithab_income_categories');
        if (savedIncCategories) setIncomeCategories(JSON.parse(savedIncCategories));
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
        localStorage.setItem('khatakithab_credit_cards', JSON.stringify(creditCards));
        localStorage.setItem('khatakithab_statements', JSON.stringify(cardStatements));
        localStorage.setItem('khatakithab_payments', JSON.stringify(cardPayments));
        localStorage.setItem('khatakithab_emis', JSON.stringify(emis));
        localStorage.setItem('khatakithab_emi_payments', JSON.stringify(emiPayments));
        localStorage.setItem('khatakithab_loans', JSON.stringify(loans));
        localStorage.setItem('khatakithab_loan_payments', JSON.stringify(loanPayments));
        localStorage.setItem('khatakithab_recurring_payments', JSON.stringify(recurringPayments));
        localStorage.setItem('khatakithab_subscriptions', JSON.stringify(subscriptions));
        localStorage.setItem('khatakithab_ignored_suggestions', JSON.stringify(ignoredSuggestionKeys));
        localStorage.setItem('khatakithab_budgets', JSON.stringify(budgets));
        localStorage.setItem('khatakithab_goals', JSON.stringify(goals));
        localStorage.setItem('khatakithab_reminders', JSON.stringify(reminders));
        localStorage.setItem('khatakithab_expense_categories', JSON.stringify(expenseCategories));
        localStorage.setItem('khatakithab_income_categories', JSON.stringify(incomeCategories));
        localStorage.setItem('khatakithab_categories', JSON.stringify(categories));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  }, [
    firebaseUser,
    authLoading,
    transactions,
    accounts,
    circles,
    circleExpenses,
    settlements,
    creditCards,
    cardStatements,
    cardPayments,
    emis,
    emiPayments,
    loans,
    loanPayments,
    recurringPayments,
    subscriptions,
    ignoredSuggestionKeys,
    budgets,
    goals,
    reminders,
    expenseCategories,
    incomeCategories,
    categories
  ]);

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

  // Handlers (Firestore + Local Sync with Centralized Duplicate Detection)
  const addTransaction = async (
    txnData: Omit<Transaction, 'id' | 'createdAt'>,
    options?: { allowDuplicate?: boolean }
  ) => {
    const cleanAmount = toSafeMoney(txnData.amount);
    const cleanTxnData: Omit<Transaction, 'id' | 'createdAt'> = {
      ...txnData,
      amount: cleanAmount
    };

    // 1. Calculate centralized transaction fingerprint
    const fingerprint = generateTransactionFingerprint(cleanTxnData);

    // 2. Centralized Duplicate Detection: in-memory check unless explicitly allowed
    if (!options?.allowDuplicate) {
      const dupCheck = checkDuplicateTransaction(cleanTxnData, transactions);
      if (dupCheck.isDuplicate) {
        throw new DuplicateTransactionError(
          dupCheck.reason || 'A duplicate transaction already exists in this account.',
          dupCheck.duplicateOf
        );
      }

      // 3. Unique Database Constraint: check Firestore fingerprint document when online
      if (firebaseUser) {
        const isDbDuplicate = await checkFirestoreFingerprintConstraint(firebaseUser.uid, fingerprint);
        if (isDbDuplicate) {
          throw new DuplicateTransactionError(
            `A duplicate transaction with the same amount (₹${cleanAmount.toLocaleString('en-IN')}) on ${cleanTxnData.date} is already saved in your cloud ledger.`
          );
        }
      }
    }

    const newTxn: Transaction = {
      ...cleanTxnData,
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fingerprint,
      createdAt: new Date().toISOString()
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'transactions', newTxn.id, newTxn, cryptoKey);
      await saveFirestoreFingerprintConstraint(firebaseUser.uid, fingerprint, newTxn.id);
    } else {
      setTransactions((prev) => [newTxn, ...prev]);
    }

    // Update account balances
    const targetAccount = accounts.find((acc) => acc.id === cleanTxnData.accountId);
    if (targetAccount) {
      let balanceChange = 0;
      if (cleanTxnData.type === 'income') balanceChange = cleanAmount;
      else if (cleanTxnData.type === 'expense' || cleanTxnData.type === 'transfer') balanceChange = -cleanAmount;

      const currentBal = toSafeSignedMoney(targetAccount.currentBalance);
      const updatedAcc = { ...targetAccount, currentBalance: safeRound(currentBal + balanceChange) };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'accounts', updatedAcc.id, updatedAcc, cryptoKey);
      } else {
        setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
      }
    }

    if (cleanTxnData.type === 'transfer' && cleanTxnData.toAccountId) {
      const toAcc = accounts.find((acc) => acc.id === cleanTxnData.toAccountId);
      if (toAcc) {
        const toBal = toSafeSignedMoney(toAcc.currentBalance);
        const updatedToAcc = { ...toAcc, currentBalance: safeRound(toBal + cleanAmount) };
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
      const fp = txnToDelete.fingerprint || generateTransactionFingerprint(txnToDelete);
      await deleteFirestoreFingerprintConstraint(firebaseUser.uid, fp);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }

    // Revert account balance impact
    const targetAccount = accounts.find((acc) => acc.id === txnToDelete.accountId);
    if (targetAccount) {
      const cleanAmount = toSafeMoney(txnToDelete.amount);
      let balanceChange = 0;
      if (txnToDelete.type === 'income') balanceChange = -cleanAmount;
      else if (txnToDelete.type === 'expense' || txnToDelete.type === 'transfer') balanceChange = cleanAmount;

      const currentBal = toSafeSignedMoney(targetAccount.currentBalance);
      const updatedAcc = { ...targetAccount, currentBalance: safeRound(currentBal + balanceChange) };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'accounts', updatedAcc.id, updatedAcc, cryptoKey);
      } else {
        setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
      }
    }
  };

  const addAccount = async (accData: Omit<Account, 'id'>) => {
    const cleanCurrentBalance = toSafeSignedMoney(accData.currentBalance);
    const cleanOpeningBalance = toSafeSignedMoney(accData.openingBalance ?? accData.currentBalance);
    const newAcc: Account = {
      ...accData,
      currentBalance: cleanCurrentBalance,
      openingBalance: cleanOpeningBalance,
      id: `acc_${Date.now()}`
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'accounts', newAcc.id, newAcc, cryptoKey);
    } else {
      setAccounts((prev) => [...prev, newAcc]);
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const existing = accounts.find((a) => a.id === id);
    if (!existing) return;
    const cleanUpdates: Partial<Account> = { ...updates };
    if (updates.currentBalance !== undefined) {
      cleanUpdates.currentBalance = toSafeSignedMoney(updates.currentBalance);
    }
    if (updates.openingBalance !== undefined) {
      cleanUpdates.openingBalance = toSafeSignedMoney(updates.openingBalance);
    }
    const updated = { ...existing, ...cleanUpdates };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'accounts', id, updated, cryptoKey);
    } else {
      setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
  };

  const deleteAccount = async (id: string) => {
    if (firebaseUser) {
      await deleteUserDoc(firebaseUser.uid, 'accounts', id);
    } else {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
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
    const cleanAmount = toSafeMoney(expData.amount);
    const cleanSplits = (expData.splits || []).map((s) => ({
      ...s,
      amount: toSafeMoney(s.amount)
    }));

    const newCExpense: CircleExpense = {
      ...expData,
      amount: cleanAmount,
      splits: cleanSplits,
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
      const currentTot = toSafeMoney(circle.totalExpenses);
      const currentSet = toSafeMoney(circle.settledAmount);
      const total = safeRound(currentTot + cleanAmount);
      const updatedCircle = {
        ...circle,
        totalExpenses: total,
        outstandingAmount: safeRound(Math.max(0, total - currentSet))
      };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'circles', circle.id, updatedCircle, cryptoKey);
      } else {
        setCircles((prev) => prev.map((c) => (c.id === circle.id ? updatedCircle : c)));
      }
    }
  };

  const addSettlement = async (setData: Omit<Settlement, 'id' | 'createdAt'>) => {
    const cleanAmount = toSafeMoney(setData.amount);
    const newSettlement: Settlement = {
      ...setData,
      amount: cleanAmount,
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
      const currentTot = toSafeMoney(circle.totalExpenses);
      const settled = safeRound(toSafeMoney(circle.settledAmount) + cleanAmount);
      const updatedCircle = {
        ...circle,
        settledAmount: settled,
        outstandingAmount: safeRound(Math.max(0, currentTot - settled))
      };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'circles', circle.id, updatedCircle, cryptoKey);
      } else {
        setCircles((prev) => prev.map((c) => (c.id === circle.id ? updatedCircle : c)));
      }
    }
  };

  // Credit Cards
  const addCreditCard = async (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCard: CreditCard = {
      ...cardData,
      creditLimit: toSafeMoney(cardData.creditLimit),
      currentOutstanding: toSafeMoney(cardData.currentOutstanding),
      minimumDue: toSafeMoney(cardData.minimumDue),
      statementBalance: toSafeMoney(cardData.statementBalance),
      interestRate: toSafeInterestRate(cardData.interestRate),
      id: `cc_${Date.now()}`,
      status: cardData.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'creditCards', newCard.id, newCard, cryptoKey);
    } else {
      setCreditCards((prev) => [...prev, newCard]);
    }
  };

  const updateCreditCard = async (id: string, updates: Partial<CreditCard>) => {
    const card = creditCards.find((c) => c.id === id);
    if (!card) return;
    const updated = { ...card, ...updates, updatedAt: new Date().toISOString() };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'creditCards', id, updated, cryptoKey);
    } else {
      setCreditCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  };

  const archiveCreditCard = async (id: string) => {
    await updateCreditCard(id, { status: 'Archived' });
  };

  const restoreCreditCard = async (id: string) => {
    await updateCreditCard(id, { status: 'Active' });
  };

  // Statements
  const addCardStatement = async (statementData: Omit<CreditCardStatement, 'id' | 'createdAt'>) => {
    const newStmt: CreditCardStatement = {
      ...statementData,
      id: `stmt_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'cardStatements', newStmt.id, newStmt, cryptoKey);
    } else {
      setCardStatements((prev) => [newStmt, ...prev]);
    }
  };

  const updateCardStatement = async (id: string, updates: Partial<CreditCardStatement>) => {
    const stmt = cardStatements.find((s) => s.id === id);
    if (!stmt) return;
    const updated = { ...stmt, ...updates };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'cardStatements', id, updated, cryptoKey);
    } else {
      setCardStatements((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  };

  // Payments
  const recordCardPayment = async (payment: {
    cardId: string;
    amount: number;
    paymentDate: string;
    paymentType: CardPaymentType;
    sourceAccountId?: string;
    statementId?: string;
    notes?: string;
  }) => {
    const card = creditCards.find((c) => c.id === payment.cardId);
    if (!card) return;

    const newPayment: CreditCardPayment = {
      id: `pay_${Date.now()}`,
      cardId: payment.cardId,
      statementId: payment.statementId,
      accountId: payment.sourceAccountId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentType: payment.paymentType,
      notes: payment.notes,
      createdAt: new Date().toISOString()
    };

    // 1. Update Card outstanding and due balances
    const newOutstanding = Math.max(0, (card.currentOutstanding || 0) - payment.amount);
    const newStatementBal = Math.max(0, (card.statementBalance ?? card.currentOutstanding ?? 0) - payment.amount);
    const newMinDue = Math.max(0, (card.minimumDue || 0) - payment.amount);

    const updatedCard: CreditCard = {
      ...card,
      currentOutstanding: newOutstanding,
      statementBalance: newStatementBal,
      minimumDue: newMinDue,
      updatedAt: new Date().toISOString()
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'creditCards', card.id, updatedCard, cryptoKey);
      await saveUserDoc(firebaseUser.uid, 'cardPayments', newPayment.id, newPayment, cryptoKey);
    } else {
      setCreditCards((prev) => prev.map((c) => (c.id === card.id ? updatedCard : c)));
      setCardPayments((prev) => [newPayment, ...prev]);
    }

    // 2. Update Statement if linked
    if (payment.statementId) {
      const stmt = cardStatements.find((s) => s.id === payment.statementId);
      if (stmt) {
        const newPaid = stmt.paidAmount + payment.amount;
        const newStatus =
          newPaid >= stmt.statementAmount
            ? 'Paid'
            : newPaid >= stmt.minimumDue
            ? 'Partially Paid'
            : stmt.status;

        const updatedStmt: CreditCardStatement = {
          ...stmt,
          paidAmount: newPaid,
          status: newStatus
        };

        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'cardStatements', stmt.id, updatedStmt, cryptoKey);
        } else {
          setCardStatements((prev) => prev.map((s) => (s.id === stmt.id ? updatedStmt : s)));
        }
      }
    }

    // 3. Deduct from Source Account & log transfer transaction (NO double count as expense!)
    if (payment.sourceAccountId) {
      const sourceAcc = accounts.find((a) => a.id === payment.sourceAccountId);
      if (sourceAcc) {
        const updatedAcc = {
          ...sourceAcc,
          currentBalance: sourceAcc.currentBalance - payment.amount
        };
        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'accounts', sourceAcc.id, updatedAcc, cryptoKey);
        } else {
          setAccounts((prev) => prev.map((a) => (a.id === sourceAcc.id ? updatedAcc : a)));
        }

        // Add liability settlement payment transaction
        const newTxn: Transaction = {
          id: `txn_ccpay_${Date.now()}`,
          userId: user.id,
          type: 'transfer',
          amount: payment.amount,
          category: 'Credit Card Payment',
          description: `Bill Payment: ${card.cardName} (•••• ${card.last4Digits})`,
          date: payment.paymentDate,
          accountId: sourceAcc.id,
          notes: payment.notes || `${payment.paymentType} payment towards ${card.cardName}`,
          createdAt: new Date().toISOString()
        };

        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'transactions', newTxn.id, newTxn, cryptoKey);
        } else {
          setTransactions((prev) => [newTxn, ...prev]);
        }
      }
    }
  };

  // EMIs
  const addEMI = async (emiData: Omit<EMI, 'id' | 'createdAt'>) => {
    const tenure = toSafeTenure(emiData.tenureMonths || 12, 1, 120);
    const paid = Math.min(tenure, toSafeTenure(emiData.paidInstallments ?? emiData.paidMonths ?? 0, 0, 120));
    const cleanPurchase = toSafeMoney(emiData.purchaseAmount || emiData.principalAmount);
    const cleanDownPayment = toSafeMoney(emiData.downPayment);
    const cleanFinanced = safeRound(Math.max(0, cleanPurchase - cleanDownPayment));
    const cleanPrincipal = toSafeMoney(emiData.principalAmount || cleanFinanced || cleanPurchase);
    const cleanMonthly = toSafeMoney(emiData.monthlyEmi || emiData.emiAmount || safeRound(cleanFinanced / tenure));
    const cleanTotal = toSafeMoney(emiData.totalPayable, safeRound(cleanMonthly * tenure + cleanDownPayment));

    const newEMI: EMI = {
      ...emiData,
      purchaseAmount: cleanPurchase,
      downPayment: cleanDownPayment,
      financedAmount: cleanFinanced,
      principalAmount: cleanPrincipal,
      monthlyEmi: cleanMonthly,
      emiAmount: cleanMonthly,
      totalPayable: cleanTotal,
      interestRate: toSafeInterestRate(emiData.interestRate),
      tenureMonths: tenure,
      id: `emi_${Date.now()}`,
      title: emiData.title || emiData.purchaseTitle || 'EMI Purchase',
      purchaseTitle: emiData.purchaseTitle || emiData.title || 'EMI Purchase',
      paidMonths: paid,
      paidInstallments: paid,
      remainingInstallments: Math.max(0, tenure - paid),
      status: emiData.status || (paid >= tenure ? 'Completed' : 'Active'),
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emis', newEMI.id, newEMI, cryptoKey);
    } else {
      setEmis((prev) => [...prev, newEMI]);
    }
  };

  const updateEMI = async (id: string, updates: Partial<EMI>) => {
    const emi = emis.find((e) => e.id === id);
    if (!emi) return;
    const cleanUpdates: Partial<EMI> = { ...updates, updatedAt: new Date().toISOString() };
    if (updates.purchaseAmount !== undefined) cleanUpdates.purchaseAmount = toSafeMoney(updates.purchaseAmount);
    if (updates.principalAmount !== undefined) cleanUpdates.principalAmount = toSafeMoney(updates.principalAmount);
    if (updates.downPayment !== undefined) cleanUpdates.downPayment = toSafeMoney(updates.downPayment);
    if (updates.financedAmount !== undefined) cleanUpdates.financedAmount = toSafeMoney(updates.financedAmount);
    if (updates.monthlyEmi !== undefined) cleanUpdates.monthlyEmi = toSafeMoney(updates.monthlyEmi);
    if (updates.emiAmount !== undefined) cleanUpdates.emiAmount = toSafeMoney(updates.emiAmount);
    if (updates.totalPayable !== undefined) cleanUpdates.totalPayable = toSafeMoney(updates.totalPayable);
    if (updates.interestRate !== undefined) cleanUpdates.interestRate = toSafeInterestRate(updates.interestRate);
    if (updates.tenureMonths !== undefined) cleanUpdates.tenureMonths = toSafeTenure(updates.tenureMonths, 1, 120);

    const updated = { ...emi, ...cleanUpdates };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emis', id, updated, cryptoKey);
    } else {
      setEmis((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
  };

  const editEMI = async (id: string, updates: Partial<EMI>) => {
    const emi = emis.find((e) => e.id === id);
    if (!emi) return;

    const cleanUpdates: Partial<EMI> = { ...updates, updatedAt: new Date().toISOString() };
    if (updates.purchaseAmount !== undefined) cleanUpdates.purchaseAmount = toSafeMoney(updates.purchaseAmount);
    if (updates.principalAmount !== undefined) cleanUpdates.principalAmount = toSafeMoney(updates.principalAmount);
    if (updates.downPayment !== undefined) cleanUpdates.downPayment = toSafeMoney(updates.downPayment);
    if (updates.financedAmount !== undefined) cleanUpdates.financedAmount = toSafeMoney(updates.financedAmount);
    if (updates.monthlyEmi !== undefined) cleanUpdates.monthlyEmi = toSafeMoney(updates.monthlyEmi);
    if (updates.emiAmount !== undefined) cleanUpdates.emiAmount = toSafeMoney(updates.emiAmount);
    if (updates.totalPayable !== undefined) cleanUpdates.totalPayable = toSafeMoney(updates.totalPayable);
    if (updates.interestRate !== undefined) cleanUpdates.interestRate = toSafeInterestRate(updates.interestRate);
    if (updates.tenureMonths !== undefined) cleanUpdates.tenureMonths = toSafeTenure(updates.tenureMonths, 1, 120);

    const merged = { ...emi, ...cleanUpdates };
    // Recalculate summary strictly preserving existing individual payments
    const detailed = calculateEMIDetailedSummary(merged, emiPayments);

    const finalized: EMI = {
      ...merged,
      paidMonths: detailed.paidInstallmentsCount,
      paidInstallments: detailed.paidInstallmentsCount,
      remainingInstallments: detailed.remainingInstallmentsCount,
      nextDueDate: detailed.nextDueDate === 'Completed' ? emi.nextDueDate : detailed.nextDueDate,
      status: detailed.isCompleted ? 'Completed' : (merged.isArchived || merged.status === 'Archived' ? 'Archived' : 'Active')
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emis', id, finalized, cryptoKey);
    } else {
      setEmis((prev) => prev.map((e) => (e.id === id ? finalized : e)));
    }
  };

  const recordEMIPayment = async (paymentData: {
    emiId: string;
    cardId: string;
    installmentNumber: number;
    amount: number;
    paymentDate: string;
    sourceAccountId?: string;
    notes?: string;
  }) => {
    const emi = emis.find((e) => e.id === paymentData.emiId);
    if (!emi) return;

    const cleanAmount = toSafeMoney(paymentData.amount);
    if (cleanAmount <= 0) return;

    const newPayment: EMIPayment = {
      id: `emipay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      emiId: paymentData.emiId,
      cardId: paymentData.cardId || emi.cardId,
      installmentNumber: toSafeTenure(paymentData.installmentNumber, 1, emi.tenureMonths || 120),
      amount: cleanAmount,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      accountId: paymentData.sourceAccountId,
      notes: paymentData.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Save payment record
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emiPayments', newPayment.id, newPayment, cryptoKey);
    } else {
      setEmiPayments((prev) => [newPayment, ...prev]);
    }

    // 2. Recompute detailed EMI metrics
    const allPayments = [...emiPayments, newPayment];
    const detailed = calculateEMIDetailedSummary(emi, allPayments);

    const updatedEMI: EMI = {
      ...emi,
      paidMonths: detailed.paidInstallmentsCount,
      paidInstallments: detailed.paidInstallmentsCount,
      remainingInstallments: detailed.remainingInstallmentsCount,
      nextDueDate: detailed.nextDueDate === 'Completed' ? emi.nextDueDate : detailed.nextDueDate,
      status: detailed.isCompleted ? 'Completed' : (emi.isArchived || emi.status === 'Archived' ? 'Archived' : 'Active'),
      updatedAt: new Date().toISOString()
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emis', emi.id, updatedEMI, cryptoKey);
    } else {
      setEmis((prev) => prev.map((e) => (e.id === emi.id ? updatedEMI : e)));
    }

    // 3. Deduct from Source Account if provided
    if (paymentData.sourceAccountId) {
      const sourceAcc = accounts.find((a) => a.id === paymentData.sourceAccountId);
      if (sourceAcc) {
        const curBal = toSafeSignedMoney(sourceAcc.currentBalance);
        const updatedAcc = {
          ...sourceAcc,
          currentBalance: safeRound(curBal - cleanAmount)
        };
        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'accounts', sourceAcc.id, updatedAcc, cryptoKey);
        } else {
          setAccounts((prev) => prev.map((a) => (a.id === sourceAcc.id ? updatedAcc : a)));
        }

        const newTxn: Transaction = {
          id: `txn_emipay_${Date.now()}`,
          userId: user.id,
          type: 'transfer',
          amount: cleanAmount,
          category: 'EMI Payment',
          description: `EMI Payment: ${emi.purchaseTitle || emi.title} (Inst #${newPayment.installmentNumber})`,
          date: newPayment.paymentDate,
          accountId: sourceAcc.id,
          notes: newPayment.notes || `Installment #${newPayment.installmentNumber} payment for ${emi.purchaseTitle || emi.title}`,
          createdAt: new Date().toISOString()
        };

        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'transactions', newTxn.id, newTxn, cryptoKey);
        } else {
          setTransactions((prev) => [newTxn, ...prev]);
        }
      }
    }
  };

  const payEMIInstallment = async (emiId: string, sourceAccountId?: string) => {
    const emi = emis.find((e) => e.id === emiId);
    if (!emi) return;

    const detailed = calculateEMIDetailedSummary(emi, emiPayments);
    const targetInstallmentNum = detailed.nextInstallmentNumber || 1;
    const targetInstallment = detailed.installments.find((i) => i.installmentNumber === targetInstallmentNum);
    const requiredAmount = targetInstallment?.remainingAmount && targetInstallment.remainingAmount > 0
      ? targetInstallment.remainingAmount
      : (emi.monthlyEmi || emi.emiAmount || 0);

    await recordEMIPayment({
      emiId: emi.id,
      cardId: emi.cardId,
      installmentNumber: targetInstallmentNum,
      amount: requiredAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      sourceAccountId,
      notes: `Installment #${targetInstallmentNum} Payment`
    });
  };

  const precloseEMI = async (emiId: string, precloseAmount: number, sourceAccountId?: string) => {
    const emi = emis.find((e) => e.id === emiId);
    if (!emi) return;
    const cleanPreclose = toSafeMoney(precloseAmount);

    const updatedEMI: EMI = {
      ...emi,
      paidMonths: emi.tenureMonths,
      paidInstallments: emi.tenureMonths,
      remainingInstallments: 0,
      status: 'Preclosed',
      updatedAt: new Date().toISOString()
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emis', emi.id, updatedEMI, cryptoKey);
    } else {
      setEmis((prev) => prev.map((e) => (e.id === emi.id ? updatedEMI : e)));
    }

    if (sourceAccountId && cleanPreclose > 0) {
      const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
      if (sourceAcc) {
        const curBal = toSafeSignedMoney(sourceAcc.currentBalance);
        const updatedAcc = {
          ...sourceAcc,
          currentBalance: safeRound(curBal - cleanPreclose)
        };
        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'accounts', sourceAcc.id, updatedAcc, cryptoKey);
        } else {
          setAccounts((prev) => prev.map((a) => (a.id === sourceAcc.id ? updatedAcc : a)));
        }

        const newTxn: Transaction = {
          id: `txn_preclose_${Date.now()}`,
          userId: user.id,
          type: 'transfer',
          amount: cleanPreclose,
          category: 'EMI Pre-closure',
          description: `EMI Pre-closure: ${emi.purchaseTitle || emi.title}`,
          date: new Date().toISOString().split('T')[0],
          accountId: sourceAcc.id,
          createdAt: new Date().toISOString()
        };

        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'transactions', newTxn.id, newTxn, cryptoKey);
        } else {
          setTransactions((prev) => [newTxn, ...prev]);
        }
      }
    }
  };

  const archiveEMI = async (id: string) => {
    const emi = emis.find((e) => e.id === id);
    if (!emi) return;
    const updated: EMI = {
      ...emi,
      status: 'Archived',
      isArchived: true,
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emis', id, updated, cryptoKey);
    } else {
      setEmis((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
  };

  const restoreEMI = async (id: string) => {
    const emi = emis.find((e) => e.id === id);
    if (!emi) return;
    const detailed = calculateEMIDetailedSummary(emi, emiPayments);
    const updated: EMI = {
      ...emi,
      status: detailed.isCompleted ? 'Completed' : 'Active',
      isArchived: false,
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'emis', id, updated, cryptoKey);
    } else {
      setEmis((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
  };

  const deleteEMI = async (id: string, softDelete: boolean = true) => {
    if (softDelete) {
      const emi = emis.find((e) => e.id === id);
      if (!emi) return;
      const updated: EMI = {
        ...emi,
        isDeleted: true,
        status: 'Cancelled',
        updatedAt: new Date().toISOString()
      };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'emis', id, updated, cryptoKey);
      } else {
        setEmis((prev) => prev.map((e) => (e.id === id ? updated : e)));
      }
    } else {
      if (firebaseUser) {
        await deleteUserDoc(firebaseUser.uid, 'emis', id);
      } else {
        setEmis((prev) => prev.filter((e) => e.id !== id));
      }
    }
  };

  const addLoan = async (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanPrincipal = toSafeMoney(loanData.principal);
    const cleanRate = toSafeInterestRate(loanData.interestRate);
    const cleanTenure = toSafeTenure(loanData.tenureMonths, 1, 480);
    const interestType: LoanInterestType = loanData.interestType || 'Reducing Balance';
    const cleanEmi = toSafeMoney(
      loanData.emiAmount && loanData.emiAmount > 0
        ? loanData.emiAmount
        : calculateLoanEMI(cleanPrincipal, cleanRate, cleanTenure, interestType)
    );
    const dueDay = Math.min(31, Math.max(1, loanData.dueDay || loanData.paymentDayOfMonth || 10));

    const newLoan: Loan = {
      ...loanData,
      principal: cleanPrincipal,
      outstandingPrincipal: cleanPrincipal,
      emiAmount: cleanEmi,
      interestRate: cleanRate,
      interestType,
      tenureMonths: cleanTenure,
      dueDay,
      paymentDayOfMonth: dueDay,
      status: 'Active',
      isArchived: false,
      isDeleted: false,
      id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'loans', newLoan.id, newLoan, cryptoKey);
    } else {
      setLoans((prev) => [...prev, newLoan]);
    }
  };

  const editLoan = async (id: string, updates: Partial<Loan>) => {
    const existingLoan = loans.find((l) => l.id === id);
    if (!existingLoan) return;

    const cleanPrincipal = updates.principal !== undefined ? toSafeMoney(updates.principal) : existingLoan.principal;
    const cleanRate = updates.interestRate !== undefined ? toSafeInterestRate(updates.interestRate) : existingLoan.interestRate;
    const cleanTenure = updates.tenureMonths !== undefined ? toSafeTenure(updates.tenureMonths, 1, 480) : existingLoan.tenureMonths;
    const interestType: LoanInterestType = updates.interestType || existingLoan.interestType || 'Reducing Balance';
    const cleanEmi = updates.emiAmount !== undefined && updates.emiAmount > 0
      ? toSafeMoney(updates.emiAmount)
      : calculateLoanEMI(cleanPrincipal, cleanRate, cleanTenure, interestType);
    const dueDay = updates.dueDay !== undefined
      ? Math.min(31, Math.max(1, updates.dueDay))
      : (existingLoan.dueDay || existingLoan.paymentDayOfMonth || 10);

    const updatedLoan: Loan = {
      ...existingLoan,
      ...updates,
      principal: cleanPrincipal,
      interestRate: cleanRate,
      interestType,
      tenureMonths: cleanTenure,
      emiAmount: cleanEmi,
      dueDay,
      paymentDayOfMonth: dueDay,
      updatedAt: new Date().toISOString()
    };

    // Note: Historical payment records are strictly preserved!
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'loans', id, updatedLoan, cryptoKey);
    } else {
      setLoans((prev) => prev.map((l) => (l.id === id ? updatedLoan : l)));
    }
  };

  const recordLoanPayment = async (paymentData: {
    loanId: string;
    installmentNumber: number;
    amount: number;
    paymentDate: string;
    principalComponent?: number;
    interestComponent?: number;
    sourceAccountId?: string;
    notes?: string;
  }) => {
    const loan = loans.find((l) => l.id === paymentData.loanId);
    if (!loan) return;

    const cleanAmount = toSafeMoney(paymentData.amount);
    if (cleanAmount <= 0) return;

    // Calculate default principal/interest breakdown from amortization schedule if not specified
    let prinComp = paymentData.principalComponent !== undefined ? toSafeMoney(paymentData.principalComponent) : 0;
    let intComp = paymentData.interestComponent !== undefined ? toSafeMoney(paymentData.interestComponent) : 0;

    if (prinComp === 0 && intComp === 0) {
      const schedule = calculateLoanAmortizationSchedule(loan, loanPayments);
      const row = schedule.find((r) => r.installmentNumber === paymentData.installmentNumber);
      if (row) {
        intComp = safeRound(Math.min(cleanAmount, row.interestComponent));
        prinComp = safeRound(Math.max(0, cleanAmount - intComp));
      } else {
        prinComp = cleanAmount;
        intComp = 0;
      }
    }

    const paymentId = `lp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newPayment: LoanPayment = {
      id: paymentId,
      loanId: loan.id,
      userId: user.id,
      installmentNumber: paymentData.installmentNumber,
      amount: cleanAmount,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      principalComponent: prinComp,
      interestComponent: intComp,
      accountId: paymentData.sourceAccountId,
      notes: paymentData.notes,
      status: 'Paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Save payment record
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'loanPayments', paymentId, newPayment, cryptoKey);
    } else {
      setLoanPayments((prev) => [...prev, newPayment]);
    }

    // 2. Adjust source account balance if provided
    if (paymentData.sourceAccountId) {
      const acc = accounts.find((a) => a.id === paymentData.sourceAccountId);
      if (acc) {
        const updatedBalance = safeRound(acc.currentBalance - cleanAmount);
        const updatedAcc: Account = {
          ...acc,
          currentBalance: updatedBalance
        };
        if (firebaseUser) {
          await saveUserDoc(firebaseUser.uid, 'accounts', acc.id, updatedAcc, cryptoKey);
        } else {
          setAccounts((prev) => prev.map((a) => (a.id === acc.id ? updatedAcc : a)));
        }
      }
    }

    // 3. Log ledger transaction
    const txnId = `txn_loan_${Date.now()}`;
    const newTxn: Transaction = {
      id: txnId,
      userId: user.id,
      accountId: paymentData.sourceAccountId || accounts.find((a) => a.isActive)?.id || '',
      amount: cleanAmount,
      type: 'expense',
      category: 'Loan / EMI',
      description: `Loan Payment: ${loan.loanName} (Installment #${paymentData.installmentNumber})`,
      date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'transactions', txnId, newTxn, cryptoKey);
    } else {
      setTransactions((prev) => [newTxn, ...prev]);
    }
  };

  const archiveLoan = async (id: string) => {
    const loan = loans.find((l) => l.id === id);
    if (!loan) return;
    const updated: Loan = {
      ...loan,
      status: 'Archived',
      isArchived: true,
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'loans', id, updated, cryptoKey);
    } else {
      setLoans((prev) => prev.map((l) => (l.id === id ? updated : l)));
    }
  };

  const restoreLoan = async (id: string) => {
    const loan = loans.find((l) => l.id === id);
    if (!loan) return;
    const detailed = calculateLoanDetailedSummary(loan, loanPayments);
    const updated: Loan = {
      ...loan,
      status: detailed.isCompleted ? 'Completed' : 'Active',
      isArchived: false,
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'loans', id, updated, cryptoKey);
    } else {
      setLoans((prev) => prev.map((l) => (l.id === id ? updated : l)));
    }
  };

  const deleteLoan = async (id: string, softDelete: boolean = true) => {
    if (softDelete) {
      const loan = loans.find((l) => l.id === id);
      if (!loan) return;
      const updated: Loan = {
        ...loan,
        isDeleted: true,
        updatedAt: new Date().toISOString()
      };
      if (firebaseUser) {
        await saveUserDoc(firebaseUser.uid, 'loans', id, updated, cryptoKey);
      } else {
        setLoans((prev) => prev.map((l) => (l.id === id ? updated : l)));
      }
    } else {
      if (firebaseUser) {
        await deleteUserDoc(firebaseUser.uid, 'loans', id);
      } else {
        setLoans((prev) => prev.filter((l) => l.id !== id));
      }
    }
  };

  // Recurring Payments Handlers
  const addRecurringPayment = async (paymentData: Omit<RecurringPayment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanAmount = toSafeMoney(paymentData.amount);
    const newPayment: RecurringPayment = {
      ...paymentData,
      amount: cleanAmount,
      merchantPattern: paymentData.merchantPattern || normalizeMerchant(paymentData.name),
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'recurringPayments', newPayment.id, newPayment, cryptoKey);
    } else {
      setRecurringPayments((prev) => [...prev, newPayment]);
    }
  };

  const updateRecurringPayment = async (id: string, updates: Partial<RecurringPayment>) => {
    const existing = recurringPayments.find((r) => r.id === id);
    if (!existing) return;
    const cleanAmount = updates.amount !== undefined ? toSafeMoney(updates.amount) : existing.amount;
    const updated: RecurringPayment = {
      ...existing,
      ...updates,
      amount: cleanAmount,
      merchantPattern: updates.name ? normalizeMerchant(updates.name) : existing.merchantPattern,
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'recurringPayments', id, updated, cryptoKey);
    } else {
      setRecurringPayments((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  };

  const deleteRecurringPayment = async (id: string) => {
    if (firebaseUser) {
      await deleteUserDoc(firebaseUser.uid, 'recurringPayments', id);
    } else {
      setRecurringPayments((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Subscriptions Handlers
  const addSubscription = async (subData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanAmount = toSafeMoney(subData.amount);
    const newSub: Subscription = {
      ...subData,
      amount: cleanAmount,
      merchantPattern: subData.merchantPattern || normalizeMerchant(subData.serviceName),
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'subscriptions', newSub.id, newSub, cryptoKey);
    } else {
      setSubscriptions((prev) => [...prev, newSub]);
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    const existing = subscriptions.find((s) => s.id === id);
    if (!existing) return;
    const cleanAmount = updates.amount !== undefined ? toSafeMoney(updates.amount) : existing.amount;
    const updated: Subscription = {
      ...existing,
      ...updates,
      amount: cleanAmount,
      merchantPattern: updates.serviceName ? normalizeMerchant(updates.serviceName) : existing.merchantPattern,
      updatedAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'subscriptions', id, updated, cryptoKey);
    } else {
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  };

  const deleteSubscription = async (id: string) => {
    if (firebaseUser) {
      await deleteUserDoc(firebaseUser.uid, 'subscriptions', id);
    } else {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Detection & Suggestion Controls
  const keepSuggestion = async (
    suggestion: DetectedRecurringSuggestion,
    targetType: 'recurring' | 'subscription'
  ) => {
    if (targetType === 'subscription') {
      await addSubscription({
        userId: user.id,
        serviceName: suggestion.originalMerchant,
        category: suggestion.category || 'Subscriptions',
        amount: suggestion.lastAmount || suggestion.averageCharge,
        cadence: suggestion.cadence,
        nextRenewalDate: suggestion.nextExpectedDate,
        isActive: true,
        merchantPattern: suggestion.normalizedMerchant
      });
    } else {
      await addRecurringPayment({
        userId: user.id,
        name: suggestion.originalMerchant,
        category: suggestion.category || 'Bills & Utilities',
        amount: suggestion.lastAmount || suggestion.averageCharge,
        cadence: suggestion.cadence,
        nextDate: suggestion.nextExpectedDate,
        isActive: true,
        merchantPattern: suggestion.normalizedMerchant
      });
    }
  };

  const ignoreSuggestion = async (key: string) => {
    const norm = normalizeMerchant(key);
    if (!norm) return;
    const updatedKeys = Array.from(new Set([...ignoredSuggestionKeys, norm]));
    setIgnoredSuggestionKeys(updatedKeys);
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'ignoredSuggestions', 'default', { id: 'default', keys: updatedKeys }, cryptoKey);
    }
  };

  const restoreIgnoredSuggestions = async () => {
    setIgnoredSuggestionKeys([]);
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'ignoredSuggestions', 'default', { id: 'default', keys: [] }, cryptoKey);
    }
  };

  const addBudget = async (bgtData: Omit<Budget, 'id' | 'spent'>) => {
    const cleanLimit = toSafeMoney(bgtData.monthlyLimit);
    const newBgt: Budget = {
      ...bgtData,
      monthlyLimit: cleanLimit,
      id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      spent: 0,
      isActive: bgtData.isActive !== undefined ? bgtData.isActive : true,
      period: bgtData.period || 'monthly',
      createdAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'budgets', newBgt.id, newBgt, cryptoKey);
    } else {
      setBudgets((prev) => [...prev, newBgt]);
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const bgt = budgets.find((b) => b.id === id);
    if (!bgt) return;
    const cleanUpdates: Partial<Budget> = { ...updates };
    if (updates.monthlyLimit !== undefined) {
      cleanUpdates.monthlyLimit = toSafeMoney(updates.monthlyLimit);
    }
    if (updates.spent !== undefined) {
      cleanUpdates.spent = toSafeMoney(updates.spent);
    }

    const updated = { ...bgt, ...cleanUpdates, updatedAt: new Date().toISOString() };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'budgets', id, updated, cryptoKey);
    } else {
      setBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)));
    }
  };

  const deleteBudget = async (id: string) => {
    const bgt = budgets.find((b) => b.id === id);
    if (!bgt) return;
    if (firebaseUser) {
      await deleteUserDoc(firebaseUser.uid, 'budgets', id);
    } else {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const addGoal = async (goalData: Omit<Goal, 'id'>) => {
    const cleanTarget = toSafeMoney(goalData.targetAmount);
    const cleanCurrent = toSafeMoney(goalData.currentAmount);
    const newGoal: Goal = {
      ...goalData,
      targetAmount: cleanTarget,
      currentAmount: cleanCurrent,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'goals', newGoal.id, newGoal, cryptoKey);
    } else {
      setGoals((prev) => [...prev, newGoal]);
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal> | number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const patch = typeof updates === 'number' ? { currentAmount: updates } : updates;
    const cleanPatch: Partial<Goal> = { ...patch };
    if (patch.targetAmount !== undefined) cleanPatch.targetAmount = toSafeMoney(patch.targetAmount);
    if (patch.currentAmount !== undefined) cleanPatch.currentAmount = toSafeMoney(patch.currentAmount);

    const updated: Goal = { ...goal, ...cleanPatch, updatedAt: new Date().toISOString() };
    if (firebaseUser) {
      await saveUserDoc(firebaseUser.uid, 'goals', id, updated, cryptoKey);
    } else {
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
  };

  const deleteGoal = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    if (firebaseUser) {
      await deleteUserDoc(firebaseUser.uid, 'goals', id);
    } else {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const addReminder = async (remData: Omit<Reminder, 'id'>) => {
    const cleanAmount = toSafeMoney(remData.amount);
    const newRem: Reminder = {
      ...remData,
      amount: cleanAmount,
      id: `rem_${Date.now()}`
    };
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

  const addCategory = (categoryName: string, type: 'expense' | 'income' = 'expense') => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (type === 'income') {
      if (!incomeCategories.includes(trimmed)) {
        setIncomeCategories((prev) => [...prev, trimmed]);
      }
    } else {
      if (!expenseCategories.includes(trimmed)) {
        setExpenseCategories((prev) => [...prev, trimmed]);
      }
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
    setCardStatements([]);
    setCardPayments([]);
    setEmis([]);
    setLoans([]);
    setBudgets([]);
    setGoals([]);
    setReminders([]);
    setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
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
      setCardStatements(SAMPLE_STATEMENTS);
      setCardPayments(SAMPLE_PAYMENTS);
      setEmis(SAMPLE_EMIS);
      setLoans(SAMPLE_LOANS);
      setBudgets(SAMPLE_BUDGETS);
      setGoals(SAMPLE_GOALS);
      setReminders(SAMPLE_REMINDERS);
    }
  };

  // Dynamic Notification Generation Engine
  const generateNotifications = (): AppNotification[] => {
    const list: AppNotification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Reminders Notifications
    reminders.forEach((r) => {
      if (r.status === 'paid') return;
      const due = new Date(r.dueDate);
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        list.push({
          id: `reminder-overdue-${r.id}`,
          type: 'reminder',
          title: `Overdue: ${r.title}`,
          message: `Bill of ₹${r.amount.toLocaleString('en-IN')} was due on ${r.dueDate} (${Math.abs(diffDays)} days ago).`,
          date: r.dueDate,
          read: readNotificationIds.includes(`reminder-overdue-${r.id}`),
          priority: 'high',
          link: '/reminders',
          actionLabel: 'Mark Paid',
          metadata: { reminderId: r.id, amount: r.amount, dueDate: r.dueDate, category: r.category }
        });
      } else if (diffDays === 0) {
        list.push({
          id: `reminder-today-${r.id}`,
          type: 'reminder',
          title: `Due Today: ${r.title}`,
          message: `Payment of ₹${r.amount.toLocaleString('en-IN')} is scheduled for today.`,
          date: 'Today',
          read: readNotificationIds.includes(`reminder-today-${r.id}`),
          priority: 'high',
          link: '/reminders',
          actionLabel: 'Mark Paid',
          metadata: { reminderId: r.id, amount: r.amount, dueDate: r.dueDate, category: r.category }
        });
      } else if (diffDays <= 3) {
        list.push({
          id: `reminder-upcoming-${r.id}`,
          type: 'reminder',
          title: `Upcoming: ${r.title}`,
          message: `₹${r.amount.toLocaleString('en-IN')} due in ${diffDays} day${diffDays > 1 ? 's' : ''} (${r.dueDate}).`,
          date: `In ${diffDays}d`,
          read: readNotificationIds.includes(`reminder-upcoming-${r.id}`),
          priority: 'medium',
          link: '/reminders',
          actionLabel: 'View Bill',
          metadata: { reminderId: r.id, amount: r.amount, dueDate: r.dueDate, category: r.category }
        });
      }
    });

    // 2. Budget Alerts
    budgets.forEach((b) => {
      if (b.monthlyLimit <= 0) return;
      const ratio = b.spent / b.monthlyLimit;
      if (ratio >= 1.0) {
        list.push({
          id: `budget-exceeded-${b.id}`,
          type: 'budget',
          title: `Budget Exceeded: ${b.category}`,
          message: `You've spent ₹${b.spent.toLocaleString('en-IN')} of your ₹${b.monthlyLimit.toLocaleString('en-IN')} cap (${Math.round(ratio * 100)}%).`,
          date: 'This Month',
          read: readNotificationIds.includes(`budget-exceeded-${b.id}`),
          priority: 'high',
          link: '/budgets',
          actionLabel: 'Adjust Budget',
          metadata: { category: b.category, amount: b.spent }
        });
      } else if (ratio >= 0.8) {
        list.push({
          id: `budget-warning-${b.id}`,
          type: 'budget',
          title: `Budget Warning: ${b.category}`,
          message: `You've reached ${Math.round(ratio * 100)}% of your ₹${b.monthlyLimit.toLocaleString('en-IN')} budget.`,
          date: 'This Month',
          read: readNotificationIds.includes(`budget-warning-${b.id}`),
          priority: 'medium',
          link: '/budgets',
          actionLabel: 'View Budgets',
          metadata: { category: b.category, amount: b.spent }
        });
      }
    });

    // 3. Circles Activity
    circles.forEach((c) => {
      if (c.outstandingAmount > 0) {
        list.push({
          id: `circle-outstanding-${c.id}`,
          type: 'circle',
          title: `Circle Balance: ${c.name}`,
          message: `You have ₹${c.outstandingAmount.toLocaleString('en-IN')} unsettled balance in this group.`,
          date: 'Active',
          read: readNotificationIds.includes(`circle-outstanding-${c.id}`),
          priority: 'medium',
          link: `/circles/${c.id}`,
          actionLabel: 'Settle Up',
          metadata: { circleId: c.id, amount: c.outstandingAmount }
        });
      }
    });

    // 4. Version Update Notification
    list.push({
      id: `app-release-${APP_INFO.version}`,
      type: 'update',
      title: `KhataKithab ${APP_INFO.version} Live!`,
      message: `Notification Center, Auto-Ledger Circle Sync, and AES-256 Encryption are now live.`,
      date: APP_INFO.build.split('.')[0] + '-' + APP_INFO.build.split('.')[1],
      read: readNotificationIds.includes(`app-release-${APP_INFO.version}`),
      priority: 'low',
      actionLabel: "What's New",
      metadata: { version: APP_INFO.version }
    });

    return list.filter((n) => !dismissedNotificationIds.includes(n.id));
  };

  const notifications = generateNotifications();
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('khatakithab_read_notifications', JSON.stringify(next));
      }
      return next;
    });
  };

  const markAllNotificationsAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    if (typeof window !== 'undefined') {
      localStorage.setItem('khatakithab_read_notifications', JSON.stringify(allIds));
    }
  };

  const clearNotification = (id: string) => {
    setDismissedNotificationIds((prev) => {
      const next = [...prev, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('khatakithab_dismissed_notifications', JSON.stringify(next));
      }
      return next;
    });
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map((n) => n.id);
    setDismissedNotificationIds((prev) => {
      const next = Array.from(new Set([...prev, ...allIds]));
      if (typeof window !== 'undefined') {
        localStorage.setItem('khatakithab_dismissed_notifications', JSON.stringify(next));
      }
      return next;
    });
  };

  const requestBrowserNotificationPermission = async (): Promise<NotificationPermission> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotificationPermission(permission);
        if (permission === 'granted') {
          new Notification('KhataKithab Notifications Enabled', {
            body: 'You will now receive alerts for upcoming bill due dates & budget limits.',
            icon: '/icon.png'
          });
        }
        return permission;
      } catch (e) {
        return 'denied';
      }
    }
    return 'denied';
  };

  const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/icon.png',
          ...options
        });
      } catch (e) {}
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
        cardStatements,
        cardPayments,
        emis,
        emiPayments,
        loans,
        loanPayments,
        recurringPayments,
        subscriptions,
        ignoredSuggestionKeys,
        detectedRecurringSuggestions,
        budgets,
        goals,
        reminders,
        categories,
        expenseCategories,
        incomeCategories,
        isDemoMode: !firebaseUser,
        searchQuery,
        setSearchQuery,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isWhatsNewOpen,
        setIsWhatsNewOpen,
        selectedPeriod,
        setSelectedPeriod,
        preferencesError,
        setPreferencesError,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        browserNotificationPermission,
        requestBrowserNotificationPermission,
        sendBrowserNotification,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        addTransaction,
        deleteTransaction,
        addCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        addCircle,
        addCircleExpense,
        addSettlement,
        addCreditCard,
        updateCreditCard,
        archiveCreditCard,
        restoreCreditCard,
        addCardStatement,
        updateCardStatement,
        recordCardPayment,
        addEMI,
        updateEMI,
        editEMI,
        recordEMIPayment,
        payEMIInstallment,
        precloseEMI,
        archiveEMI,
        restoreEMI,
        deleteEMI,
        addLoan,
        editLoan,
        recordLoanPayment,
        archiveLoan,
        restoreLoan,
        deleteLoan,
        addRecurringPayment,
        updateRecurringPayment,
        deleteRecurringPayment,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        keepSuggestion,
        ignoreSuggestion,
        restoreIgnoredSuggestions,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
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
