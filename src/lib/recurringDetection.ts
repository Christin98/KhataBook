import {
  Transaction,
  RecurringPayment,
  Subscription,
  CadenceType,
  ConfidenceLevel,
  DetectedRecurringSuggestion
} from './types';
import { safeRound, toSafeMoney } from './moneySafe';

export const SUBSCRIPTION_HINTS = [
  'netflix',
  'spotify',
  'hulu',
  'disney',
  'youtube',
  'icloud',
  'dropbox',
  'adobe',
  'microsoft',
  'amazon prime',
  'prime video',
  'patreon',
  'membership',
  'studio',
  'gym',
  'openai',
  'chatgpt',
  'canva',
  'notion',
  'zoom',
  'slack',
  'github',
  'apple music',
  'hotstar',
  'audible',
  'playstation',
  'xbox',
  'nintendo',
  'medium',
  'substack'
];

export const RECURRING_BILL_HINTS = [
  'mortgage',
  'rent',
  'loan',
  'insurance',
  'utility',
  'utilities',
  'electric',
  'electricity',
  'water',
  'internet',
  'broadband',
  'wifi',
  'phone',
  'mobile',
  'telecom',
  'daycare',
  'tuition',
  'lease',
  'car payment',
  'auto payment',
  'hoa',
  'property tax',
  'gas bill',
  'cylinder'
];

/**
 * Normalizes merchant names for pattern matching:
 * - Lowercases and trims
 * - Removes punctuation
 * - Removes terminal '#' plus digits (e.g. 'Uber #1234' -> 'uber')
 * - Removes long reference-number digit sequences (e.g. 6+ digits)
 * - Collapses whitespace
 */
