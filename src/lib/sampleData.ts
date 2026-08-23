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
} from './types';

export const FUN_CIRCLE_CATEGORIES = [
  { name: 'Goa Plan (Never Happens)', type: 'Travel', icon: '🏖️' },
  { name: '3 BHK Ki Kahani', type: 'Flatmates', icon: '🏠' },
  { name: 'Kaminey Dost', type: 'Friends', icon: '🍻' },
  { name: 'Chai, Charcha & Kharcha', type: 'Food', icon: '☕' },
  { name: 'Backbenchers & Proxy', type: 'College', icon: '🎒' },
  { name: 'Hum Saath Saath Hain', type: 'Family', icon: '👨‍👩‍👧‍👦' },
  { name: 'Corporate Majdoor', type: 'Office', icon: '💼' },
  { name: 'Sale Mein Sab Jayaz Hai', type: 'Shopping', icon: '🛍️' },
  { name: 'Party Sharty Unlimited', type: 'Party', icon: '🎉' },
  { name: 'Khel Khel Mein Kharcha', type: 'Sports', icon: '⚽' },
  { name: 'Picture Abhi Baaki Hai', type: 'Entertainment', icon: '🎬' },
  { name: 'Gym Jaana Kal Se', type: 'Fitness', icon: '🏋️' },
  { name: 'Petrol Kaun Bharenga?', type: 'Road Trip', icon: '🚗' },
  { name: 'Auto-Debit Ke Shikaar', type: 'Subscriptions', icon: '💳' },
  { name: 'Khatra-E-Kharcha', type: 'Other', icon: '🔥' }
];

export const SAMPLE_USER: UserProfile = {
  id: 'user_demo_123',
  email: 'demouser@example.com',
  displayName: 'Demo User',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  currency: '₹',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: 'acc_hdfc',
    userId: 'user_demo_123',
    name: 'HDFC Salary Account',
    type: 'bank',
    bankName: 'HDFC Bank',
    openingBalance: 150000,
    currentBalance: 184500,
    color: '#1e3a8a',
    icon: 'Building2',
    isActive: true
  },
  {
    id: 'acc_icici',
    userId: 'user_demo_123',
    name: 'ICICI Savings',
    type: 'bank',
    bankName: 'ICICI Bank',
    openingBalance: 45000,
    currentBalance: 62300,
    color: '#c2410c',
    icon: 'Landmark',
    isActive: true
  },
  {
    id: 'acc_sbi',
    userId: 'user_demo_123',
    name: 'SBI Emergency Vault',
    type: 'savings',
    bankName: 'State Bank of India',
    openingBalance: 100000,
    currentBalance: 125000,
    color: '#0369a1',
    icon: 'Vault',
    isActive: true
  },
  {
    id: 'acc_cash',
    userId: 'user_demo_123',
    name: 'Cash Wallet',
    type: 'cash',
    openingBalance: 5000,
    currentBalance: 3450,
    color: '#15803d',
    icon: 'Banknote',
    isActive: true
  },
  {
    id: 'acc_paytm',
    userId: 'user_demo_123',
    name: 'Paytm Wallet',
    type: 'wallet',
    openingBalance: 2000,
    currentBalance: 1280,
    color: '#0284c7',
    icon: 'Wallet',
    isActive: true
  }
];

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_101',
    userId: 'user_demo_123',
    type: 'income',
    amount: 145000,
    category: 'Salary',
    description: 'Monthly Corporate Salary - Aug',
    date: '2026-08-01',
    accountId: 'acc_hdfc',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'txn_102',
    userId: 'user_demo_123',
    type: 'expense',
    amount: 25000,
    category: 'Rent',
    description: 'Monthly Apartment Rent (3 BHK)',
    date: '2026-08-02',
    accountId: 'acc_hdfc',
    paymentMethod: 'UPI',
    createdAt: '2026-08-02T11:30:00.000Z'
  },
  {
    id: 'txn_103',
    userId: 'user_demo_123',
    type: 'expense',
    amount: 4850,
    category: 'Groceries',
    description: 'Supermarket monthly stock up at Nature Basket',
    date: '2026-08-04',
    accountId: 'acc_icici',
    paymentMethod: 'Debit Card',
    createdAt: '2026-08-04T16:20:00.000Z'
  },
  {
    id: 'txn_104',
    userId: 'user_demo_123',
    type: 'expense',
    amount: 2200,
    category: 'Fuel',
    description: 'Shell Full Tank Refill',
    date: '2026-08-07',
    accountId: 'acc_hdfc',
    paymentMethod: 'UPI',
    createdAt: '2026-08-07T09:15:00.000Z'
  },
  {
    id: 'txn_105',
    userId: 'user_demo_123',
    type: 'expense',
    amount: 1499,
    category: 'Subscriptions',
    description: 'Netflix & Spotify Premium Annual',
    date: '2026-08-10',
    accountId: 'acc_paytm',
    paymentMethod: 'Wallet',
    createdAt: '2026-08-10T14:00:00.000Z'
  },
  {
    id: 'txn_106',
    userId: 'user_demo_123',
    type: 'expense',
    amount: 3200,
    category: 'Restaurants',
    description: 'Dinner with friends at Social Offline',
    date: '2026-08-14',
    accountId: 'acc_hdfc',
    paymentMethod: 'Credit Card',
    createdAt: '2026-08-14T21:45:00.000Z'
  },
  {
    id: 'txn_107',
    userId: 'user_demo_123',
    type: 'expense',
    amount: 5000,
    category: 'EMI',
    description: 'iPhone 16 Monthly EMI Payment',
    date: '2026-08-15',
    accountId: 'acc_hdfc',
    paymentMethod: 'Auto Debit',
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'txn_108',
    userId: 'user_demo_123',
    type: 'transfer',
    amount: 15000,
    category: 'Savings Transfer',
    description: 'Monthly Emergency Fund auto allocation',
    date: '2026-08-16',
    accountId: 'acc_hdfc',
    toAccountId: 'acc_sbi',
    paymentMethod: 'Internal Transfer',
    createdAt: '2026-08-16T10:00:00.000Z'
  },
  {
    id: 'txn_109',
    userId: 'user_demo_123',
    type: 'income',
    amount: 12500,
    category: 'Investment',
    description: 'Mutual Fund Dividend Payout',
    date: '2026-08-18',
    accountId: 'acc_icici',
    paymentMethod: 'NEFT',
    createdAt: '2026-08-18T12:00:00.000Z'
  }
];

