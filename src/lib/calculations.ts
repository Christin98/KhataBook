import {
  Account,
  Transaction,
  CreditCard,
  EMI,
  EMIInstallment,
  EMIPayment,
  Loan,
  LoanPayment,
  LoanAmortizationRow,
  LoanDetailedSummary,
  LoanInterestType,
  LoanType,
  LoanStatus,
  Circle,
  CircleExpense,
  Settlement,
  NetBalance,
  SimplifiedDebt,
  Budget,
  FinancialHealthScore,
  DatePeriod
} from './types';
import {
  safeRound,
  toSafeMoney,
  toSafeSignedMoney,
  toSafePercentage,
  toSafeTenure,
  toSafeInterestRate
} from './moneySafe';

export {
  safeRound,
  toSafeMoney,
  toSafeSignedMoney,
  toSafePercentage,
  toSafeTenure,
  toSafeInterestRate
};

/**
 * Format currency with Indian Numbering System (e.g., ₹1,50,000)
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  const safeAmt = toSafeSignedMoney(amount);
  const absoluteValue = Math.abs(safeAmt);
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(absoluteValue);

  return `${safeAmt < 0 ? '-' : ''}${currency}${formattedNumber}`;
}

/**
 * Calculate total active account balance
 */
export function calculateTotalBalance(accounts: Account[]): number {
  return safeRound(
    accounts
      .filter((acc) => acc.isActive)
      .reduce((sum, acc) => sum + toSafeSignedMoney(acc.currentBalance), 0)
  );
}

/**
 * Period Selector Options definitions
 */
export const PERIOD_OPTIONS: { id: DatePeriod; label: string; description: string }[] = [
  { id: 'all_time', label: 'All time', description: 'All records through present' },
  { id: 'this_month', label: 'This month', description: 'Current calendar month' },
  { id: 'last_month', label: 'Last month', description: 'Previous calendar month' },
  { id: 'last_3_months', label: 'Last 3 months', description: 'Past 3 calendar months' },
  { id: 'last_6_months', label: 'Last 6 months', description: 'Past 6 calendar months' },
  { id: 'this_year', label: 'This year', description: 'Current calendar year' }
];

/**
 * Get date range start/end ISO strings for a given period
 */
