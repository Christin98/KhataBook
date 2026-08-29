/**
 * Centralized Money-Safe Calculation & Financial Data Sanitization Engine
 * Protects every numeric surface from NaN, Infinity, negative anomalies, precision leaks, and overflow.
 */

export const MAX_SAFE_TRANSACTION_AMOUNT = 100_000_000; // ₹10 Crores maximum per single item
export const MAX_SAFE_BALANCE_AMOUNT = 1_000_000_000; // ₹100 Crores maximum balance
export const MIN_SAFE_BALANCE_AMOUNT = -1_000_000_000; // Overdraft / debt floor
export const MAX_SAFE_INTEREST_RATE = 100; // 100% annual percentage rate (APR)
export const MAX_SAFE_TENURE_MONTHS = 480; // 40 years maximum tenure

/**
 * Custom Error thrown when financial data fails validation
 */
export class FinancialValidationError extends Error {
  collection: string;
  errors: string[];

  constructor(collection: string, errors: string[]) {
    super(`Financial validation failed for "${collection}": ${errors.join(', ')}`);
    this.name = 'FinancialValidationError';
    this.collection = collection;
    this.errors = errors;
  }
}

/**
 * Decimal-safe rounding utility avoiding floating point IEEE 754 bugs (0.1 + 0.2 != 0.3)
 */
export function safeRound(amount: number): number {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return 0;
  }
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Sanitize and parse an unsigned money value (guaranteed non-negative, finite, bounded, and rounded).
 * Strips currency symbols (₹, $), commas, and excess whitespace.
 */
export function toSafeMoney(val: unknown, fallback: number = 0): number {
  if (val === null || val === undefined) {
    return safeRound(fallback);
  }

  let num: number;
  if (typeof val === 'number') {
    num = val;
  } else if (typeof val === 'string') {
    // Strip ₹, $, commas, and leading/trailing whitespace
    const cleanStr = val.replace(/[₹$,\s]/g, '').trim();
    num = parseFloat(cleanStr);
  } else {
    return safeRound(fallback);
  }

  if (isNaN(num) || !isFinite(num)) {
    return safeRound(fallback);
  }

  // Enforce positive bounds and maximum financial limits
  const clamped = Math.max(0, Math.min(MAX_SAFE_TRANSACTION_AMOUNT, num));
  return safeRound(clamped);
}

/**
 * Sanitize a signed money value (permits negative numbers for balances/overdrafts, but prevents NaN and Infinity).
 */
export function toSafeSignedMoney(val: unknown, fallback: number = 0): number {
  if (val === null || val === undefined) {
    return safeRound(fallback);
  }

  let num: number;
  if (typeof val === 'number') {
    num = val;
  } else if (typeof val === 'string') {
    const cleanStr = val.replace(/[₹$,\s]/g, '').trim();
    num = parseFloat(cleanStr);
  } else {
    return safeRound(fallback);
  }

  if (isNaN(num) || !isFinite(num)) {
    return safeRound(fallback);
  }

  // Prevent -0
  if (Object.is(num, -0)) {
    num = 0;
  }

  const clamped = Math.max(MIN_SAFE_BALANCE_AMOUNT, Math.min(MAX_SAFE_BALANCE_AMOUNT, num));
  return safeRound(clamped);
}

/**
 * Safe percentage calculation with strict zero-division protection.
 * e.g., toSafePercentage(1500, 3000) => 50
 * e.g., toSafePercentage(0, 0) => 0
 * e.g., toSafePercentage(500, 0) => 0
 */
export function toSafePercentage(
  numerator: number,
  denominator: number,
  fallback: number = 0,
  maxPercent: number = 1000
): number {
  const safeNum = typeof numerator === 'number' && isFinite(numerator) ? numerator : 0;
  const safeDenom = typeof denominator === 'number' && isFinite(denominator) ? denominator : 0;

  if (safeDenom === 0 || isNaN(safeNum) || isNaN(safeDenom)) {
    return fallback;
  }

  const ratio = (safeNum / safeDenom) * 100;
  if (isNaN(ratio) || !isFinite(ratio)) {
    return fallback;
  }

  const clamped = Math.max(0, Math.min(maxPercent, ratio));
  return safeRound(clamped);
}

