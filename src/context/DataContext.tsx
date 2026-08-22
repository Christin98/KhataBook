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
  
  // Handlers
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
  resetToSampleData: () => void;
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
  const [user, setUser] = useState<UserProfile>(SAMPLE_USER);
  const [accounts, setAccounts] = useState<Account[]>(SAMPLE_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [circles, setCircles] = useState<Circle[]>(SAMPLE_CIRCLES);
  const [circleExpenses, setCircleExpenses] = useState<CircleExpense[]>(SAMPLE_CIRCLE_EXPENSES);
  const [settlements, setSettlements] = useState<Settlement[]>(SAMPLE_SETTLEMENTS);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(SAMPLE_CREDIT_CARDS);
  const [emis, setEmis] = useState<EMI[]>(SAMPLE_EMIS);
  const [loans, setLoans] = useState<Loan[]>(SAMPLE_LOANS);
  const [budgets, setBudgets] = useState<Budget[]>(SAMPLE_BUDGETS);
  const [goals, setGoals] = useState<Goal[]>(SAMPLE_GOALS);
  const [reminders, setReminders] = useState<Reminder[]>(SAMPLE_REMINDERS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Load from localStorage on client mount if available
  useEffect(() => {
    try {
      const savedTxns = localStorage.getItem('rupee_khata_txns');
      if (savedTxns) setTransactions(JSON.parse(savedTxns));
      const savedAccounts = localStorage.getItem('rupee_khata_accounts');
      if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
      const savedCircles = localStorage.getItem('rupee_khata_circles');
      if (savedCircles) setCircles(JSON.parse(savedCircles));
      const savedCExp = localStorage.getItem('rupee_khata_cexpenses');
      if (savedCExp) setCircleExpenses(JSON.parse(savedCExp));
      const savedSet = localStorage.getItem('rupee_khata_settlements');
      if (savedSet) setSettlements(JSON.parse(savedSet));
      const savedCategories = localStorage.getItem('rupee_khata_categories');
      if (savedCategories) setCategories(JSON.parse(savedCategories));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rupee_khata_txns', JSON.stringify(transactions));
      localStorage.setItem('rupee_khata_accounts', JSON.stringify(accounts));
      localStorage.setItem('rupee_khata_circles', JSON.stringify(circles));
      localStorage.setItem('rupee_khata_cexpenses', JSON.stringify(circleExpenses));
      localStorage.setItem('rupee_khata_settlements', JSON.stringify(settlements));
      localStorage.setItem('rupee_khata_categories', JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed saving to localStorage:', e);
    }
  }, [transactions, accounts, circles, circleExpenses, settlements, categories]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K search and '+' hotkey
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

  // Add Transaction & update account balance
  const addTransaction = (txnData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTxn: Transaction = {
      ...txnData,
      id: `txn_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Update account balances
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === txnData.accountId) {
          let balanceChange = 0;
          if (txnData.type === 'income') balanceChange = txnData.amount;
          else if (txnData.type === 'expense') balanceChange = -txnData.amount;
          else if (txnData.type === 'transfer') balanceChange = -txnData.amount;
          return { ...acc, currentBalance: acc.currentBalance + balanceChange };
        }
        if (txnData.type === 'transfer' && acc.id === txnData.toAccountId) {
          return { ...acc, currentBalance: acc.currentBalance + txnData.amount };
        }
        return acc;
      })
    );

    // Update budget spent if expense
    if (txnData.type === 'expense') {
      setBudgets((prevBudgets) =>
        prevBudgets.map((b) => {
          if (b.category.toLowerCase().includes(txnData.category.toLowerCase()) || txnData.category.toLowerCase().includes(b.category.toLowerCase())) {
            return { ...b, spent: b.spent + txnData.amount };
          }
          return b;
        })
      );
    }
  };

  const deleteTransaction = (id: string) => {
    const txnToDelete = transactions.find((t) => t.id === id);
    if (!txnToDelete) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Revert account balance impact
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === txnToDelete.accountId) {
          let balanceChange = 0;
          if (txnToDelete.type === 'income') balanceChange = -txnToDelete.amount;
          else if (txnToDelete.type === 'expense') balanceChange = txnToDelete.amount;
          else if (txnToDelete.type === 'transfer') balanceChange = txnToDelete.amount;
          return { ...acc, currentBalance: acc.currentBalance + balanceChange };
        }
        if (txnToDelete.type === 'transfer' && acc.id === txnToDelete.toAccountId) {
          return { ...acc, currentBalance: acc.currentBalance - txnToDelete.amount };
        }
        return acc;
      })
    );
  };

  const addAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const addCircle = (circleData: Omit<Circle, 'id' | 'createdAt' | 'totalExpenses' | 'settledAmount' | 'outstandingAmount' | 'inviteCode'>) => {
    const newCircle: Circle = {
      ...circleData,
      id: `circle_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalExpenses: 0,
      settledAmount: 0,
      outstandingAmount: 0,
      inviteCode: `${circleData.name.toUpperCase().replace(/\s+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`
    };
    setCircles((prev) => [newCircle, ...prev]);
  };

  const addCircleExpense = (expData: Omit<CircleExpense, 'id' | 'createdAt'>) => {
    const newCExpense: CircleExpense = {
      ...expData,
      id: `cexp_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCircleExpenses((prev) => [newCExpense, ...prev]);

    // Update Circle totals
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id === expData.circleId) {
          const total = c.totalExpenses + expData.amount;
          return {
            ...c,
            totalExpenses: total,
            outstandingAmount: total - c.settledAmount
          };
        }
        return c;
      })
    );
  };

  const addSettlement = (setData: Omit<Settlement, 'id' | 'createdAt'>) => {
    const newSettlement: Settlement = {
      ...setData,
      id: `set_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSettlements((prev) => [newSettlement, ...prev]);

    setCircles((prev) =>
      prev.map((c) => {
        if (c.id === setData.circleId) {
          const settled = c.settledAmount + setData.amount;
          return {
            ...c,
            settledAmount: settled,
            outstandingAmount: Math.max(0, c.totalExpenses - settled)
          };
        }
        return c;
      })
    );
  };

  const addCreditCard = (cardData: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = { ...cardData, id: `cc_${Date.now()}` };
    setCreditCards((prev) => [...prev, newCard]);
  };

  const addEMI = (emiData: Omit<EMI, 'id' | 'createdAt'>) => {
    const newEMI: EMI = { ...emiData, id: `emi_${Date.now()}`, createdAt: new Date().toISOString() };
    setEmis((prev) => [...prev, newEMI]);
  };

  const addLoan = (loanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = { ...loanData, id: `loan_${Date.now()}` };
    setLoans((prev) => [...prev, newLoan]);
  };

  const addBudget = (bgtData: Omit<Budget, 'id' | 'spent'>) => {
    const newBgt: Budget = { ...bgtData, id: `bgt_${Date.now()}`, spent: 0 };
    setBudgets((prev) => [...prev, newBgt]);
  };

  const addGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goalData, id: `goal_${Date.now()}` };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, currentAmount: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, currentAmount } : g)));
  };

  const addReminder = (remData: Omit<Reminder, 'id'>) => {
    const newRem: Reminder = { ...remData, id: `rem_${Date.now()}` };
    setReminders((prev) => [...prev, newRem]);
  };

  const markReminderPaid = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'paid' as const } : r)));
  };

  const addCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
  };

  const resetToSampleData = () => {
    localStorage.clear();
    setUser(SAMPLE_USER);
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
    setCategories(DEFAULT_CATEGORIES);
  };

  return (
    <DataContext.Provider
      value={{
        user,
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
        isDemoMode,
        searchQuery,
        setSearchQuery,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
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
        resetToSampleData
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