export function getDateRangeForPeriod(period: DatePeriod, referenceDate: Date = new Date()): {
  startDate: string | null;
  endDate: string | null;
  label: string;
  formattedRange: string;
} {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatPretty = (dStr: string) => {
    const d = new Date(dStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  switch (period) {
    case 'this_month': {
      const start = `${year}-${pad(month + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
      return {
        startDate: start,
        endDate: end,
        label: 'This month',
        formattedRange: `${formatPretty(start)} – ${formatPretty(end)}`
      };
    }
    case 'last_month': {
      const prevMonthDate = new Date(year, month - 1, 1);
      const prevYear = prevMonthDate.getFullYear();
      const prevMonth = prevMonthDate.getMonth();
      const start = `${prevYear}-${pad(prevMonth + 1)}-01`;
      const lastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
      const end = `${prevYear}-${pad(prevMonth + 1)}-${pad(lastDay)}`;
      return {
        startDate: start,
        endDate: end,
        label: 'Last month',
        formattedRange: `${formatPretty(start)} – ${formatPretty(end)}`
      };
    }
    case 'last_3_months': {
      const startD = new Date(year, month - 2, 1);
      const start = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
      return {
        startDate: start,
        endDate: end,
        label: 'Last 3 months',
        formattedRange: `${formatPretty(start)} – ${formatPretty(end)}`
      };
    }
    case 'last_6_months': {
      const startD = new Date(year, month - 5, 1);
      const start = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
      return {
        startDate: start,
        endDate: end,
        label: 'Last 6 months',
        formattedRange: `${formatPretty(start)} – ${formatPretty(end)}`
      };
    }
    case 'this_year': {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      return {
        startDate: start,
        endDate: end,
        label: 'This year',
        formattedRange: `${formatPretty(start)} – ${formatPretty(end)}`
      };
    }
    case 'all_time':
    default: {
      return {
        startDate: null,
        endDate: null,
        label: 'All time',
        formattedRange: 'All historical records'
      };
    }
  }
}

/**
 * Filter transactions by DatePeriod
 */
export function filterTransactionsByPeriod(transactions: Transaction[], period: DatePeriod): Transaction[] {
  if (period === 'all_time') {
    return transactions;
  }
  const range = getDateRangeForPeriod(period);
  if (!range.startDate || !range.endDate) {
    return transactions;
  }
  return transactions.filter((t) => {
    if (!t.date) return false;
    const dateStr = t.date.length >= 10 ? t.date.substring(0, 10) : t.date;
    return dateStr >= range.startDate! && dateStr <= range.endDate!;
  });
}

/**
 * Calculate Summary (Income, Expenses, Savings, Savings Rate) for DatePeriod
 */
export function calculatePeriodSummary(transactions: Transaction[], period: DatePeriod) {
  const periodTxns = filterTransactionsByPeriod(transactions, period);

  const income = safeRound(
    periodTxns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + toSafeMoney(t.amount), 0)
  );

  const expenses = safeRound(
    periodTxns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + toSafeMoney(t.amount), 0)
  );

  const savings = safeRound(income - expenses);
  const savingsRate = income > 0 ? toSafePercentage(income - expenses, income, 0, 100) : 0;

  return {
    income,
    expenses,
    savings,
    savingsRate,
    count: periodTxns.length,
    incomeCount: periodTxns.filter((t) => t.type === 'income').length,
    expenseCount: periodTxns.filter((t) => t.type === 'expense').length
  };
}

/**
 * Calculate genuine prior-period comparison metrics derived exclusively from actual saved data.
 * Returns hasPriorData: false when insufficient history exists.
 */
export function calculatePeriodComparison(transactions: Transaction[], period: DatePeriod) {
  const currentSummary = calculatePeriodSummary(transactions, period);
  const now = new Date();

  let priorTxns: Transaction[] = [];
  let priorPeriodLabel = '';

  if (period === 'this_month') {
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    priorTxns = filterTransactionsByMonth(transactions, lastMonthStr);
    priorPeriodLabel = 'last month';
  } else if (period === 'last_month') {
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    priorTxns = filterTransactionsByMonth(transactions, prevMonthStr);
    priorPeriodLabel = 'prior month';
  } else if (period === 'last_3_months') {
    const startM = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const endM = new Date(now.getFullYear(), now.getMonth() - 3, 0);
    const startStr = startM.toISOString().split('T')[0];
    const endStr = endM.toISOString().split('T')[0];
    priorTxns = transactions.filter((t) => t.date && t.date >= startStr && t.date <= endStr);
    priorPeriodLabel = 'prior 3M';
  } else if (period === 'last_6_months') {
    const startM = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const endM = new Date(now.getFullYear(), now.getMonth() - 6, 0);
    const startStr = startM.toISOString().split('T')[0];
    const endStr = endM.toISOString().split('T')[0];
    priorTxns = transactions.filter((t) => t.date && t.date >= startStr && t.date <= endStr);
    priorPeriodLabel = 'prior 6M';
  } else if (period === 'this_year') {
    const priorYearStr = `${now.getFullYear() - 1}`;
    priorTxns = transactions.filter((t) => t.date && t.date.startsWith(priorYearStr));
    priorPeriodLabel = 'last year';
  }

  const hasPriorData = priorTxns.length > 0 && currentSummary.count > 0;
  if (!hasPriorData) {
    return {
      hasPriorData: false,
      priorPeriodLabel: '',
      incomeDelta: null,
      expenseDelta: null,
      savingsRateDelta: null
    };
  }

  const priorIncome = safeRound(
    priorTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0)
  );
  const priorExpenses = safeRound(
    priorTxns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0)
  );
  const priorSavings = safeRound(priorIncome - priorExpenses);
  const priorSavingsRate = priorIncome > 0 ? safeRound(((priorIncome - priorExpenses) / priorIncome) * 100) : 0;

  const incomeDelta = priorIncome > 0 ? safeRound(((currentSummary.income - priorIncome) / priorIncome) * 100) : null;
  const expenseDelta = priorExpenses > 0 ? safeRound(((currentSummary.expenses - priorExpenses) / priorExpenses) * 100) : null;
  const savingsRateDelta = (currentSummary.income > 0 && priorIncome > 0) ? safeRound(currentSummary.savingsRate - priorSavingsRate) : null;

  return {
    hasPriorData: true,
    priorPeriodLabel,
    incomeDelta,
    expenseDelta,
    savingsRateDelta,
    priorIncome,
    priorExpenses,
    priorSavingsRate
  };
}

/**
 * Filter transactions by month (format YYYY-MM)
 */
export function filterTransactionsByMonth(transactions: Transaction[], monthStr: string): Transaction[] {
  return transactions.filter((t) => t.date && t.date.startsWith(monthStr));
}

/**
 * Calculate Monthly Income & Expense
 */
export function calculateMonthlySummary(transactions: Transaction[], monthStr: string) {
  const monthlyTxns = filterTransactionsByMonth(transactions, monthStr);

  const income = safeRound(
    monthlyTxns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const expenses = safeRound(
    monthlyTxns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const savings = safeRound(income - expenses);
  const savingsRate = income > 0 ? safeRound((savings / income) * 100) : 0;

  return { income, expenses, savings, savingsRate };
}

/**
 * Calculate dynamic monthly cashflow trend for chart rendering
 */
export function calculateMonthlyCashflowTrend(transactions: Transaction[], monthCount: number = 4) {
  const result: { name: string; month: string; monthKey: string; Income: number; Expense: number; Savings: number }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const now = new Date();
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${monthNum}`;
    const monthName = monthNames[d.getMonth()];

    const summary = calculateMonthlySummary(transactions, monthKey);
    result.push({
      name: monthName,
      month: monthName,
      monthKey,
      Income: summary.income,
      Expense: summary.expenses,
      Savings: summary.savings
    });
  }

  return result;
}

/**
 * Calculate dynamic period cashflow trend for charts adapting to active period
 */
export function calculatePeriodCashflowTrend(transactions: Transaction[], period: DatePeriod) {
  let monthCount = 6;
  if (period === 'this_month' || period === 'last_month') {
    monthCount = 4;
  } else if (period === 'last_3_months') {
    monthCount = 3;
  } else if (period === 'last_6_months') {
    monthCount = 6;
  } else if (period === 'this_year') {
    const now = new Date();
    monthCount = Math.max(now.getMonth() + 1, 4);
  } else if (period === 'all_time') {
    monthCount = 6;
  }

  return calculateMonthlyCashflowTrend(transactions, monthCount);
}

/**
 * Calculate total Credit Card Outstanding, Limit, Available, Minimum Due, and Overall Utilization
 */
export function calculateCreditCardSummary(cards: CreditCard[]) {
  const activeCards = cards.filter((c) => c.status !== 'Archived');
  const totalLimit = safeRound(activeCards.reduce((sum, c) => sum + (c.creditLimit || 0), 0));
  const totalOutstanding = safeRound(activeCards.reduce((sum, c) => sum + (c.currentOutstanding || 0), 0));
  const totalAvailable = safeRound(Math.max(0, totalLimit - totalOutstanding));
  const totalMinimumDue = safeRound(activeCards.reduce((sum, c) => sum + (c.minimumDue || 0), 0));
  const totalDueThisMonth = safeRound(
    activeCards.reduce((sum, c) => sum + (c.statementBalance ?? (c.minimumDue > 0 ? c.minimumDue : c.currentOutstanding) ?? 0), 0)
  );
  const overallUtilization = totalLimit > 0 ? safeRound((totalOutstanding / totalLimit) * 100) : 0;

  return {
    totalLimit,
    totalOutstanding,
    totalAvailable,
    totalMinimumDue,
    totalDueThisMonth,
    overallUtilization
  };
}

/**
 * Utilization health status profile (0-30% Healthy, 30-50% Moderate, 50-75% High, 75%+ Very High)
 */
export function getCreditUtilizationStatus(utilizationPct: number): {
  label: 'Healthy' | 'Moderate' | 'High' | 'Very High';
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
} {
  if (utilizationPct <= 30) {
    return {
      label: 'Healthy',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-500/30',
      description: 'Healthy utilization (<30%) protects your credit score.'
    };
  }
  if (utilizationPct <= 50) {
    return {
      label: 'Moderate',
      color: '#f59e0b',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-700 dark:text-amber-300',
      badgeBorder: 'border-amber-500/30',
      description: 'Moderate utilization (30-50%). Aim to keep under 30%.'
    };
  }
  if (utilizationPct <= 75) {
    return {
      label: 'High',
      color: '#f97316',
      badgeBg: 'bg-orange-500/15',
      badgeText: 'text-orange-700 dark:text-orange-300',
      badgeBorder: 'border-orange-500/30',
      description: 'High utilization (50-75%). Pay down balances to avoid interest.'
    };
  }
  return {
    label: 'Very High',
    color: '#ef4444',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-500/30',
    description: 'Very high utilization (>75%). Immediate debt reduction recommended.'
  };
}

/**
 * Calculate Monthly EMI Commitment and Total Outstanding EMI Debt
 */
export function calculateMonthlyEMICommitment(emis: EMI[], payments: EMIPayment[] = []) {
  const activeEMIs = emis.filter(
    (e) =>
      e.status !== 'Completed' &&
      e.status !== 'Preclosed' &&
      e.status !== 'Cancelled' &&
      e.status !== 'Archived' &&
      !e.isArchived &&
      !e.isDeleted
  );

  const monthlyCommitment = safeRound(
    activeEMIs.reduce((sum, e) => sum + (e.monthlyEmi || e.emiAmount || 0), 0)
  );

  const totalRemainingDebt = safeRound(
    activeEMIs.reduce((sum, e) => {
      const summary = calculateEMIDetailedSummary(e, payments);
      return sum + summary.totalOutstanding;
    }, 0)
  );

  return {
    monthlyCommitment,
    totalRemainingDebt,
    activeCount: activeEMIs.length
  };
}

/**
 * Compute EMI financial breakdown for No-Cost vs Regular EMI
 */
export function calculateEMIFinancials(
  principal: number,
  tenureMonths: number,
  interestRate: number = 0,
  processingFee: number = 0,
  isNoCost: boolean = false
): {
  principal: number;
  interestAmount: number;
  processingFee: number;
  taxAmount: number;
  totalPayable: number;
  monthlyEmi: number;
} {
  const safePrincipal = toSafeMoney(principal);
  const safeTenure = toSafeTenure(tenureMonths, 1, 120);
  const safeRate = toSafeInterestRate(interestRate, 0, 100);
  const safeProcFee = toSafeMoney(processingFee);
  const taxAmount = safeRound(safeProcFee * 0.18); // 18% GST on processing fee

  if (isNoCost || safeRate <= 0) {
    const monthlyEmi = safeRound(safePrincipal / safeTenure);
    const totalPayable = safeRound(safePrincipal + safeProcFee + taxAmount);
    return {
      principal: safePrincipal,
      interestAmount: 0,
      processingFee: safeProcFee,
      taxAmount,
      totalPayable,
      monthlyEmi
    };
  }

  // Regular EMI with reducing balance formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
  const r = (safeRate / 12) / 100;
  const emiFactor = Math.pow(1 + r, safeTenure);
  let monthlyEmi = safeRound(safePrincipal / safeTenure);

  if (emiFactor > 1 && !isNaN(emiFactor) && isFinite(emiFactor)) {
    const calculatedEmi = (safePrincipal * r * emiFactor) / (emiFactor - 1);
    if (!isNaN(calculatedEmi) && isFinite(calculatedEmi)) {
      monthlyEmi = toSafeMoney(calculatedEmi);
    }
  }

  const totalRepayment = safeRound(monthlyEmi * safeTenure);
  const interestAmount = safeRound(Math.max(0, totalRepayment - safePrincipal));
  const totalPayable = safeRound(totalRepayment + safeProcFee + taxAmount);

  return {
    principal: safePrincipal,
    interestAmount,
    processingFee: safeProcFee,
    taxAmount,
    totalPayable,
    monthlyEmi
  };
}

/**
 * Calculate derived annual interest rate (% p.a.) from Principal, Monthly EMI, and Tenure (formatted to 2 decimal places)
 */
export function calculateDerivedInterestRate(
  principal: number,
  monthlyEmi: number,
  tenureMonths: number
): number {
  if (principal <= 0 || monthlyEmi <= 0 || tenureMonths <= 0) return 0;
  const totalPayable = monthlyEmi * tenureMonths;
  if (totalPayable <= principal) return 0;

  const totalInterest = totalPayable - principal;
  const flatRate = (totalInterest / principal) / (tenureMonths / 12) * 100;
  return Number(flatRate.toFixed(2));
}

/**
 * Generate full installment schedule for an EMI with amortization and overdue handling
 */
export function generateEMISchedule(emi: EMI): EMIInstallment[] {
  const tenure = Math.max(1, emi.tenureMonths || 12);
  const emiAmt = emi.monthlyEmi || emi.emiAmount || safeRound((emi.totalPayable ?? emi.purchaseAmount) / tenure);
  const paidCount = Math.min(tenure, Math.max(0, emi.paidInstallments ?? emi.paidMonths ?? 0));
  const interestRate = emi.interestRate || 0;
  const totalPurch = emi.principalAmount || emi.purchaseAmount || 0;
  const totalPay = emi.totalPayable || (emiAmt * tenure);
  const derivedInterest = Math.max(0, (emi.interestAmount ?? (totalPay - totalPurch)));
  const isNoCost = emi.emiType === 'No-cost EMI' && derivedInterest <= 0;

  const schedule: EMIInstallment[] = [];
  const baseDate = emi.firstDueDate ? new Date(emi.firstDueDate) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let runningPrincipal = totalPurch;
  const monthlyRate = interestRate > 0 ? (interestRate / 12) / 100 : 0;
  const flatMonthlyInterest = tenure > 0 ? safeRound(derivedInterest / tenure) : 0;

  for (let i = 1; i <= tenure; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(baseDate.getMonth() + (i - 1));
    dueDate.setHours(0, 0, 0, 0);

    let principalPortion = 0;
    let interestPortion = 0;

    if (isNoCost || derivedInterest <= 0) {
      principalPortion = safeRound(runningPrincipal / (tenure - i + 1));
      interestPortion = 0;
      runningPrincipal = Math.max(0, runningPrincipal - principalPortion);
    } else if (interestRate > 0) {
      interestPortion = safeRound(runningPrincipal * monthlyRate);
      principalPortion = safeRound(Math.min(runningPrincipal, Math.max(0, emiAmt - interestPortion)));
      runningPrincipal = Math.max(0, runningPrincipal - principalPortion);
    } else {
      // Derived finance cost without known APR
      interestPortion = i === tenure ? Math.max(0, derivedInterest - flatMonthlyInterest * (tenure - 1)) : flatMonthlyInterest;
      principalPortion = safeRound(Math.max(0, emiAmt - interestPortion));
      runningPrincipal = Math.max(0, runningPrincipal - principalPortion);
    }

    let status: 'Paid' | 'Upcoming' | 'Due' | 'Overdue' = 'Upcoming';
    if (i <= paidCount) {
      status = 'Paid';
    } else {
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        status = 'Overdue';
      } else if (diffDays <= 7 && i === paidCount + 1) {
        status = 'Due';
      } else {
        status = 'Upcoming';
      }
    }

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      emiAmount: emiAmt,
      principal: principalPortion,
      interest: interestPortion,
      status
    });
  }

  return schedule;
}