/**
 * Sanitize and bound loan or EMI tenure months (guarantees integer between min and max).
 */
export function toSafeTenure(val: unknown, min: number = 1, max: number = MAX_SAFE_TENURE_MONTHS): number {
  let num: number;
  if (typeof val === 'number') {
    num = val;
  } else if (typeof val === 'string') {
    num = parseInt(val.trim(), 10);
  } else {
    return min;
  }

  if (isNaN(num) || !isFinite(num)) {
    return min;
  }

  return Math.max(min, Math.min(max, Math.round(num)));
}

/**
 * Sanitize and bound annual interest rate (% APR, e.g. 10.5%).
 */
export function toSafeInterestRate(val: unknown, min: number = 0, max: number = MAX_SAFE_INTEREST_RATE): number {
  let num: number;
  if (typeof val === 'number') {
    num = val;
  } else if (typeof val === 'string') {
    const clean = val.replace(/[%\s]/g, '').trim();
    num = parseFloat(clean);
  } else {
    return min;
  }

  if (isNaN(num) || !isFinite(num)) {
    return min;
  }

  const clamped = Math.max(min, Math.min(max, num));
  return safeRound(clamped);
}

/**
 * Comprehensive Schema Validator & Sanitizer for all financial payloads
 */
export function validateFinancialPayload(
  collection: string,
  data: Record<string, any>
): { isValid: boolean; sanitized: Record<string, any>; errors: string[] } {
  const sanitized: Record<string, any> = { ...data };
  const errors: string[] = [];

  switch (collection) {
    case 'transactions': {
      if (data.amount === undefined || data.amount === null) {
        errors.push('Transaction amount is required.');
      } else {
        const rawAmt = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawAmt) || rawAmt <= 0) {
          errors.push('Transaction amount must be greater than ₹0.');
        } else if (rawAmt > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Transaction amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
        }
        sanitized.amount = toSafeMoney(data.amount);
      }

      if (!['income', 'expense', 'transfer'].includes(data.type)) {
        errors.push('Transaction type must be income, expense, or transfer.');
      }

      if (!data.date || typeof data.date !== 'string' || data.date.trim().length < 4) {
        errors.push('Transaction date is required and must be valid.');
      }
      break;
    }

    case 'accounts': {
      if (data.currentBalance !== undefined) {
        const rawBal = typeof data.currentBalance === 'number' ? data.currentBalance : parseFloat(String(data.currentBalance).replace(/[₹$,\s]/g, ''));
        if (rawBal > MAX_SAFE_BALANCE_AMOUNT || rawBal < MIN_SAFE_BALANCE_AMOUNT) {
          errors.push(`Account balance must be between -₹${Math.abs(MIN_SAFE_BALANCE_AMOUNT).toLocaleString('en-IN')} and ₹${MAX_SAFE_BALANCE_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.currentBalance = toSafeSignedMoney(data.currentBalance);
      }
      if (data.openingBalance !== undefined) {
        sanitized.openingBalance = toSafeSignedMoney(data.openingBalance);
      }
      if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        errors.push('Account name is required.');
      }
      break;
    }

    case 'creditCards': {
      if (data.creditLimit !== undefined) {
        const rawLimit = typeof data.creditLimit === 'number' ? data.creditLimit : parseFloat(String(data.creditLimit).replace(/[₹$,\s]/g, ''));
        if (rawLimit > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Credit limit cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.creditLimit = toSafeMoney(data.creditLimit);
      }
      if (data.currentOutstanding !== undefined) {
        sanitized.currentOutstanding = toSafeMoney(data.currentOutstanding);
      }
      if (data.minimumDue !== undefined) {
        sanitized.minimumDue = toSafeMoney(data.minimumDue);
      }
      if (data.statementBalance !== undefined) {
        sanitized.statementBalance = toSafeMoney(data.statementBalance);
      }
      if (data.interestRate !== undefined) {
        sanitized.interestRate = toSafeInterestRate(data.interestRate);
      }
      break;
    }

    case 'emis': {
      if (data.purchaseAmount !== undefined || data.principalAmount !== undefined) {
        const rawPurch = parseFloat(String(data.purchaseAmount ?? data.principalAmount).replace(/[₹$,\s]/g, ''));
        if (rawPurch > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`EMI amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        }
      }
      if (data.purchaseAmount !== undefined) sanitized.purchaseAmount = toSafeMoney(data.purchaseAmount);
      if (data.principalAmount !== undefined) sanitized.principalAmount = toSafeMoney(data.principalAmount);
      if (data.monthlyEmi !== undefined) sanitized.monthlyEmi = toSafeMoney(data.monthlyEmi);
      if (data.emiAmount !== undefined) sanitized.emiAmount = toSafeMoney(data.emiAmount);
      if (data.totalPayable !== undefined) sanitized.totalPayable = toSafeMoney(data.totalPayable);
      if (data.downPayment !== undefined) sanitized.downPayment = toSafeMoney(data.downPayment);
      if (data.financedAmount !== undefined) sanitized.financedAmount = toSafeMoney(data.financedAmount);
      if (data.tenureMonths !== undefined) sanitized.tenureMonths = toSafeTenure(data.tenureMonths, 1, 120);
      if (data.paidMonths !== undefined) sanitized.paidMonths = Math.min(sanitized.tenureMonths || 120, toSafeTenure(data.paidMonths, 0, 120));
      if (data.paidInstallments !== undefined) sanitized.paidInstallments = Math.min(sanitized.tenureMonths || 120, toSafeTenure(data.paidInstallments, 0, 120));
      break;
    }

    case 'emiPayments': {
      if (data.amount === undefined || data.amount === null) {
        errors.push('EMI payment amount is required.');
      } else {
        const rawAmt = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawAmt) || rawAmt <= 0) {
          errors.push('EMI payment amount must be greater than ₹0.');
        } else if (rawAmt > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`EMI payment amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.amount = toSafeMoney(data.amount);
      }
      if (data.installmentNumber !== undefined) {
        sanitized.installmentNumber = toSafeTenure(data.installmentNumber, 1, 120);
      }
      break;
    }

    case 'loans': {
      if (data.principal !== undefined) {
        const rawPrin = typeof data.principal === 'number' ? data.principal : parseFloat(String(data.principal).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawPrin) || rawPrin <= 0) {
          errors.push('Loan principal must be greater than ₹0.');
        } else if (rawPrin > MAX_SAFE_BALANCE_AMOUNT) {
          errors.push(`Loan principal cannot exceed realistic limit of ₹${MAX_SAFE_BALANCE_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.principal = toSafeMoney(data.principal);
      }
      if (data.outstandingPrincipal !== undefined) sanitized.outstandingPrincipal = toSafeMoney(data.outstandingPrincipal);
      if (data.emiAmount !== undefined) {
        const rawEmi = typeof data.emiAmount === 'number' ? data.emiAmount : parseFloat(String(data.emiAmount).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawEmi) || rawEmi <= 0) {
          errors.push('Monthly EMI must be greater than ₹0.');
        }
        sanitized.emiAmount = toSafeMoney(data.emiAmount);
      }
      if (data.interestRate !== undefined) {
        const rawRate = typeof data.interestRate === 'number' ? data.interestRate : parseFloat(String(data.interestRate).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawRate) || rawRate < 0) {
          errors.push('Interest rate cannot be negative.');
        }
        sanitized.interestRate = toSafeInterestRate(data.interestRate);
      }
      if (data.tenureMonths !== undefined) {
        const rawTenure = typeof data.tenureMonths === 'number' ? data.tenureMonths : parseInt(String(data.tenureMonths), 10);
        if (isNaN(rawTenure) || rawTenure <= 0) {
          errors.push('Tenure must be at least 1 month.');
        }
        sanitized.tenureMonths = toSafeTenure(data.tenureMonths, 1, 480);
      }
      break;
    }

    case 'loanPayments': {
      if (data.amount !== undefined) {
        const rawAmt = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawAmt) || rawAmt <= 0) {
          errors.push('Payment amount must be greater than ₹0.');
        } else if (rawAmt > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Payment amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.amount = toSafeMoney(data.amount);
      }
      if (data.principalComponent !== undefined) sanitized.principalComponent = toSafeMoney(data.principalComponent);
      if (data.interestComponent !== undefined) sanitized.interestComponent = toSafeMoney(data.interestComponent);
      if (data.installmentNumber !== undefined) sanitized.installmentNumber = toSafeTenure(data.installmentNumber, 1, 480);
      break;
    }

    case 'budgets': {
      if (data.monthlyLimit !== undefined) {
        const rawLimit = typeof data.monthlyLimit === 'number' ? data.monthlyLimit : parseFloat(String(data.monthlyLimit).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawLimit) || rawLimit <= 0) {
          errors.push('Monthly budget limit must be greater than ₹0.');
        } else if (rawLimit > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Budget limit cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
        }
        sanitized.monthlyLimit = toSafeMoney(data.monthlyLimit);
      }
      if (data.spent !== undefined) {
        sanitized.spent = toSafeMoney(data.spent);
      }
      break;
    }

    case 'goals': {
      if (data.targetAmount !== undefined) {
        const rawTarget = typeof data.targetAmount === 'number' ? data.targetAmount : parseFloat(String(data.targetAmount).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawTarget) || rawTarget <= 0) {
          errors.push('Goal target amount must be greater than ₹0.');
        } else if (rawTarget > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Goal target amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')} (₹10 Crores).`);
        }
        sanitized.targetAmount = toSafeMoney(data.targetAmount);
      }
      if (data.currentAmount !== undefined) {
        const rawCurrent = typeof data.currentAmount === 'number' ? data.currentAmount : parseFloat(String(data.currentAmount).replace(/[₹$,\s]/g, ''));
        if (rawCurrent > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Current saved amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.currentAmount = toSafeMoney(data.currentAmount);
      }
      break;
    }

    case 'reminders': {
      if (data.amount !== undefined) {
        const rawAmt = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawAmt) || rawAmt <= 0) {
          errors.push('Reminder bill amount must be greater than ₹0.');
        } else if (rawAmt > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Reminder amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.amount = toSafeMoney(data.amount);
      }
      break;
    }

    case 'circleExpenses': {
      if (data.amount !== undefined) {
        const rawAmt = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawAmt) || rawAmt <= 0) {
          errors.push('Circle expense amount must be greater than ₹0.');
        } else if (rawAmt > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Circle expense amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.amount = toSafeMoney(data.amount);
      }
      if (Array.isArray(data.splits)) {
        sanitized.splits = data.splits.map((s: any) => ({
          ...s,
          amount: toSafeMoney(s.amount)
        }));
      }
      break;
    }

    case 'settlements': {
      if (data.amount !== undefined) {
        const rawAmt = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount).replace(/[₹$,\s]/g, ''));
        if (isNaN(rawAmt) || rawAmt <= 0) {
          errors.push('Settlement amount must be greater than ₹0.');
        } else if (rawAmt > MAX_SAFE_TRANSACTION_AMOUNT) {
          errors.push(`Settlement amount cannot exceed realistic limit of ₹${MAX_SAFE_TRANSACTION_AMOUNT.toLocaleString('en-IN')}.`);
        }
        sanitized.amount = toSafeMoney(data.amount);
      }
      break;
    }

    default:
      break;
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}
