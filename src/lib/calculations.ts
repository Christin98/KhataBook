import {
  Account,
  Transaction,
  CreditCard,
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
 * Calculate total Credit Card Outstanding & Available Credit
 */
export function calculateCreditCardSummary(cards: CreditCard[]) {
  const totalLimit = safeRound(cards.reduce((sum, c) => sum + (c.creditLimit || 0), 0));
  const totalOutstanding = safeRound(cards.reduce((sum, c) => sum + (c.currentOutstanding || 0), 0));
  const totalAvailable = safeRound(totalLimit - totalOutstanding);
  const totalMinimumDue = safeRound(cards.reduce((sum, c) => sum + (c.minimumDue || 0), 0));

  return { totalLimit, totalOutstanding, totalAvailable, totalMinimumDue };
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