/**
 * Compute calculations for an ongoing / existing EMI
 */
export function calculateOngoingEMIFinancials(
  originalAmount: number,
  monthlyEmi: number,
  tenureMonths: number,
  paidInstallments: number,
  firstDueDateStr: string,
  interestRate: number = 0,
  isNoCost: boolean = false,
  baseDate: Date = new Date()
) {
  const safeOriginalAmount = toSafeMoney(originalAmount);
  const safeTenure = toSafeTenure(tenureMonths, 1, 120);
  const safeMonthlyEmi = toSafeMoney(monthlyEmi, safeRound(safeOriginalAmount / safeTenure));
  
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  const firstDate = firstDueDateStr ? new Date(firstDueDateStr) : new Date(baseDate);
  firstDate.setHours(0, 0, 0, 0);

  // Generate all installment due dates
  const installmentDates: Date[] = [];
  let dueReachedCount = 0;

  for (let i = 0; i < safeTenure; i++) {
    const d = new Date(firstDate);
    d.setMonth(firstDate.getMonth() + i);
    d.setHours(0, 0, 0, 0);
    installmentDates.push(d);

    // Has this installment reached or passed today's date?
    if (d <= today) {
      dueReachedCount++;
    }
  }

  // Maximum allowable paid installments cannot exceed the number of installments reached by today
  const maxAllowedPaid = dueReachedCount;
  const isPaidExceeded = paidInstallments > maxAllowedPaid;
  const safePaidCount = Math.max(0, Math.min(safeTenure, Math.round(paidInstallments || 0)));

  const totalPayable = safeRound(safeMonthlyEmi * safeTenure);
  const totalInterest = safeRound(Math.max(0, totalPayable - safeOriginalAmount));
  const paidAmount = safeRound(safePaidCount * safeMonthlyEmi);
  const remainingAmount = safeRound(Math.max(0, totalPayable - paidAmount));
  const remainingInstallments = Math.max(0, safeTenure - safePaidCount);

  // Overdue count: installments that have reached due date by today but are not marked as paid
  const overdueCount = Math.max(0, dueReachedCount - safePaidCount);

  // Next Due Date: the earliest UNPAID installment date
  let nextDueDate = firstDueDateStr;
  let nextDueStatus: 'Paid' | 'Overdue' | 'Due Today' | 'Upcoming' = 'Upcoming';

  if (safePaidCount < safeTenure && installmentDates[safePaidCount]) {
    const earliestUnpaidDate = installmentDates[safePaidCount];
    nextDueDate = earliestUnpaidDate.toISOString().split('T')[0];

    if (earliestUnpaidDate < today) {
      nextDueStatus = 'Overdue';
    } else if (earliestUnpaidDate.getTime() === today.getTime()) {
      nextDueStatus = 'Due Today';
    } else {
      nextDueStatus = 'Upcoming';
    }
  } else if (safePaidCount >= safeTenure) {
    nextDueStatus = 'Paid';
  }

  return {
    totalPayable,
    totalInterest,
    paidAmount,
    remainingAmount,
    remainingInstallments,
    dueReachedCount,
    maxAllowedPaid,
    isPaidExceeded,
    overdueCount,
    nextDueDate,
    nextDueStatus,
    installmentDates: installmentDates.map((d) => d.toISOString().split('T')[0])
  };
}