export const SAMPLE_CIRCLES: Circle[] = [
  {
    id: 'circle_goa',
    name: 'Goa Plan (Never Happens)',
    category: 'Goa Plan (Never Happens)',
    ownerId: 'user_demo_123',
    members: [
      { id: 'user_demo_123', userId: 'user_demo_123', name: 'Christin (You)', email: 'christin@example.com', role: 'owner', status: 'active' },
      { id: 'mem_rahul', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'member', status: 'active' },
      { id: 'mem_anu', name: 'Anu Verma', email: 'anu@example.com', role: 'member', status: 'active' },
      { id: 'mem_akash', name: 'Akash Gupta', email: 'akash@example.com', role: 'member', status: 'active' }
    ],
    createdAt: '2026-07-20T00:00:00.000Z',
    totalExpenses: 28500,
    settledAmount: 12000,
    outstandingAmount: 16500,
    inviteCode: 'GOA-TRIP-2026'
  },
  {
    id: 'circle_3bhk',
    name: '3 BHK Ki Kahani',
    category: '3 BHK Ki Kahani',
    ownerId: 'user_demo_123',
    members: [
      { id: 'user_demo_123', userId: 'user_demo_123', name: 'Christin (You)', email: 'christin@example.com', role: 'owner', status: 'active' },
      { id: 'mem_vikram', name: 'Vikram Singh', email: 'vikram@example.com', role: 'member', status: 'active' },
      { id: 'mem_rohit', name: 'Rohit Mehta', email: 'rohit@example.com', role: 'member', status: 'active' }
    ],
    createdAt: '2026-06-01T00:00:00.000Z',
    totalExpenses: 42000,
    settledAmount: 30000,
    outstandingAmount: 12000,
    inviteCode: 'FLAT-3BHK-88'
  },
  {
    id: 'circle_chai',
    name: 'Chai, Charcha & Kharcha',
    category: 'Chai, Charcha & Kharcha',
    ownerId: 'user_demo_123',
    members: [
      { id: 'user_demo_123', userId: 'user_demo_123', name: 'Christin (You)', email: 'christin@example.com', role: 'owner', status: 'active' },
      { id: 'mem_priya', name: 'Priya Patel', email: 'priya@example.com', role: 'member', status: 'active' },
      { id: 'mem_rahul', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'member', status: 'active' }
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    totalExpenses: 3400,
    settledAmount: 2000,
    outstandingAmount: 1400,
    inviteCode: 'CHAI-TIME-101'
  },
  {
    id: 'circle_kaminey',
    name: 'Kaminey Dost',
    category: 'Kaminey Dost',
    ownerId: 'user_demo_123',
    members: [
      { id: 'user_demo_123', userId: 'user_demo_123', name: 'Christin (You)', email: 'christin@example.com', role: 'owner', status: 'active' },
      { id: 'mem_akash', name: 'Akash Gupta', email: 'akash@example.com', role: 'member', status: 'active' },
      { id: 'mem_rahul', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'member', status: 'active' },
      { id: 'mem_vikram', name: 'Vikram Singh', email: 'vikram@example.com', role: 'member', status: 'active' }
    ],
    createdAt: '2026-08-10T00:00:00.000Z',
    totalExpenses: 15600,
    settledAmount: 5000,
    outstandingAmount: 10600,
    inviteCode: 'DOST-PARTY-99'
  }
];

export const SAMPLE_CIRCLE_EXPENSES: CircleExpense[] = [
  {
    id: 'cexp_goa_1',
    circleId: 'circle_goa',
    title: 'Beach Resort Advance Booking',
    amount: 16000,
    paidByUserId: 'user_demo_123',
    paidByUserName: 'Christin (You)',
    date: '2026-08-05',
    category: 'Travel',
    splitType: 'equal',
    splits: [
      { userId: 'user_demo_123', userName: 'Christin (You)', amount: 4000 },
      { userId: 'mem_rahul', userName: 'Rahul Sharma', amount: 4000 },
      { userId: 'mem_anu', userName: 'Anu Verma', amount: 4000 },
      { userId: 'mem_akash', userName: 'Akash Gupta', amount: 4000 }
    ],
    notes: 'Baga beach villa booking 3 nights',
    createdAt: '2026-08-05T12:00:00.000Z'
  },
  {
    id: 'cexp_goa_2',
    circleId: 'circle_goa',
    title: 'Scuba Diving & Watersports',
    amount: 8500,
    paidByUserId: 'mem_rahul',
    paidByUserName: 'Rahul Sharma',
    date: '2026-08-07',
    category: 'Entertainment',
    splitType: 'equal',
    splits: [
      { userId: 'user_demo_123', userName: 'Christin (You)', amount: 2125 },
      { userId: 'mem_rahul', userName: 'Rahul Sharma', amount: 2125 },
      { userId: 'mem_anu', userName: 'Anu Verma', amount: 2125 },
      { userId: 'mem_akash', userName: 'Akash Gupta', amount: 2125 }
    ],
    createdAt: '2026-08-07T16:00:00.000Z'
  },
  {
    id: 'cexp_3bhk_1',
    circleId: 'circle_3bhk',
    title: 'Electricity & High-speed Wifi Bill',
    amount: 4500,
    paidByUserId: 'user_demo_123',
    paidByUserName: 'Christin (You)',
    date: '2026-08-10',
    category: 'Bills & Utilities',
    splitType: 'equal',
    splits: [
      { userId: 'user_demo_123', userName: 'Christin (You)', amount: 1500 },
      { userId: 'mem_vikram', userName: 'Vikram Singh', amount: 1500 },
      { userId: 'mem_rohit', userName: 'Rohit Mehta', amount: 1500 }
    ],
    createdAt: '2026-08-10T10:00:00.000Z'
  }
];

export const SAMPLE_SETTLEMENTS: Settlement[] = [
  {
    id: 'set_goa_1',
    circleId: 'circle_goa',
    payerId: 'mem_anu',
    payerName: 'Anu Verma',
    payeeId: 'user_demo_123',
    payeeName: 'Christin (You)',
    amount: 3500,
    date: '2026-08-08',
    status: 'completed',
    notes: 'Google Pay settlement for Goa resort share',
    createdAt: '2026-08-08T18:00:00.000Z'
  }
];

export const SAMPLE_CREDIT_CARDS: CreditCard[] = [
  {
    id: 'cc_hdfc_regalia',
    userId: 'user_demo_123',
    cardName: 'HDFC Regalia Gold',
    bank: 'HDFC Bank',
    last4Digits: '8821',
    creditLimit: 300000,
    statementDate: 15,
    paymentDueDate: 5,
    annualFee: 2500,
    currentOutstanding: 23450,
    minimumDue: 2000,
    cardColor: 'from-purple-900 to-indigo-900'
  },
  {
    id: 'cc_icici_amazon',
    userId: 'user_demo_123',
    cardName: 'ICICI Amazon Pay',
    bank: 'ICICI Bank',
    last4Digits: '4109',
    creditLimit: 150000,
    statementDate: 20,
    paymentDueDate: 10,
    annualFee: 0,
    currentOutstanding: 14800,
    minimumDue: 1500,
    cardColor: 'from-amber-700 to-slate-900'
  },
  {
    id: 'cc_sbi_cashback',
    userId: 'user_demo_123',
    cardName: 'SBI Cashback Card',
    bank: 'SBI Card',
    last4Digits: '9034',
    creditLimit: 100000,
    statementDate: 25,
    paymentDueDate: 15,
    annualFee: 999,
    currentOutstanding: 6200,
    minimumDue: 620,
    cardColor: 'from-sky-800 to-blue-950'
  }
];

export const SAMPLE_EMIS: EMI[] = [
  {
    id: 'emi_iphone16',
    cardId: 'cc_hdfc_regalia',
    title: 'iPhone 16 Pro Max 256GB',
    purchaseAmount: 72000,
    downPayment: 12000,
    principalAmount: 60000,
    tenureMonths: 12,
    paidMonths: 4,
    emiAmount: 5000,
    interestRate: 0,
    nextDueDate: '2026-09-05',
    createdAt: '2026-04-15T00:00:00.000Z'
  },
  {
    id: 'emi_macbook',
    cardId: 'cc_icici_amazon',
    title: 'MacBook Air M3 Work Laptop',
    purchaseAmount: 114000,
    downPayment: 24000,
    principalAmount: 90000,
    tenureMonths: 18,
    paidMonths: 6,
    emiAmount: 5000,
    interestRate: 14,
    nextDueDate: '2026-09-10',
    createdAt: '2026-02-10T00:00:00.000Z'
  }
];

export const SAMPLE_LOANS: Loan[] = [
  {
    id: 'loan_personal',
    userId: 'user_demo_123',
    loanName: 'HDFC Personal Loan',
    lender: 'HDFC Bank',
    loanType: 'personal',
    principal: 200000,
    interestRate: 11.5,
    tenureMonths: 24,
    emiAmount: 9415,
    paidMonths: 8,
    startDate: '2025-12-01',
    endDate: '2027-12-01',
    paymentDayOfMonth: 10,
    outstandingPrincipal: 138500
  }
];

export const SAMPLE_BUDGETS: Budget[] = [
  { id: 'bgt_food', userId: 'user_demo_123', category: 'Food & Dining', monthlyLimit: 12000, spent: 8050, period: '2026-08' },
  { id: 'bgt_travel', userId: 'user_demo_123', category: 'Transportation', monthlyLimit: 6000, spent: 4400, period: '2026-08' },
  { id: 'bgt_shopping', userId: 'user_demo_123', category: 'Shopping', monthlyLimit: 8000, spent: 8500, period: '2026-08' },
  { id: 'bgt_bills', userId: 'user_demo_123', category: 'Bills & Utilities', monthlyLimit: 30000, spent: 29500, period: '2026-08' },
  { id: 'bgt_life', userId: 'user_demo_123', category: 'Lifestyle', monthlyLimit: 5000, spent: 1499, period: '2026-08' }
];

export const SAMPLE_GOALS: Goal[] = [
  {
    id: 'goal_emergency',
    userId: 'user_demo_123',
    name: 'Emergency Reserve Fund',
    targetAmount: 200000,
    currentAmount: 125000,
    targetDate: '2026-12-31',
    accountId: 'acc_sbi',
    icon: 'ShieldCheck',
    color: '#0284c7'
  },
  {
    id: 'goal_vacation',
    userId: 'user_demo_123',
    name: 'Japan Autumn Euro-Trip 2027',
    targetAmount: 250000,
    currentAmount: 85000,
    targetDate: '2027-10-15',
    accountId: 'acc_icici',
    icon: 'Plane',
    color: '#8b5cf6'
  },
  {
    id: 'goal_bike',
    userId: 'user_demo_123',
    name: 'Royal Enfield Himalayan 450',
    targetAmount: 320000,
    currentAmount: 180000,
    targetDate: '2027-03-31',
    accountId: 'acc_hdfc',
    icon: 'Bike',
    color: '#f59e0b'
  }
];

export const SAMPLE_REMINDERS: Reminder[] = [
  {
    id: 'rem_1',
    userId: 'user_demo_123',
    title: 'HDFC Regalia Credit Card Due',
    amount: 23450,
    dueDate: '2026-09-05',
    recurrence: 'monthly',
    category: 'Credit Card Payment',
    accountId: 'acc_hdfc',
    status: 'pending',
    notes: 'Pay full statement balance to avoid finance charges'
  },
  {
    id: 'rem_2',
    userId: 'user_demo_123',
    title: 'HDFC Personal Loan Monthly EMI',
    amount: 9415,
    dueDate: '2026-09-10',
    recurrence: 'monthly',
    category: 'EMI',
    accountId: 'acc_hdfc',
    status: 'pending',
    notes: 'Auto-debit from HDFC salary account'
  },
  {
    id: 'rem_3',
    userId: 'user_demo_123',
    title: 'Airtel Black Fiber Wifi & Mobile Bill',
    amount: 1899,
    dueDate: '2026-08-28',
    recurrence: 'monthly',
    category: 'Bills & Utilities',
    accountId: 'acc_paytm',
    status: 'pending'
  }
];
