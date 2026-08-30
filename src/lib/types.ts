export type TransactionType = 'expense' | 'income' | 'transfer';
export type AccountType = 'bank' | 'cash' | 'wallet' | 'savings' | 'other';
export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';
export type LoanType =
  | 'Personal Loan'
  | 'Home Loan'
  | 'Vehicle Loan'
  | 'Education Loan'
  | 'Other Loan'
  | 'personal'
  | 'home'
  | 'vehicle'
  | 'education'
  | 'other';
export type LoanInterestType = 'Reducing Balance' | 'Flat';
export type LoanStatus = 'Active' | 'Upcoming' | 'Overdue' | 'Completed' | 'Archived';
export type RecurrenceType = 'once' | 'weekly' | 'monthly' | 'yearly';
export type ReminderStatus = 'pending' | 'paid' | 'overdue';

export type DatePeriod =
  | 'all_time'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year';

export interface UserPreferences {
  datePeriod: DatePeriod;
  currency?: string;
  theme?: 'light' | 'dark' | 'system';
  [key: string]: any;
}

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
  fingerprint?: string;
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
export type EMIStatus = 'Active' | 'Completed' | 'Archived' | 'Cancelled' | 'Preclosed';

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
  financedAmount?: number;
  principalAmount: number;
  interestAmount?: number;
  processingFee?: number;
  taxAmount?: number;
  totalPayable?: number;
  monthlyEmi?: number;
  emiAmount: number;
  tenureMonths: number;
  paidMonths?: number;
  paidInstallments?: number;
  remainingInstallments?: number;
  interestRate: number;
  emiType?: EMIType;
  startDate?: string;
  firstDueDate?: string;
  nextDueDate?: string;
  dueDay?: number;
  notes?: string;
  status?: EMIStatus;
  isArchived?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EMIPayment {
  id: string;
  emiId: string;
  cardId: string;
  installmentNumber: number;
  amount: number;
  paymentDate: string;
  accountId?: string;
  notes?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EMIInstallment {
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principal: number;
  interest: number;
  paidAmount?: number;
  remainingAmount?: number;
  status: 'Paid' | 'Partially Paid' | 'Upcoming' | 'Due' | 'Overdue' | 'Skipped';
  paymentDate?: string;
  payments?: EMIPayment[];
}

export interface Loan {
  id: string;
  userId: string;
  loanName: string;
  lender: string;
  loanType: LoanType;
  principal: number; // Original loan amount
  interestRate: number; // Annual interest rate in %
  interestType?: LoanInterestType; // Default 'Reducing Balance'
  tenureMonths: number;
  emiAmount: number;
  paidMonths?: number;
  startDate: string;
  endDate?: string;
  paymentDayOfMonth?: number;
  dueDay?: number;
  linkedAccountId?: string;
  notes?: string;
  outstandingPrincipal?: number;
  status?: LoanStatus;
  isArchived?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  userId: string;
  installmentNumber: number;
  amount: number;
  paymentDate: string;
  principalComponent: number;
  interestComponent: number;
  accountId?: string;
  transactionId?: string;
  notes?: string;
  status?: 'Paid' | 'Partially Paid';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanAmortizationRow {
  installmentNumber: number;
  dueDate: string;
  openingPrincipal: number;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  closingPrincipal: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Paid' | 'Partially Paid' | 'Upcoming' | 'Due' | 'Overdue';
  paymentDate?: string;
  payments?: LoanPayment[];
}

export interface LoanDetailedSummary {
  originalPrincipal: number;
  outstandingPrincipal: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalInterestRemaining: number;
  totalAmountPaid: number;
  totalPayable: number;
  totalOutstanding: number;
  monthlyEMI: number;
  totalTenure: number;
  paidInstallmentsCount: number;
  partiallyPaidCount: number;
  remainingInstallmentsCount: number;
  progressPercentage: number;
  nextDueDate: string;
  nextDueStatus: 'Paid' | 'Partially Paid' | 'Upcoming' | 'Due' | 'Overdue';
  overdueDays: number;
  isCompleted: boolean;
  isArchived: boolean;
  amortizationSchedule: LoanAmortizationRow[];
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  period: string; // e.g. "2026-08" or monthly
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  dueDate?: string;
  notes?: string;
  accountId?: string;
  icon?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
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

export type CadenceType = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
export type ConfidenceLevel = 'High confidence' | 'Likely';
export type RecurringPaymentKind = 'subscription' | 'bill' | 'loan' | 'other';

export interface RecurringPayment {
  id: string;
  userId: string;
  name: string;
  category: string;
  amount: number;
  cadence: CadenceType;
  nextDate: string;
  accountId?: string;
  isActive: boolean;
  notes?: string;
  merchantPattern?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  serviceName: string;
  category: string;
  amount: number;
  cadence: CadenceType;
  nextRenewalDate: string;
  accountId?: string;
  isActive: boolean;
  planTier?: string;
  notes?: string;
  merchantPattern?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DetectedRecurringSuggestion {
  id: string;
  normalizedMerchant: string;
  originalMerchant: string;
  category: string;
  kind: 'subscription' | 'bill' | 'other';
  cadence: CadenceType;
  occurrenceCount: number;
  confidence: ConfidenceLevel;
  averageCharge: number;
  monthlyEquivalent: number;
  annualEquivalent: number;
  nextExpectedDate: string;
  jitterDays: number;
  amountVariationPercent: number;
  matchedTransactionIds: string[];
  lastTransactionDate: string;
  lastAmount: number;
  isIgnored: boolean;
}