export interface EMIDetailedSummary {
  originalAmount: number;
  downPayment: number;
  financedAmount: number;
  emiAmount: number;
  totalTenure: number;
  totalPayable: number;
  totalPaid: number;
  totalOutstanding: number;
  paidInstallmentsCount: number;
  partiallyPaidCount: number;
  remainingInstallmentsCount: number;
  overdueCount: number;
  progressPercentage: number;
  nextDueDate: string;
  nextInstallmentNumber: number | null;
  isCompleted: boolean;
  isArchived: boolean;
  installments: EMIInstallment[];
}

/**
 * Calculate comprehensive, money-safe metrics for an EMI incorporating individual EMIPayment records
 */
export function calculateEMIDetailedSummary(
  emi: EMI,
  payments: EMIPayment[] = []
): EMIDetailedSummary {
  const totalTenure = toSafeTenure(emi.tenureMonths || 12, 1, 120);
  const originalAmount = toSafeMoney(emi.purchaseAmount || emi.principalAmount || 0);
  const downPayment = toSafeMoney(emi.downPayment || 0);
  const financedAmount = safeRound(Math.max(0, originalAmount - downPayment));
  const emiAmount = toSafeMoney(emi.monthlyEmi || emi.emiAmount || safeRound(financedAmount / totalTenure));
  const interestRate = toSafeInterestRate(emi.interestRate || 0);
  const procFee = toSafeMoney(emi.processingFee || 0);
  const taxAmt = toSafeMoney(emi.taxAmount || 0);
  const totalAssetPrice = safeRound(originalAmount > 0 ? (originalAmount + procFee + taxAmt) : (financedAmount + downPayment + procFee + taxAmt));
  const financedTotalPayable = safeRound(
    emi.totalPayable && emi.totalPayable > 0
      ? emi.totalPayable
      : (emiAmount * totalTenure + procFee + taxAmt)
  );
  const totalPayable = safeRound(
    financedTotalPayable >= totalAssetPrice
      ? financedTotalPayable
      : financedTotalPayable + downPayment
  );

  const baseDate = emi.startDate || emi.firstDueDate ? new Date(emi.startDate || emi.firstDueDate!) : new Date(emi.createdAt || new Date());
  if (isNaN(baseDate.getTime())) baseDate.setTime(Date.now());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter payments linked to this EMI
  const emiPayments = payments.filter((p) => p.emiId === emi.id);
  const hasPaymentRecords = emiPayments.length > 0;

  // Legacy fallback if no EMIPayment objects exist yet
  const legacyPaidCount = Math.min(
    totalTenure,
    Math.max(0, toSafeTenure(emi.paidInstallments ?? emi.paidMonths ?? 0, 0, 120))
  );

  const installments: EMIInstallment[] = [];
  let paidInstallmentsCount = 0;
  let partiallyPaidCount = 0;
  let overdueCount = 0;
  let firstUnpaidInstallmentNum: number | null = null;
  let nextDueDateStr = emi.nextDueDate || '';

  for (let i = 1; i <= totalTenure; i++) {
    const due = new Date(baseDate);
    due.setMonth(baseDate.getMonth() + (i - 1));
    due.setHours(0, 0, 0, 0);
    const dueDateFormatted = due.toISOString().split('T')[0];

    let paidForThis = 0;
    let matchingPayments: EMIPayment[] = [];

    if (hasPaymentRecords) {
      matchingPayments = emiPayments.filter((p) => p.installmentNumber === i);
      paidForThis = safeRound(matchingPayments.reduce((s, p) => s + toSafeMoney(p.amount), 0));
    } else {
      if (i <= legacyPaidCount) {
        paidForThis = emiAmount;
      }
    }

    const remainingForThis = safeRound(Math.max(0, emiAmount - paidForThis));
    let status: 'Paid' | 'Partially Paid' | 'Upcoming' | 'Due' | 'Overdue' = 'Upcoming';

    if (paidForThis >= emiAmount && emiAmount > 0) {
      status = 'Paid';
      paidInstallmentsCount++;
    } else if (paidForThis > 0) {
      status = 'Partially Paid';
      partiallyPaidCount++;
      if (firstUnpaidInstallmentNum === null) {
        firstUnpaidInstallmentNum = i;
        nextDueDateStr = dueDateFormatted;
      }
    } else {
      if (due < today) {
        status = 'Overdue';
        overdueCount++;
      } else {
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          status = 'Due';
        } else {
          status = 'Upcoming';
        }
      }
      if (firstUnpaidInstallmentNum === null) {
        firstUnpaidInstallmentNum = i;
        nextDueDateStr = dueDateFormatted;
      }
    }

    installments.push({
      installmentNumber: i,
      dueDate: dueDateFormatted,
      emiAmount,
      principal: emiAmount,
      interest: 0,
      paidAmount: paidForThis,
      remainingAmount: remainingForThis,
      status,
      paymentDate: matchingPayments[matchingPayments.length - 1]?.paymentDate,
      payments: matchingPayments
    });
  }

  const paidInstallmentsSum = hasPaymentRecords
    ? safeRound(emiPayments.reduce((s, p) => s + toSafeMoney(p.amount), 0))
    : safeRound(legacyPaidCount * emiAmount);

  const totalPaid = safeRound(paidInstallmentsSum + downPayment);
  const totalOutstanding = safeRound(Math.max(0, financedTotalPayable - paidInstallmentsSum));
  const remainingInstallmentsCount = Math.max(0, totalTenure - paidInstallmentsCount);
  const progressPercentage =
    totalPayable > 0 ? Math.min(100, Math.max(0, safeRound((totalPaid / totalPayable) * 100))) : 0;

  const isCompleted =
    paidInstallmentsCount >= totalTenure ||
    totalOutstanding <= 0 ||
    emi.status === 'Completed' ||
    emi.status === 'Preclosed';

  if (isCompleted) {
    nextDueDateStr = 'Completed';
  }

  return {
    originalAmount,
    downPayment,
    financedAmount,
    emiAmount,
    totalTenure,
    totalPayable,
    totalPaid,
    totalOutstanding,
    paidInstallmentsCount,
    partiallyPaidCount,
    remainingInstallmentsCount,
    overdueCount,
    progressPercentage,
    nextDueDate: nextDueDateStr || emi.nextDueDate || baseDate.toISOString().split('T')[0],
    nextInstallmentNumber: firstUnpaidInstallmentNum,
    isCompleted,
    isArchived: emi.isArchived === true || emi.status === 'Archived',
    installments
  };
}

