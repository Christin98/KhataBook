import {
  Account,
  Transaction,
  CreditCard,
  EMI,
  EMIInstallment,
  Loan,
  Circle,
  CircleExpense,
  Settlement,
  NetBalance,
  SimplifiedDebt,
  Budget,
  FinancialHealthScore
} from './types';

/**
 * Decimal-safe rounding utility to prevent floating-point representation bugs (e.g. 0.1 + 0.2 = 0.30000000000000004)
 */
export function safeRound(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Format currency with Indian Numbering System (e.g., ₹1,50,000)
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  const absoluteValue = Math.abs(safeRound(amount));
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(absoluteValue);

  return `${amount < 0 ? '-' : ''}${currency}${formattedNumber}`;
}

/**
 * Calculate total active account balance
 */
export function calculateTotalBalance(accounts: Account[]): number {
  return safeRound(
    accounts
      .filter((acc) => acc.isActive)
      .reduce((sum, acc) => sum + (acc.currentBalance || 0), 0)
  );
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
export function calculateMonthlyEMICommitment(emis: EMI[]) {
  const activeEMIs = emis.filter(
    (e) => e.status !== 'Completed' && e.status !== 'Preclosed' && e.status !== 'Cancelled'
  );

  const monthlyCommitment = safeRound(
    activeEMIs.reduce((sum, e) => sum + (e.monthlyEmi || e.emiAmount || 0), 0)
  );

  const totalRemainingDebt = safeRound(
    activeEMIs.reduce((sum, e) => {
      const emiAmt = e.monthlyEmi || e.emiAmount || 0;
      const paidCount = e.paidInstallments ?? e.paidMonths ?? 0;
      const paidAmt = paidCount * emiAmt;
      const totalPay = e.totalPayable ?? e.purchaseAmount ?? e.principalAmount;
      return sum + Math.max(0, totalPay - paidAmt);
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
  const safePrincipal = Math.max(0, principal);
  const safeTenure = Math.max(1, tenureMonths);
  const safeProcFee = Math.max(0, processingFee);
  const taxAmount = safeRound(safeProcFee * 0.18); // 18% GST on processing fee

  if (isNoCost || interestRate <= 0) {
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
  const r = (interestRate / 12) / 100;
  const emiFactor = Math.pow(1 + r, safeTenure);
  const monthlyEmi = safeRound((safePrincipal * r * emiFactor) / (emiFactor - 1));
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
  const safeTenure = Math.max(1, tenureMonths);
  const safeMonthlyEmi = monthlyEmi > 0 ? monthlyEmi : safeRound(originalAmount / safeTenure);
  
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
  const safePaidCount = Math.max(0, Math.min(safeTenure, paidInstallments));

  const safeOriginalAmount = Math.max(0, originalAmount);
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
 * Calculate Total Loans Outstanding
 */
export function calculateLoanSummary(loans: Loan[]) {
  const totalOriginalPrincipal = safeRound(loans.reduce((sum, l) => sum + (l.principal || 0), 0));
  const totalOutstandingPrincipal = safeRound(loans.reduce((sum, l) => sum + (l.outstandingPrincipal || 0), 0));
  const totalMonthlyEMI = safeRound(loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0));

  return { totalOriginalPrincipal, totalOutstandingPrincipal, totalMonthlyEMI };
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
