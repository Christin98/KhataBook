export type TransactionType = 'expense' | 'income' | 'transfer';
export type AccountType = 'bank' | 'cash' | 'wallet' | 'savings' | 'other';
export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';
export type LoanType = 'personal' | 'home' | 'vehicle' | 'education' | 'other';
export type RecurrenceType = 'once' | 'weekly' | 'monthly' | 'yearly';
export type ReminderStatus = 'pending' | 'paid' | 'overdue';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: string; // e.g. '₹'
  timezone: string;
  dateFormat: string;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bankName?: string;
  openingBalance: number;
  currentBalance: number;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO String or YYYY-MM-DD
  accountId: string;
  toAccountId?: string; // For transfers
  paymentMethod?: string;
  notes?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CircleMember {
  id: string;
  userId?: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'member';
  status: 'active' | 'pending';
}

export interface Circle {
  id: string;
  name: string;
  category: string; // Fun category, e.g. "Goa Plan (Never Happens)", "3 BHK Ki Kahani"
  ownerId: string;
  members: CircleMember[];
  createdAt: string;
  totalExpenses: number;
  settledAmount: number;
  outstandingAmount: number;
  inviteCode: string;
}

export interface ExpenseSplit {
  userId: string;
  userName: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface CircleExpense {
  id: string;
  circleId: string;
  title: string;
  amount: number;
  paidByUserId: string;
  paidByUserName: string;
  date: string;
  category: string;
  splitType: SplitType;
  splits: ExpenseSplit[];
  notes?: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  circleId: string;
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  amount: number;
  date: string;
  status: 'completed' | 'partial';
  notes?: string;
  createdAt: string;
}

export interface NetBalance {
  memberId: string;
  memberName: string;
  netAmount: number; // positive = gets back, negative = owes
}

export interface SimplifiedDebt {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

export type CardNetwork = 'Visa' | 'Mastercard' | 'American Express' | 'RuPay' | 'Other';
export type CardStatus = 'Active' | 'Blocked' | 'Closed' | 'Archived';
export type CardRewardType = 'None' | 'Cashback' | 'Reward Points' | 'Miles' | 'Other';
export type StatementStatus = 'Upcoming' | 'Due' | 'Partially Paid' | 'Paid' | 'Overdue';
export type CardPaymentType = 'minimum' | 'statement' | 'full' | 'custom';
export type EMIType = 'No-cost EMI' | 'Regular EMI';
export type EMIStatus = 'Active' | 'Completed' | 'Cancelled' | 'Preclosed';

export interface CreditCard {
  id: string;
  userId: string;
  cardName: string;
  bank: string;
  last4Digits: string;
  network?: CardNetwork;
  creditLimit: number;
  currentOutstanding: number;
  statementBalance?: number;
  minimumDue: number;
  statementDate: number; // Day of month 1-31
  paymentDueDate: number; // Day of month 1-31
  interestRate?: number; // Annual % APR e.g. 42
  annualFee?: number;
  rewardType?: CardRewardType;
  rewardRate?: string; // e.g. "5% on Amazon" or "2 pts / ₹100"
  status?: CardStatus;
  cardColor?: string;
  cardTheme?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditCardStatement {
  id: string;
  cardId: string;
  statementDate: string; // YYYY-MM-DD or Month name
  billingPeriodStart: string;
  billingPeriodEnd: string;
  statementAmount: number;
  minimumDue: number;
  paymentDueDate: string;
  paidAmount: number;
  status: StatementStatus;
  createdAt?: string;
}

export interface CreditCardPayment {
  id: string;
  cardId: string;
  statementId?: string;
  accountId?: string;
  amount: number;
  paymentDate: string;
  paymentType: CardPaymentType;
  transactionId?: string;
  notes?: string;
  createdAt?: string;
}

export interface EMI {
  id: string;
  cardId: string;
  transactionId?: string;
  title: string;
  purchaseTitle?: string;
  purchaseAmount: number;
  downPayment?: number;
  principalAmount: number;
  interestAmount?: number;
  processingFee?: number;
  taxAmount?: number;
  totalPayable?: number;
  monthlyEmi?: number;
  emiAmount: number;
  tenureMonths: number;
  paidMonths: number;
  paidInstallments?: number;
  remainingInstallments?: number;
  interestRate: number;
  emiType?: EMIType;
  startDate?: string;
  firstDueDate?: string;
  nextDueDate: string;
  status?: EMIStatus;
  createdAt: string;
}

export interface EMIInstallment {
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principal: number;
  interest: number;
  status: 'Paid' | 'Upcoming' | 'Due' | 'Overdue' | 'Skipped';
}

export interface Loan {
  id: string;
  userId: string;
  loanName: string;
  lender: string;
  loanType: LoanType;
  principal: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  paidMonths: number;
  startDate: string;
  endDate: string;
  paymentDayOfMonth: number;
  outstandingPrincipal: number;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  period: string; // e.g. "2026-08"
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  accountId?: string;
  icon: string;
  color: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  amount: number;
  dueDate: string;
  recurrence: RecurrenceType;
  category: string;
  accountId?: string;
  status: ReminderStatus;
  notes?: string;
}

export interface FinancialHealthScore {
  score: number; // 0 to 100
  rating: 'Needs Care' | 'Fair' | 'Good' | 'Excellent';
  savingsRate: number; // percentage
  debtToIncomeRatio: number; // percentage
  budgetAdherence: number; // percentage
  upcomingDueCount: number;
  insights: string[];
}

export type NotificationType = 'reminder' | 'budget' | 'circle' | 'update' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: NotificationPriority;
  link?: string;
  actionLabel?: string;
  metadata?: {
    reminderId?: string;
    amount?: number;
    dueDate?: string;
    category?: string;
    circleId?: string;
    version?: string;
  };
}

export interface ChangelogFeature {
  title: string;
  description: string;
  icon?: string;
  tag?: string;
}

export interface ChangelogRelease {
  version: string;
  stage: string;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
  features: ChangelogFeature[];
  fixes?: string[];
  isCurrent?: boolean;
}