/**
 * Safely compute upcoming statement date and payment due date from day-of-month (1-31)
 */
export function getNextBillingDates(
  statementDay: number = 15,
  paymentDueDay: number = 5,
  baseDate: Date = new Date()
): {
  nextStatementDate: string;
  nextPaymentDueDate: string;
  statementDateObj: Date;
  paymentDueDateObj: Date;
} {
  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth();
  const todayDate = baseDate.getDate();

  const clampDay = (year: number, month: number, day: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Math.min(Math.max(1, day), daysInMonth);
  };

  // 1. Calculate next statement date
  let stmtYear = currentYear;
  let stmtMonth = currentMonth;
  if (todayDate > statementDay) {
    stmtMonth += 1;
    if (stmtMonth > 11) {
      stmtMonth = 0;
      stmtYear += 1;
    }
  }
  const safeStmtDay = clampDay(stmtYear, stmtMonth, statementDay);
  const statementDateObj = new Date(stmtYear, stmtMonth, safeStmtDay);

  // 2. Calculate next payment due date
  let dueYear = currentYear;
  let dueMonth = currentMonth;
  if (todayDate > paymentDueDay) {
    dueMonth += 1;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
  }
  const safeDueDay = clampDay(dueYear, dueMonth, paymentDueDay);
  const paymentDueDateObj = new Date(dueYear, dueMonth, safeDueDay);

  return {
    nextStatementDate: statementDateObj.toISOString().split('T')[0],
    nextPaymentDueDate: paymentDueDateObj.toISOString().split('T')[0],
    statementDateObj,
    paymentDueDateObj
  };
}

/**
 * Format relative due badge and text (e.g. "Due in 3 days · Sep 5" or "Due Today · Aug 26")
 */