export function normalizeMerchant(rawName: string): string {
  if (!rawName) return '';

  let normalized = rawName.toLowerCase().trim();

  // 1. Remove terminal '#' plus digits (e.g. 'Store #1042', 'Netflix #02')
  normalized = normalized.replace(/#\s*\d+\b/g, ' ');

  // 2. Remove long digit sequences (>= 5 digits, common for transaction IDs/references)
  normalized = normalized.replace(/\b\d{5,}\b/g, ' ');

  // 3. Remove common gateway/aggregator prefixes/suffixes like 'billdesk*', 'razorpay*', 'paytm*', 'upi/'
  normalized = normalized.replace(/\b(billdesk|razorpay|paytm|ccavenue|instamojo|upi|pos)\b[*:\-/_\s]*/gi, ' ');

  // 4. Remove punctuation (keep letters, digits, spaces)
  normalized = normalized.replace(/[^\w\s]/g, ' ');

  // 5. Collapse whitespace and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Check if normalized merchant or category matches subscription hints
 */
export function isSubscriptionHint(normalizedMerchant: string, category: string): boolean {
  const cat = (category || '').toLowerCase();
  if (cat.includes('subscription') || cat.includes('streaming') || cat.includes('membership')) {
    return true;
  }
  return SUBSCRIPTION_HINTS.some((hint) => normalizedMerchant.includes(hint));
}

/**
 * Check if normalized merchant or category matches recurring bill hints
 */
export function isRecurringBillHint(normalizedMerchant: string, category: string): boolean {
  const cat = (category || '').toLowerCase();
  if (
    cat.includes('bill') ||
    cat.includes('utility') ||
    cat.includes('rent') ||
    cat.includes('insurance') ||
    cat.includes('education') ||
    cat.includes('emi')
  ) {
    return true;
  }
  return RECURRING_BILL_HINTS.some((hint) => normalizedMerchant.includes(hint));
}

/**
 * Cadence interval windows (in days)
 */
export const CADENCE_WINDOWS: Record<CadenceType, { min: number; max: number; target: number }> = {
  weekly: { min: 5, max: 9, target: 7 },
  biweekly: { min: 12, max: 17, target: 14 },
  monthly: { min: 24, max: 40, target: 30 },
  quarterly: { min: 75, max: 110, target: 91 },
  annual: { min: 330, max: 400, target: 365 }
};

/**
 * Classify consecutive day intervals into a dominant cadence
 */
export function classifyCadence(intervals: number[]): {
  cadence: CadenceType | null;
  avgInterval: number;
  jitterDays: number;
} {
  if (intervals.length === 0) {
    return { cadence: null, avgInterval: 0, jitterDays: 0 };
  }

  const avgInterval = intervals.reduce((s, d) => s + d, 0) / intervals.length;

  // Check each cadence window
  const candidates: { cadence: CadenceType; matches: number; jitter: number }[] = [];

  (Object.keys(CADENCE_WINDOWS) as CadenceType[]).forEach((cadence) => {
    const win = CADENCE_WINDOWS[cadence];
    // Check how many intervals fall within this window
    const matchingIntervals = intervals.filter((d) => d >= win.min && d <= win.max);
    const matchRatio = matchingIntervals.length / intervals.length;

    // Must match at least 60% of intervals
    if (matchRatio >= 0.6) {
      const jitters = intervals.map((d) => Math.abs(d - win.target));
      const avgJitter = jitters.reduce((s, j) => s + j, 0) / jitters.length;
      candidates.push({ cadence, matches: matchingIntervals.length, jitter: avgJitter });
    }
  });

  if (candidates.length === 0) {
    return { cadence: null, avgInterval, jitterDays: 0 };
  }

  // Sort by highest matches and lowest jitter
  candidates.sort((a, b) => b.matches - a.matches || a.jitter - b.jitter);
  return {
    cadence: candidates[0].cadence,
    avgInterval,
    jitterDays: safeRound(candidates[0].jitter)
  };
}

/**
 * Convert an amount in a given cadence to its monthly and annual equivalents
 */
export function convertToMonthlyAndAnnual(
  amount: number,
  cadence: CadenceType
): { monthly: number; annual: number } {
  const safeAmt = toSafeMoney(amount);
  let monthly = safeAmt;
  let annual = safeAmt * 12;

  switch (cadence) {
    case 'weekly':
      monthly = (safeAmt * 52) / 12;
      annual = safeAmt * 52;
      break;
    case 'biweekly':
      monthly = (safeAmt * 26) / 12;
      annual = safeAmt * 26;
      break;
    case 'monthly':
      monthly = safeAmt;
      annual = safeAmt * 12;
      break;
    case 'quarterly':
      monthly = safeAmt / 3;
      annual = safeAmt * 4;
      break;
    case 'annual':
      monthly = safeAmt / 12;
      annual = safeAmt;
      break;
  }

  return { monthly: safeRound(monthly), annual: safeRound(annual) };
}

/**
 * Calculate the next calendar-aware recurrence date preserving day-of-month where possible
 */
export function calculateNextOccurrence(lastDateStr: string, cadence: CadenceType): string {
  const lastDate = new Date(lastDateStr);
  if (isNaN(lastDate.getTime())) return new Date().toISOString().split('T')[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = new Date(lastDate);
  const originalDayOfMonth = lastDate.getDate();

  const stepForward = (d: Date) => {
    switch (cadence) {
      case 'weekly':
        d.setDate(d.getDate() + 7);
        break;
      case 'biweekly':
        d.setDate(d.getDate() + 14);
        break;
      case 'monthly': {
        const targetMonth = d.getMonth() + 1;
        d.setMonth(targetMonth, 1);
        const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(originalDayOfMonth, maxDays));
        break;
      }
      case 'quarterly': {
        const targetMonth = d.getMonth() + 3;
        d.setMonth(targetMonth, 1);
        const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(originalDayOfMonth, maxDays));
        break;
      }
      case 'annual': {
        const targetYear = d.getFullYear() + 1;
        d.setFullYear(targetYear);
        const maxDays = new Date(targetYear, d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(originalDayOfMonth, maxDays));
        break;
      }
    }
  };

  // Step at least once from last transaction date
  stepForward(next);

  // If next occurrence is in the past, keep advancing until >= today
  let guard = 0;
  while (next < today && guard < 120) {
    stepForward(next);
    guard++;
  }

  return next.toISOString().split('T')[0];
}

/**
 * Core Detection Algorithm:
 * Scans real expense transactions and detects recurring bills & subscriptions
 */
export function detectRecurringTransactions(
  transactions: Transaction[],
  confirmedRecurring: RecurringPayment[] = [],
  confirmedSubscriptions: Subscription[] = [],
  ignoredKeys: string[] = []
): DetectedRecurringSuggestion[] {
  // 1. Filter only real expense transactions with valid descriptions and positive amounts
  const expenses = transactions.filter(
    (t) => t.type === 'expense' && t.amount > 0 && t.description && t.date
  );

  // 2. Group transactions by normalized merchant
  const groups: Record<
    string,
    {
      normalizedMerchant: string;
      displayNames: Record<string, number>;
      categories: Record<string, number>;
      transactions: Transaction[];
    }
  > = {};

  const getGroupKey = (norm: string): string => {
    for (const hint of SUBSCRIPTION_HINTS) {
      if (norm.includes(hint)) return hint;
    }
    for (const hint of RECURRING_BILL_HINTS) {
      if (norm.includes(hint)) return hint;
    }
    return norm;
  };

  expenses.forEach((txn) => {
    const norm = normalizeMerchant(txn.description);
    if (!norm || norm.length < 2) return;

    const groupKey = getGroupKey(norm);

    if (!groups[groupKey]) {
      groups[groupKey] = {
        normalizedMerchant: groupKey,
        displayNames: {},
        categories: {},
        transactions: []
      };
    }

    groups[groupKey].transactions.push(txn);
    groups[groupKey].displayNames[txn.description] = (groups[groupKey].displayNames[txn.description] || 0) + 1;
    if (txn.category) {
      groups[groupKey].categories[txn.category] = (groups[groupKey].categories[txn.category] || 0) + 1;
    }
  });

  const suggestions: DetectedRecurringSuggestion[] = [];

  // Confirmed keys for suppression (to avoid suggesting what's already confirmed)
  const confirmedPatterns = new Set<string>();
  confirmedRecurring.forEach((r) => {
    if (r.name) confirmedPatterns.add(normalizeMerchant(r.name));
    if (r.merchantPattern) confirmedPatterns.add(normalizeMerchant(r.merchantPattern));
  });
  confirmedSubscriptions.forEach((s) => {
    if (s.serviceName) confirmedPatterns.add(normalizeMerchant(s.serviceName));
    if (s.merchantPattern) confirmedPatterns.add(normalizeMerchant(s.merchantPattern));
  });

  const ignoredSet = new Set(ignoredKeys.map((k) => normalizeMerchant(k)));

  // 3. Process each merchant group
  Object.values(groups).forEach((group) => {
    const norm = group.normalizedMerchant;

    // Check if ignored or already confirmed
    if (ignoredSet.has(norm) || confirmedPatterns.has(norm)) {
      return;
    }

    // Pick most frequent display name & category
    const displayMerchant =
      Object.entries(group.displayNames).sort((a, b) => b[1] - a[1])[0]?.[0] || norm;
    const dominantCategory =
      Object.entries(group.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Subscriptions';

    // Unique dates requirement: at least 2 unique transaction dates
    const uniqueDates = Array.from(new Set(group.transactions.map((t) => t.date.split('T')[0]))).sort();
    if (uniqueDates.length < 2) {
      return;
    }

    // Sort transactions chronologically
    const sortedTxns = [...group.transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate consecutive-day intervals between consecutive unique dates
    const intervals: number[] = [];
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const d1 = new Date(uniqueDates[i]).getTime();
      const d2 = new Date(uniqueDates[i + 1]).getTime();
      const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        intervals.push(diffDays);
      }
    }

    if (intervals.length === 0) return;

    // Classify cadence against windows
    const { cadence, jitterDays } = classifyCadence(intervals);
    if (!cadence) {
      // Dominant interval does not fit weekly/biweekly/monthly/quarterly/annual window
      return;
    }

    // Compute average amount and variation
    const amounts = sortedTxns.map((t) => t.amount);
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    if (avgAmount <= 0) return;

    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const amountVariationRatio = (maxAmount - minAmount) / avgAmount;
    const amountVariationPercent = safeRound(amountVariationRatio * 100);

    // Determine category hints & kind
    const isSub = isSubscriptionHint(norm, dominantCategory);
    const isBill = isRecurringBillHint(norm, dominantCategory);

    let kind: 'subscription' | 'bill' | 'other' = 'other';
    if (isSub) {
      kind = 'subscription';
    } else if (isBill) {
      kind = 'bill';
    }

    // Apply amount variation limits
    if (kind === 'subscription') {
      // Max 20% variation
      if (amountVariationRatio > 0.20) return;
    } else if (kind === 'bill') {
      // Max 35% variation
      if (amountVariationRatio > 0.35) return;
    } else {
      // Protection against false positives for unhinted routine spending (e.g. groceries, shopping)
      // Must have >= 3 occurrences, non-weekly (monthly, quarterly, annual), and variation <= 3%
      if (uniqueDates.length < 3) return;
      if (cadence === 'weekly' || cadence === 'biweekly') return;
      if (amountVariationRatio > 0.03) return;
    }

    // Confidence Calculation
    // High confidence: >= 3 occurrences, amount variation <= 12%, jitter <= 5 days
    let confidence: ConfidenceLevel = 'Likely';
    if (uniqueDates.length >= 3 && amountVariationRatio <= 0.12 && jitterDays <= 5) {
      confidence = 'High confidence';
    }

    // Next expected date calculation
    const lastTxnDate = uniqueDates[uniqueDates.length - 1];
    const nextExpectedDate = calculateNextOccurrence(lastTxnDate, cadence);

    // Monthly & Annual equivalents
    const { monthly, annual } = convertToMonthlyAndAnnual(avgAmount, cadence);

    const suggestionId = `sug_${norm.replace(/\s+/g, '_')}_${cadence}`;

    suggestions.push({
      id: suggestionId,
      normalizedMerchant: norm,
      originalMerchant: displayMerchant,
      category: dominantCategory,
      kind,
      cadence,
      occurrenceCount: uniqueDates.length,
      confidence,
      averageCharge: safeRound(avgAmount),
      monthlyEquivalent: monthly,
      annualEquivalent: annual,
      nextExpectedDate,
      jitterDays,
      amountVariationPercent,
      matchedTransactionIds: sortedTxns.map((t) => t.id),
      lastTransactionDate: lastTxnDate,
      lastAmount: sortedTxns[sortedTxns.length - 1].amount,
      isIgnored: false
    });
  });

  // Sort by high confidence first, then occurrence count descending
  return suggestions.sort((a, b) => {
    if (a.confidence === 'High confidence' && b.confidence !== 'High confidence') return -1;
    if (b.confidence === 'High confidence' && a.confidence !== 'High confidence') return 1;
    return b.occurrenceCount - a.occurrenceCount;
  });
}