export function getRelativeDueLabel(
  dueDateStr: string,
  baseDate: Date = new Date()
): {
  label: string;
  shortLabel: string;
  status: 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming' | 'Paid';
  diffDays: number;
} {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${monthNames[due.getMonth()]} ${due.getDate()}`;

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      label: `Overdue by ${absDays} day${absDays > 1 ? 's' : ''} · ${formattedDate}`,
      shortLabel: `Overdue (${absDays}d ago)`,
      status: 'Overdue',
      diffDays
    };
  }
  if (diffDays === 0) {
    return {
      label: `Due Today · ${formattedDate}`,
      shortLabel: 'Due Today',
      status: 'Due Today',
      diffDays: 0
    };
  }
  if (diffDays === 1) {
    return {
      label: `Due Tomorrow · ${formattedDate}`,
      shortLabel: 'Due Tomorrow',
      status: 'Due Soon',
      diffDays: 1
    };
  }
  if (diffDays <= 5) {
    return {
      label: `Due in ${diffDays} days · ${formattedDate}`,
      shortLabel: `Due in ${diffDays}d`,
      status: 'Due Soon',
      diffDays
    };
  }
  return {
    label: `Due in ${diffDays} days · ${formattedDate}`,
    shortLabel: formattedDate,
    status: 'Upcoming',
    diffDays
  };
}

/**
 * Calculate Monthly EMI for a Loan based on Principal, Interest Rate, Tenure, and Method
 */
export function calculateLoanEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  interestType: LoanInterestType = 'Reducing Balance'
): number {
  const p = toSafeMoney(principal);
  const r = toSafeInterestRate(annualRate);
  const n = toSafeTenure(tenureMonths, 1, 480);
  if (p <= 0 || n <= 0) return 0;

  if (interestType === 'Flat') {
    const totalInterest = (p * r * (n / 12)) / 100;
    return safeRound((p + totalInterest) / n);
  }

  // Reducing Balance (Standard Amortization Formula)
  const monthlyRate = r / (12 * 100);
  if (monthlyRate === 0) return safeRound(p / n);

  const factor = Math.pow(1 + monthlyRate, n);
  const emi = (p * monthlyRate * factor) / (factor - 1);
  return safeRound(emi);
}

/**
 * Generate Complete Amortization Schedule for a Loan
 */
export function calculateLoanAmortizationSchedule(
  loan: Loan,
  payments: LoanPayment[] = []
): LoanAmortizationRow[] {
  const originalPrincipal = toSafeMoney(loan.principal);
  const annualRate = toSafeInterestRate(loan.interestRate);
  const totalTenure = toSafeTenure(loan.tenureMonths, 1, 480);
  const interestType: LoanInterestType = loan.interestType || 'Reducing Balance';
  const emiAmount = toSafeMoney(
    loan.emiAmount && loan.emiAmount > 0
      ? loan.emiAmount
      : calculateLoanEMI(originalPrincipal, annualRate, totalTenure, interestType)
  );

  const baseDate = loan.startDate ? new Date(loan.startDate) : new Date(loan.createdAt || Date.now());
  if (isNaN(baseDate.getTime())) baseDate.setTime(Date.now());
  const dueDay = Math.min(31, Math.max(1, loan.dueDay || loan.paymentDayOfMonth || baseDate.getDate() || 10));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const loanPayments = payments.filter((p) => p.loanId === loan.id);
  const hasPaymentRecords = loanPayments.length > 0;
  const legacyPaidCount = Math.min(
    totalTenure,
    Math.max(0, toSafeTenure(loan.paidMonths || 0, 0, 480))
  );

  const schedule: LoanAmortizationRow[] = [];
  let currentBalance = originalPrincipal;
  const monthlyRate = annualRate / (12 * 100);

  // For flat rate:
  const flatMonthlyPrincipal = safeRound(originalPrincipal / totalTenure);
  const flatMonthlyInterest = safeRound(((originalPrincipal * annualRate * (totalTenure / 12)) / 100) / totalTenure);

  for (let i = 1; i <= totalTenure; i++) {
    // Determine due date for installment i
    const due = new Date(baseDate.getFullYear(), baseDate.getMonth() + (i - 1), dueDay);
    const maxDaysInMonth = new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate();
    due.setDate(Math.min(dueDay, maxDaysInMonth));
    due.setHours(0, 0, 0, 0);
    const dueDateFormatted = due.toISOString().split('T')[0];

    const opening = currentBalance;
    let interestPart = 0;
    let principalPart = 0;

    if (interestType === 'Flat') {
      principalPart = Math.min(opening, flatMonthlyPrincipal);
      interestPart = flatMonthlyInterest;
    } else {
      // Reducing Balance
      interestPart = safeRound(opening * monthlyRate);
      principalPart = safeRound(Math.min(opening, Math.max(0, emiAmount - interestPart)));
      if (i === totalTenure) {
        // Final adjustment to zero out remaining principal
        principalPart = opening;
      }
    }

    const closing = safeRound(Math.max(0, opening - principalPart));
    currentBalance = closing;

    // Check payments for this installment
    let paidForThis = 0;
    let matchingPayments: LoanPayment[] = [];

    if (hasPaymentRecords) {
      matchingPayments = loanPayments.filter((p) => p.installmentNumber === i);
      paidForThis = safeRound(matchingPayments.reduce((s, p) => s + toSafeMoney(p.amount), 0));
    } else {
      if (i <= legacyPaidCount) {
        paidForThis = emiAmount;
      }
    }

    const remainingForThis = safeRound(Math.max(0, emiAmount - paidForThis));
    let status: 'Paid' | 'Partially Paid' | 'Upcoming' | 'Due' | 'Overdue' = 'Upcoming';

    if (paidForThis >= emiAmount && emiAmount > 0) {
      status = 'Paid';
    } else if (paidForThis > 0) {
      status = 'Partially Paid';
    } else {
      if (due < today) {
        status = 'Overdue';
      } else {
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          status = 'Due';
        } else {
          status = 'Upcoming';
        }
      }
    }

    schedule.push({
      installmentNumber: i,
      dueDate: dueDateFormatted,
      openingPrincipal: opening,
      emiAmount,
      principalComponent: principalPart,
      interestComponent: interestPart,
      closingPrincipal: closing,
      paidAmount: paidForThis,
      remainingAmount: remainingForThis,
      status,
      paymentDate: matchingPayments[matchingPayments.length - 1]?.paymentDate,
      payments: matchingPayments
    });
  }

  return schedule;
}

/**
 * Calculate Detailed Summary and Repayment Metrics for a Single Loan
 */
export function calculateLoanDetailedSummary(
  loan: Loan,
  payments: LoanPayment[] = []
): LoanDetailedSummary {
  const originalPrincipal = toSafeMoney(loan.principal);
  const totalTenure = toSafeTenure(loan.tenureMonths, 1, 480);
  const amortizationSchedule = calculateLoanAmortizationSchedule(loan, payments);
  const emiAmount = amortizationSchedule[0]?.emiAmount || toSafeMoney(loan.emiAmount);

  const loanPayments = payments.filter((p) => p.loanId === loan.id);
  const hasPaymentRecords = loanPayments.length > 0;

  let totalPrincipalPaid = 0;
  let totalInterestPaid = 0;
  let paidInstallmentsCount = 0;
  let partiallyPaidCount = 0;
  let nextDueDate = '';
  let nextDueStatus: 'Paid' | 'Partially Paid' | 'Upcoming' | 'Due' | 'Overdue' = 'Upcoming';
  let overdueDays = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  amortizationSchedule.forEach((row) => {
    if (row.status === 'Paid') {
      paidInstallmentsCount++;
      totalPrincipalPaid += row.principalComponent;
      totalInterestPaid += row.interestComponent;
    } else if (row.status === 'Partially Paid') {
      partiallyPaidCount++;
      // Calculate proportional principal & interest for partial payments
      const ratio = row.emiAmount > 0 ? Math.min(1, row.paidAmount / row.emiAmount) : 0;
      totalPrincipalPaid += safeRound(row.principalComponent * ratio);
      totalInterestPaid += safeRound(row.interestComponent * ratio);

      if (!nextDueDate) {
        nextDueDate = row.dueDate;
        nextDueStatus = 'Partially Paid';
        const rowDue = new Date(row.dueDate);
        if (rowDue < today) {
          overdueDays = Math.ceil((today.getTime() - rowDue.getTime()) / (1000 * 60 * 60 * 24));
        }
      }
    } else {
      if (!nextDueDate) {
        nextDueDate = row.dueDate;
        nextDueStatus = row.status;
        const rowDue = new Date(row.dueDate);
        if (rowDue < today) {
          overdueDays = Math.ceil((today.getTime() - rowDue.getTime()) / (1000 * 60 * 60 * 24));
        }
      }
    }
  });

  // If explicit payment records exist with custom principal/interest breakdowns, honor them
  if (hasPaymentRecords) {
    const explicitPrincipalSum = loanPayments.reduce(
      (s, p) => s + (p.principalComponent !== undefined && p.principalComponent > 0 ? toSafeMoney(p.principalComponent) : 0),
      0
    );
    const explicitInterestSum = loanPayments.reduce(
      (s, p) => s + (p.interestComponent !== undefined && p.interestComponent > 0 ? toSafeMoney(p.interestComponent) : 0),
      0
    );

    if (explicitPrincipalSum > 0 || explicitInterestSum > 0) {
      totalPrincipalPaid = safeRound(explicitPrincipalSum);
      totalInterestPaid = safeRound(explicitInterestSum);
    }
  }

  totalPrincipalPaid = safeRound(Math.min(originalPrincipal, totalPrincipalPaid));
  const outstandingPrincipal = safeRound(Math.max(0, originalPrincipal - totalPrincipalPaid));

  const totalTheoreticalInterest = safeRound(
    amortizationSchedule.reduce((s, r) => s + r.interestComponent, 0)
  );
  const totalInterestRemaining = safeRound(Math.max(0, totalTheoreticalInterest - totalInterestPaid));
  const totalAmountPaid = safeRound(totalPrincipalPaid + totalInterestPaid);
  const totalPayable = safeRound(originalPrincipal + totalTheoreticalInterest);
  const totalOutstanding = safeRound(outstandingPrincipal + totalInterestRemaining);

  const remainingInstallmentsCount = Math.max(0, totalTenure - paidInstallmentsCount);
  const progressPercentage =
    originalPrincipal > 0
      ? Math.min(100, Math.max(0, safeRound((totalPrincipalPaid / originalPrincipal) * 100)))
      : 0;

  const isCompleted =
    outstandingPrincipal <= 0 ||
    paidInstallmentsCount >= totalTenure ||
    loan.status === 'Completed';

  const isArchived = loan.isArchived === true || loan.status === 'Archived';

  return {
    originalPrincipal,
    outstandingPrincipal,
    totalPrincipalPaid,
    totalInterestPaid,
    totalInterestRemaining,
    totalAmountPaid,
    totalPayable,
    totalOutstanding,
    monthlyEMI: emiAmount,
    totalTenure,
    paidInstallmentsCount,
    partiallyPaidCount,
    remainingInstallmentsCount,
    progressPercentage,
    nextDueDate: nextDueDate || loan.endDate || 'Completed',
    nextDueStatus: isCompleted ? 'Paid' : nextDueStatus,
    overdueDays,
    isCompleted,
    isArchived,
    amortizationSchedule
  };
}

/**
 * Calculate Top Level Loan Summaries across all Active Loans
 */
export function calculateLoanSummary(
  loans: Loan[],
  payments: LoanPayment[] = []
): {
  totalOriginalPrincipal: number;
  totalOutstandingPrincipal: number;
  totalMonthlyEMI: number;
  totalInterestRemaining: number;
  activeLoansCount: number;
  nextPaymentDue: {
    loanName: string;
    amount: number;
    dueDate: string;
    overdueDays: number;
    isOverdue: boolean;
  } | null;
} {
  const nonDeletedLoans = loans.filter((l) => !l.isDeleted);
  let totalOriginalPrincipal = 0;
  let totalOutstandingPrincipal = 0;
  let totalMonthlyEMI = 0;
  let totalInterestRemaining = 0;
  let activeLoansCount = 0;
  let earliestDue: {
    loanName: string;
    amount: number;
    dueDate: string;
    overdueDays: number;
    isOverdue: boolean;
  } | null = null;

  nonDeletedLoans.forEach((loan) => {
    const summary = calculateLoanDetailedSummary(loan, payments);
    totalOriginalPrincipal += summary.originalPrincipal;
    totalOutstandingPrincipal += summary.outstandingPrincipal;
    totalInterestRemaining += summary.totalInterestRemaining;

    if (!summary.isArchived && !summary.isCompleted) {
      activeLoansCount++;
      totalMonthlyEMI += summary.monthlyEMI;

      if (summary.nextDueDate && summary.nextDueDate !== 'Completed') {
        if (
          !earliestDue ||
          new Date(summary.nextDueDate).getTime() < new Date(earliestDue.dueDate).getTime()
        ) {
          earliestDue = {
            loanName: loan.loanName,
            amount: summary.monthlyEMI,
            dueDate: summary.nextDueDate,
            overdueDays: summary.overdueDays,
            isOverdue: summary.nextDueStatus === 'Overdue'
          };
        }
      }
    }
  });

  return {
    totalOriginalPrincipal: safeRound(totalOriginalPrincipal),
    totalOutstandingPrincipal: safeRound(totalOutstandingPrincipal),
    totalMonthlyEMI: safeRound(totalMonthlyEMI),
    totalInterestRemaining: safeRound(totalInterestRemaining),
    activeLoansCount,
    nextPaymentDue: earliestDue
  };
}

/**
 * Circle Debt Minimizer & Net Balance Calculation
 * Given a list of expenses and settlements in a circle, compute who owes whom.
 */
export function calculateCircleNetBalances(
  circleId: string,
  expenses: CircleExpense[],
  settlements: Settlement[]
): { netBalances: NetBalance[]; simplifiedDebts: SimplifiedDebt[] } {
  const circleExpenses = expenses.filter((e) => e.circleId === circleId);
  const circleSettlements = settlements.filter((s) => s.circleId === circleId);

  const balanceMap: Record<string, { name: string; net: number }> = {};

  // 1. Process Expenses
  circleExpenses.forEach((exp) => {
    // Payer gains the full expense amount in paid credit
    if (!balanceMap[exp.paidByUserId]) {
      balanceMap[exp.paidByUserId] = { name: exp.paidByUserName, net: 0 };
    }
    balanceMap[exp.paidByUserId].net += exp.amount;

    // Splitters owe their share
    exp.splits.forEach((split) => {
      if (!balanceMap[split.userId]) {
        balanceMap[split.userId] = { name: split.userName, net: 0 };
      }
      balanceMap[split.userId].net -= split.amount;
    });
  });

  // 2. Process Settlements (Payer pays Payee)
  circleSettlements.forEach((set) => {
    if (!balanceMap[set.payerId]) {
      balanceMap[set.payerId] = { name: set.payerName, net: 0 };
    }
    if (!balanceMap[set.payeeId]) {
      balanceMap[set.payeeId] = { name: set.payeeName, net: 0 };
    }

    // Payer's net increases (they paid off debt)
    balanceMap[set.payerId].net += set.amount;
    // Payee's net decreases (they received their money back)
    balanceMap[set.payeeId].net -= set.amount;
  });

  const netBalances: NetBalance[] = Object.entries(balanceMap).map(([id, val]) => ({
    memberId: id,
    memberName: val.name,
    netAmount: safeRound(val.net)
  }));

  // 3. Debt Minimizer Algorithm (Greedy matching max debtor to max creditor)
  const debtors: { id: string; name: string; amount: number }[] = [];
  const creditors: { id: string; name: string; amount: number }[] = [];

  netBalances.forEach((b) => {
    if (b.netAmount < -0.01) {
      debtors.push({ id: b.memberId, name: b.memberName, amount: Math.abs(b.netAmount) });
    } else if (b.netAmount > 0.01) {
      creditors.push({ id: b.memberId, name: b.memberName, amount: b.netAmount });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const simplifiedDebts: SimplifiedDebt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    if (settlementAmount > 0.01) {
      simplifiedDebts.push({
        fromMemberId: debtor.id,
        fromMemberName: debtor.name,
        toMemberId: creditor.id,
        toMemberName: creditor.name,
        amount: safeRound(settlementAmount)
      });
    }

    debtor.amount = safeRound(debtor.amount - settlementAmount);
    creditor.amount = safeRound(creditor.amount - settlementAmount);

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return { netBalances, simplifiedDebts };
}

/**
 * Calculate Global User Circle Totals (Money to receive vs Money to pay)
 */
export function calculateUserCircleTotals(
  currentUserId: string,
  circles: Circle[],
  expenses: CircleExpense[],
  settlements: Settlement[]
) {
  let totalReceive = 0;
  let totalPay = 0;

  circles.forEach((circle) => {
    const { simplifiedDebts } = calculateCircleNetBalances(circle.id, expenses, settlements);
    simplifiedDebts.forEach((debt) => {
      if (debt.toMemberId === currentUserId) {
        totalReceive += debt.amount;
      }
      if (debt.fromMemberId === currentUserId) {
        totalPay += debt.amount;
      }
    });
  });

  return {
    totalReceive: safeRound(totalReceive),
    totalPay: safeRound(totalPay)
  };
}

/**
 * Calculate actual spent amount for a category in a specific month (format YYYY-MM)
 */
export function calculateCategorySpentForMonth(
  transactions: Transaction[],
  category: string,
  monthStr: string
): number {
  const normCat = category.trim().toLowerCase();
  const spent = transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      if (!t.date || !t.date.startsWith(monthStr)) return false;
      const tCat = (t.category || '').trim().toLowerCase();
      return tCat === normCat;
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  return safeRound(spent);
}

/**
 * Calculate comprehensive stats for a budget in a given month
 */
export function calculateBudgetStats(
  budget: Budget,
  transactions: Transaction[],
  monthStr: string
) {
  const spent = calculateCategorySpentForMonth(transactions, budget.category, monthStr);
  const limit = budget.monthlyLimit || 0;
  const percentage = limit > 0 ? safeRound((spent / limit) * 100) : 0;
  const remaining = safeRound(Math.max(0, limit - spent));
  const overAmount = safeRound(Math.max(0, spent - limit));
  const isOverBudget = spent > limit;
  const isWarning = !isOverBudget && percentage >= 80;
  const isSafe = !isOverBudget && !isWarning;

  let statusText = 'On Track';
  if (isOverBudget) {
    statusText = `Over by ₹${overAmount.toLocaleString('en-IN')}`;
  } else if (isWarning) {
    statusText = `${percentage.toFixed(0)}% used (Warning)`;
  } else {
    statusText = `₹${remaining.toLocaleString('en-IN')} remaining`;
  }

  return {
    spent,
    limit,
    percentage,
    remaining,
    overAmount,
    isOverBudget,
    isWarning,
    isSafe,
    statusText,
    isActive: budget.isActive !== false
  };
}

/**
 * Calculate Overall Budget-Health Ring Summary from saved budgets and actual transactions
 */
export function calculateBudgetHealthRing(
  budgets: Budget[],
  transactions: Transaction[],
  monthStr: string
) {
  const activeBudgets = budgets.filter((b) => b.isActive !== false);

  if (activeBudgets.length === 0) {
    return {
      hasBudgets: false,
      totalLimit: 0,
      totalSpent: 0,
      totalRemaining: 0,
      totalOverspent: 0,
      utilizationPercentage: 0,
      healthScore: 100,
      rating: 'No Active Budgets',
      onTrackCount: 0,
      warningCount: 0,
      overBudgetCount: 0,
      totalCount: 0
    };
  }

  let totalLimit = 0;
  let totalSpent = 0;
  let onTrackCount = 0;
  let warningCount = 0;
  let overBudgetCount = 0;
  let totalOverspent = 0;

  activeBudgets.forEach((b) => {
    const stats = calculateBudgetStats(b, transactions, monthStr);
    totalLimit += stats.limit;
    totalSpent += stats.spent;
    if (stats.isOverBudget) {
      overBudgetCount++;
      totalOverspent += stats.overAmount;
    } else if (stats.isWarning) {
      warningCount++;
    } else {
      onTrackCount++;
    }
  });

  totalLimit = safeRound(totalLimit);
  totalSpent = safeRound(totalSpent);
  const totalRemaining = safeRound(Math.max(0, totalLimit - totalSpent));
  const utilizationPercentage = totalLimit > 0 ? safeRound((totalSpent / totalLimit) * 100) : 0;

  // Health Score from 0 to 100
  let healthScore = 100;
  if (overBudgetCount > 0) {
    healthScore -= overBudgetCount * 25;
  }
  if (warningCount > 0) {
    healthScore -= warningCount * 10;
  }
  if (utilizationPercentage > 100) {
    healthScore -= Math.min(30, (utilizationPercentage - 100) * 0.5);
  }
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  let rating: 'Excellent' | 'Good' | 'Attention Needed' | 'Critical' = 'Excellent';
  if (overBudgetCount > 0 || healthScore < 50) {
    rating = healthScore < 40 ? 'Critical' : 'Attention Needed';
  } else if (warningCount > 0 || healthScore < 80) {
    rating = 'Good';
  }

  return {
    hasBudgets: true,
    totalLimit,
    totalSpent,
    totalRemaining,
    totalOverspent,
    utilizationPercentage,
    healthScore,
    rating,
    onTrackCount,
    warningCount,
    overBudgetCount,
    totalCount: activeBudgets.length
  };
}

/**
 * Budget Health & Warning Status
 */
export function getBudgetStatus(spent: number, limit: number) {
  const percentage = limit > 0 ? safeRound((spent / limit) * 100) : 0;
  let status: 'normal' | 'warning' | 'exceeded' = 'normal';

  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 80) {
    status = 'warning';
  }

  return { percentage, status, remaining: safeRound(limit - spent) };
}

/**
 * Overall Financial Health Score Engine
 */
export function calculateFinancialHealthScore(
  monthlyIncome: number,
  monthlyExpense: number,
  totalDebt: number,
  budgets: Budget[],
  upcomingDueCount: number
): FinancialHealthScore {
  let score = 70; // baseline neutral
  const insights: string[] = [];

  // 1. Savings Rate factor (Max 30 points)
  const savings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  if (savingsRate >= 30) {
    score += 20;
    insights.push('Great savings rate (>30% of income)! You are building wealth fast.');
  } else if (savingsRate >= 15) {
    score += 10;
    insights.push('Healthy savings rate (15-30%). Keep up the consistent saving.');
  } else if (savingsRate < 0) {
    score -= 20;
    insights.push('Warning: Expenses exceed income this month. Review non-essential spending.');
  } else {
    insights.push('Aim to save at least 20% of your monthly income for financial security.');
  }

  // 2. Debt to Income Ratio factor
  const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;
  if (debtToIncomeRatio > 50) {
    score -= 15;
    insights.push('High debt levels detected relative to annual income.');
  } else if (totalDebt === 0) {
    score += 10;
    insights.push('Debt-free advantage! You have zero active loan & credit outstanding.');
  }

  // 3. Budget Adherence factor
  let exceededBudgets = 0;
  let totalBudgetsCount = budgets.length;
  budgets.forEach((b) => {
    if (b.spent > b.monthlyLimit) exceededBudgets++;
  });

  const budgetAdherence = totalBudgetsCount > 0 ? Math.round(((totalBudgetsCount - exceededBudgets) / totalBudgetsCount) * 100) : 100;
  if (exceededBudgets > 0) {
    score -= exceededBudgets * 5;
    insights.push(`${exceededBudgets} category budget(s) have been exceeded.`);
  }

  // 4. Upcoming Payment Dues factor
  if (upcomingDueCount > 3) {
    score -= 5;
    insights.push(`You have ${upcomingDueCount} upcoming bill/EMI payments due soon.`);
  }

  score = Math.min(100, Math.max(0, score));

  let rating: FinancialHealthScore['rating'] = 'Fair';
  if (score >= 85) rating = 'Excellent';
  else if (score >= 70) rating = 'Good';
  else if (score >= 50) rating = 'Fair';
  else rating = 'Needs Care';

  return {
    score,
    rating,
    savingsRate: safeRound(savingsRate),
    debtToIncomeRatio: safeRound(debtToIncomeRatio),
    budgetAdherence,
    upcomingDueCount,
    insights
  };
}
