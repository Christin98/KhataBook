'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  CreditCard as CreditCardIcon,
  Plus,
  Calendar,
  AlertCircle,
  Percent,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  TrendingDown,
  Clock,
  Archive,
  RotateCcw,
  Pencil,
  X,
  Building2,
  Wallet,
  AlertTriangle,
  Receipt,
  FileText,
  DollarSign,
  Layers,
  ArrowRight,
  Check,
  HelpCircle
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import {
  formatCurrency,
  calculateCreditCardSummary,
  getCreditUtilizationStatus,
  calculateMonthlyEMICommitment,
  calculateEMIFinancials,
  calculateOngoingEMIFinancials,
  calculateDerivedInterestRate,
  generateEMISchedule,
  getNextBillingDates,
  getRelativeDueLabel
} from '@/lib/calculations';
import {
  CreditCard,
  CreditCardStatement,
  CreditCardPayment,
  CardNetwork,
  CardStatus,
  CardRewardType,
  CardPaymentType,
  EMIType,
  EMI,
  Transaction
} from '@/lib/types';
import { POPULAR_BANKS, BankDefinition } from '@/lib/banks';
import BankLogo from '@/components/common/BankLogo';

// Ultra-rich, high-contrast theme gradients
const CARD_THEME_GRADIENTS: Record<string, string> = {
  purple: 'from-[#190b2b] via-[#291347] to-[#0f071d]',
  blue: 'from-[#07172e] via-[#102a54] to-[#040e1e]',
  dark: 'from-[#15191e] via-[#232933] to-[#0c0e12]',
  green: 'from-[#052117] via-[#0d3b2b] to-[#03130d]',
  red: 'from-[#290710] via-[#450e1d] to-[#140307]',
  gold: 'from-[#2e1d05] via-[#4d320c] to-[#170e02]'
};

export default function CreditCardsPage() {
  const {
    creditCards,
    cardStatements,
    cardPayments,
    emis,
    transactions,
    accounts,
    addCreditCard,
    updateCreditCard,
    archiveCreditCard,
    restoreCreditCard,
    recordCardPayment,
    addEMI,
    updateEMI,
    payEMIInstallment,
    precloseEMI,
    user
  } = useData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [cardFilter, setCardFilter] = useState<'All' | 'Active' | 'Archived' | 'High Utilization' | 'Payment Due'>('Active');
  const [emiFilter, setEmiFilter] = useState<'All' | 'Active' | 'Completed' | 'Overdue'>('Active');

  // Modals & Drawers State
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditCardOpen, setIsEditCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  // Pay Card Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCard, setPaymentCard] = useState<CreditCard | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<CardPaymentType>('statement');
  const [paymentSourceAccountId, setPaymentSourceAccountId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  // Pay EMI Installment Modal State
  const [payingEMI, setPayingEMI] = useState<EMI | null>(null);
  const [emiPaySourceAccountId, setEmiPaySourceAccountId] = useState('');

  // Convert / Create EMI Modal State (Supporting New vs Ongoing EMI)
  const [isConvertEMIOpen, setIsConvertEMIOpen] = useState(false);
  const [emiCreationMode, setEmiCreationMode] = useState<'new' | 'ongoing'>('new');
  const [emiCardId, setEmiCardId] = useState(creditCards[0]?.id || '');
  const [emiTitle, setEmiTitle] = useState('');
  const [emiPurchaseAmount, setEmiPurchaseAmount] = useState('60000');
  const [emiMonthlyAmount, setEmiMonthlyAmount] = useState('5000');
  const [emiType, setEmiType] = useState<EMIType>('No-cost EMI');
  const [emiTenureMonths, setEmiTenureMonths] = useState('12');
  const [emiInterestRate, setEmiInterestRate] = useState('0');
  const [emiProcessingFee, setEmiProcessingFee] = useState('0');
  const [emiFirstDueDate, setEmiFirstDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [emiPaidInstallmentsInput, setEmiPaidInstallmentsInput] = useState('4');

  // EMI Schedule & Preclose Modals
  const [scheduleEMI, setScheduleEMI] = useState<EMI | null>(null);
  const [precloseEMIData, setPrecloseEMIData] = useState<EMI | null>(null);
  const [precloseAmount, setPrecloseAmount] = useState('');
  const [precloseSourceAccountId, setPrecloseSourceAccountId] = useState('');

  // Dedicated Card Detail Drawer
  const [drawerCard, setDrawerCard] = useState<CreditCard | null>(null);
  const [drawerTab, setDrawerTab] = useState<'Overview' | 'Transactions' | 'Statements' | 'Payments' | 'EMIs'>('Overview');

  // Action Menu state with click-outside & escape listeners
  const [activeMenuCardId, setActiveMenuCardId] = useState<string | null>(null);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuCardId(null);
        setIsAddCardOpen(false);
        setIsEditCardOpen(false);
        setIsPaymentModalOpen(false);
        setPayingEMI(null);
        setIsConvertEMIOpen(false);
        setScheduleEMI(null);
        setPrecloseEMIData(null);
        setDrawerCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // New/Edit Card Form State
  const [formCardName, setFormCardName] = useState('');
  const [formBank, setFormBank] = useState('');
  const [formNetwork, setFormNetwork] = useState<CardNetwork>('Visa');
  const [formLast4, setFormLast4] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState('');
  const [formCurrentOutstanding, setFormCurrentOutstanding] = useState('0');
  const [formStatementBalance, setFormStatementBalance] = useState('');
  const [formMinimumDue, setFormMinimumDue] = useState('');
  const [formStatementDate, setFormStatementDate] = useState('15');
  const [formPaymentDueDate, setFormPaymentDueDate] = useState('5');
  const [formShowAdvanced, setFormShowAdvanced] = useState(false);
  const [formInterestRate, setFormInterestRate] = useState('');
  const [formAnnualFee, setFormAnnualFee] = useState('');
  const [formRewardType, setFormRewardType] = useState<CardRewardType>('None');
  const [formRewardRate, setFormRewardRate] = useState('');
  const [formCardTheme, setFormCardTheme] = useState<string>('purple');

  // Top Summaries (Derived strictly from application records)
  const { totalLimit, totalOutstanding, totalAvailable, totalDueThisMonth, overallUtilization } =
    calculateCreditCardSummary(creditCards);
  const utilStatus = getCreditUtilizationStatus(overallUtilization);
  const { monthlyCommitment, totalRemainingDebt, activeCount: activeEmiCount } =
    calculateMonthlyEMICommitment(emis);

  // Live calculation for Convert / Add EMI modal
  const emiLiveCalculations = useMemo(() => {
    const cleanNum = (v: string | number | undefined | null) => {
      if (v === undefined || v === null) return 0;
      if (typeof v === 'number') return isNaN(v) ? 0 : v;
      const s = v.toString().replace(/,/g, '').replace(/[^\d.-]/g, '');
      const parsed = parseFloat(s);
      return isNaN(parsed) ? 0 : parsed;
    };

    const p = cleanNum(emiPurchaseAmount);
    const t = Math.max(1, parseInt((emiTenureMonths || '12').toString(), 10) || 12);
    const isNoCost = emiType === 'No-cost EMI';
    const r = isNoCost ? 0 : cleanNum(emiInterestRate);
    const f = isNoCost ? 0 : cleanNum(emiProcessingFee);

    if (emiCreationMode === 'new') {
      const fin = calculateEMIFinancials(p, t, r, f, isNoCost);
      return {
        monthlyEmi: fin.monthlyEmi,
        interestAmount: fin.interestAmount,
        processingFee: fin.processingFee,
        taxAmount: fin.taxAmount,
        totalPayable: fin.totalPayable,
        totalInterest: fin.interestAmount,
        paidAmount: 0,
        remainingAmount: fin.totalPayable,
        paidInstallments: 0,
        remainingInstallments: t,
        dueReachedCount: 0,
        maxAllowedPaid: t,
        isPaidExceeded: false,
        nextDueDate: emiFirstDueDate,
        nextDueStatus: 'Upcoming' as const,
        overdueCount: 0
      };
    } else {
      // Ongoing EMI
      const enteredMonthly = cleanNum(emiMonthlyAmount) || (isNoCost ? Math.round(p / t) : 0);
      const enteredPaidCount = Math.max(0, parseInt((emiPaidInstallmentsInput || '0').toString(), 10) || 0);
      const derivedRate = calculateDerivedInterestRate(p, enteredMonthly, t);
      const ongoing = calculateOngoingEMIFinancials(p, enteredMonthly, t, enteredPaidCount, emiFirstDueDate, r || derivedRate, isNoCost);

      return {
        monthlyEmi: enteredMonthly || (enteredPaidCount > 0 ? ongoing.paidAmount / enteredPaidCount : 0),
        interestAmount: ongoing.totalInterest,
        processingFee: f,
        taxAmount: Math.round(f * 0.18),
        totalPayable: ongoing.totalPayable,
        totalInterest: ongoing.totalInterest,
        paidAmount: ongoing.paidAmount,
        remainingAmount: ongoing.remainingAmount,
        paidInstallments: enteredPaidCount,
        remainingInstallments: ongoing.remainingInstallments,
        dueReachedCount: ongoing.dueReachedCount,
        maxAllowedPaid: ongoing.maxAllowedPaid,
        isPaidExceeded: ongoing.isPaidExceeded,
        overdueCount: ongoing.overdueCount,
        nextDueDate: ongoing.nextDueDate,
        nextDueStatus: ongoing.nextDueStatus,
        derivedRate
      };
    }
  }, [
    emiCreationMode,
    emiPurchaseAmount,
    emiMonthlyAmount,
    emiTenureMonths,
    emiInterestRate,
    emiProcessingFee,
    emiType,
    emiFirstDueDate,
    emiPaidInstallmentsInput
  ]);

  // Auto-sync derived interest rate into the input field for Ongoing EMI mode
  useEffect(() => {
    if (emiCreationMode === 'ongoing') {
      const p = parseFloat((emiPurchaseAmount || '0').toString().replace(/,/g, ''));
      const m = parseFloat((emiMonthlyAmount || '0').toString().replace(/,/g, ''));
      const t = parseInt((emiTenureMonths || '12').toString(), 10) || 12;
      if (p > 0 && m > 0 && t > 0) {
        const rate = calculateDerivedInterestRate(p, m, t);
        setEmiInterestRate(rate > 0 ? rate.toFixed(2) : '0');
      }
    }
  }, [emiCreationMode, emiPurchaseAmount, emiMonthlyAmount, emiTenureMonths]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return creditCards.filter((card) => {
      const matchesSearch =
        card.cardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.last4Digits.includes(searchQuery);

      if (!matchesSearch) return false;

      const utilPct = card.creditLimit > 0 ? (card.currentOutstanding / card.creditLimit) * 100 : 0;
      const isArchived = card.status === 'Archived';

      if (cardFilter === 'Active') return !isArchived;
      if (cardFilter === 'Archived') return isArchived;
      if (cardFilter === 'High Utilization') return !isArchived && utilPct >= 50;
      if (cardFilter === 'Payment Due') return !isArchived && (card.minimumDue > 0 || (card.statementBalance || 0) > 0);
      return true;
    });
  }, [creditCards, searchQuery, cardFilter]);

  // Filtered EMIs
  const filteredEMIs = useMemo(() => {
    return emis.filter((emi) => {
      const matchesSearch =
        emi.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emi.purchaseTitle && emi.purchaseTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const isCompleted = emi.status === 'Completed' || (emi.paidInstallments ?? emi.paidMonths ?? 0) >= emi.tenureMonths;

      if (emiFilter === 'Active') return !isCompleted && emi.status !== 'Cancelled' && emi.status !== 'Preclosed';
      if (emiFilter === 'Completed') return isCompleted || emi.status === 'Preclosed';
      if (emiFilter === 'Overdue') {
        if (isCompleted || emi.status === 'Cancelled' || emi.status === 'Preclosed') return false;
        const nextDue = emi.nextDueDate ? new Date(emi.nextDueDate) : null;
        if (!nextDue) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return nextDue < today;
      }
      return true;
    });
  }, [emis, searchQuery, emiFilter]);

  // Dynamic Upcoming Payments Aggregation with real relative countdowns
  const upcomingPayments = useMemo(() => {
    const list: {
      id: string;
      title: string;
      subtitle: string;
      amount: number;
      dueDate: string;
      relativeText: string;
      type: 'card' | 'emi';
      status: 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming' | 'Paid';
      cardId?: string;
      emiId?: string;
    }[] = [];

    // 1. Credit Card statement dues
    creditCards
      .filter((c) => c.status !== 'Archived' && ((c.statementBalance || 0) > 0 || c.minimumDue > 0 || c.currentOutstanding > 0))
      .forEach((card) => {
        const amt = card.statementBalance || (card.minimumDue > 0 ? card.minimumDue : card.currentOutstanding);
        if (amt > 0) {
          const { nextPaymentDueDate } = getNextBillingDates(card.statementDate || 15, card.paymentDueDate || 5);
          const rel = getRelativeDueLabel(nextPaymentDueDate);

          list.push({
            id: `pay_card_${card.id}`,
            title: card.cardName,
            subtitle: `${card.bank} •••• ${card.last4Digits} (Min ${formatCurrency(card.minimumDue)})`,
            amount: amt,
            dueDate: nextPaymentDueDate,
            relativeText: rel.label,
            type: 'card',
            status: rel.status,
            cardId: card.id
          });
        }
      });

    // 2. Active EMIs
    emis
      .filter((e) => e.status !== 'Completed' && e.status !== 'Preclosed' && e.status !== 'Cancelled')
      .forEach((emi) => {
        const emiAmt = emi.monthlyEmi || emi.emiAmount || 0;
        const targetCard = creditCards.find((c) => c.id === emi.cardId);
        const rel = getRelativeDueLabel(emi.nextDueDate || '2026-09-05');

        list.push({
          id: `pay_emi_${emi.id}`,
          title: emi.purchaseTitle || emi.title,
          subtitle: `EMI Installment ${(emi.paidInstallments ?? emi.paidMonths ?? 0) + 1}/${emi.tenureMonths} · ${targetCard?.cardName || 'Card'}`,
          amount: emiAmt,
          dueDate: emi.nextDueDate || '2026-09-05',
          relativeText: rel.label,
          type: 'emi',
          status: rel.status,
          emiId: emi.id
        });
      });

    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [creditCards, emis]);

  // Handle Quick Bank Selection
  const handleSelectBankForCard = (b: BankDefinition) => {
    setFormBank(b.name);
    if (!formCardName || formCardName.toLowerCase().includes('credit card') || formCardName.toLowerCase().includes('card')) {
      setFormCardName(`${b.shortName} Credit Card`);
    }
    // Suggest visual theme
    if (b.id === 'hdfc') setFormCardTheme('blue');
    else if (b.id === 'icici' || b.id === 'axis') setFormCardTheme('red');
    else if (b.id === 'sbi') setFormCardTheme('blue');
    else if (b.id === 'kotak') setFormCardTheme('red');
    else setFormCardTheme('purple');
  };

  // Open Create Card Modal
  const handleOpenAddCard = () => {
    setFormCardName('');
    setFormBank('');
    setFormNetwork('Visa');
    setFormLast4('');
    setFormCreditLimit('');
    setFormCurrentOutstanding('0');
    setFormStatementBalance('');
    setFormMinimumDue('');
    setFormStatementDate('15');
    setFormPaymentDueDate('5');
    setFormShowAdvanced(false);
    setFormInterestRate('');
    setFormAnnualFee('');
    setFormRewardType('None');
    setFormRewardRate('');
    setFormCardTheme('purple');
    setIsAddCardOpen(true);
  };

  // Open Edit Card Modal
  const handleOpenEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setFormCardName(card.cardName);
    setFormBank(card.bank);
    setFormNetwork(card.network || 'Visa');
    setFormLast4(card.last4Digits);
    setFormCreditLimit(card.creditLimit.toString());
    setFormCurrentOutstanding(card.currentOutstanding.toString());
    setFormStatementBalance(card.statementBalance ? card.statementBalance.toString() : '');
    setFormMinimumDue(card.minimumDue ? card.minimumDue.toString() : '');
    setFormStatementDate(card.statementDate ? card.statementDate.toString() : '15');
    setFormPaymentDueDate(card.paymentDueDate ? card.paymentDueDate.toString() : '5');
    setFormInterestRate(card.interestRate ? card.interestRate.toString() : '');
    setFormAnnualFee(card.annualFee ? card.annualFee.toString() : '');
    setFormRewardType(card.rewardType || 'None');
    setFormRewardRate(card.rewardRate || '');
    setFormCardTheme(card.cardTheme || 'purple');
    setIsEditCardOpen(true);
    setActiveMenuCardId(null);
  };

  // Save New Card
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = Math.max(0, parseFloat(formCreditLimit));
    const outNum = Math.max(0, parseFloat(formCurrentOutstanding) || 0);
    const stmtNum = formStatementBalance ? Math.max(0, parseFloat(formStatementBalance)) : 0;
    const minNum = formMinimumDue ? Math.max(0, parseFloat(formMinimumDue)) : 0;

    const stmtDay = Math.min(31, Math.max(1, parseInt(formStatementDate, 10) || 15));
    const dueDay = Math.min(31, Math.max(1, parseInt(formPaymentDueDate, 10) || 5));

    if (!formCardName.trim() || !formBank.trim() || isNaN(limitNum) || limitNum <= 0) return;
    if (formLast4.length !== 4 || !/^\d{4}$/.test(formLast4)) return;

    addCreditCard({
      userId: user.id,
      cardName: formCardName.trim(),
      bank: formBank.trim(),
      network: formNetwork,
      last4Digits: formLast4,
      creditLimit: limitNum,
      currentOutstanding: outNum,
      statementBalance: stmtNum,
      minimumDue: minNum,
      statementDate: stmtDay,
      paymentDueDate: dueDay,
      interestRate: formInterestRate ? parseFloat(formInterestRate) : undefined,
      annualFee: formAnnualFee ? parseFloat(formAnnualFee) : undefined,
      rewardType: formRewardType,
      rewardRate: formRewardType !== 'None' && formRewardRate.trim() ? formRewardRate.trim() : undefined,
      cardTheme: formCardTheme,
      cardColor: CARD_THEME_GRADIENTS[formCardTheme] || CARD_THEME_GRADIENTS.purple,
      status: 'Active'
    });

    setIsAddCardOpen(false);
  };

  // Save Edit Card
  const handleSaveEditCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    const limitNum = Math.max(0, parseFloat(formCreditLimit));
    const outNum = Math.max(0, parseFloat(formCurrentOutstanding) || 0);
    const stmtNum = formStatementBalance ? Math.max(0, parseFloat(formStatementBalance)) : 0;
    const minNum = formMinimumDue ? Math.max(0, parseFloat(formMinimumDue)) : 0;

    const stmtDay = Math.min(31, Math.max(1, parseInt(formStatementDate, 10) || 15));
    const dueDay = Math.min(31, Math.max(1, parseInt(formPaymentDueDate, 10) || 5));

    if (!formCardName.trim() || !formBank.trim() || isNaN(limitNum) || limitNum <= 0) return;
    if (formLast4.length !== 4 || !/^\d{4}$/.test(formLast4)) return;

    updateCreditCard(editingCard.id, {
      cardName: formCardName.trim(),
      bank: formBank.trim(),
      network: formNetwork,
      last4Digits: formLast4,
      creditLimit: limitNum,
      currentOutstanding: outNum,
      statementBalance: stmtNum,
      minimumDue: minNum,
      statementDate: stmtDay,
      paymentDueDate: dueDay,
      interestRate: formInterestRate ? parseFloat(formInterestRate) : undefined,
      annualFee: formAnnualFee ? parseFloat(formAnnualFee) : undefined,
      rewardType: formRewardType,
      rewardRate: formRewardType !== 'None' && formRewardRate.trim() ? formRewardRate.trim() : undefined,
      cardTheme: formCardTheme,
      cardColor: CARD_THEME_GRADIENTS[formCardTheme] || CARD_THEME_GRADIENTS.purple
    });

    setIsEditCardOpen(false);
    setEditingCard(null);
  };

  // Open Payment Modal
  const handleOpenPayment = (card: CreditCard, defaultType: CardPaymentType = 'statement') => {
    setPaymentCard(card);
    setPaymentType(defaultType);
    setPaymentSourceAccountId(accounts.find((a) => a.isActive)?.id || '');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes('');

    const defaultAmt =
      defaultType === 'minimum'
        ? card.minimumDue
        : defaultType === 'statement'
        ? card.statementBalance || card.currentOutstanding
        : card.currentOutstanding;

    setPaymentAmount(defaultAmt > 0 ? defaultAmt.toString() : '');
    setIsPaymentModalOpen(true);
    setActiveMenuCardId(null);
  };

  // Submit Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCard) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    recordCardPayment({
      cardId: paymentCard.id,
      amount: amt,
      paymentDate,
      paymentType,
      sourceAccountId: paymentSourceAccountId || undefined,
      notes: paymentNotes
    });

    setIsPaymentModalOpen(false);
    setPaymentCard(null);
  };

  // Open Pay EMI Modal
  const handleOpenPayEMI = (emi: EMI) => {
    setPayingEMI(emi);
    setEmiPaySourceAccountId(accounts.find((a) => a.isActive)?.id || '');
    setActiveMenuCardId(null);
  };

  const handleConfirmPayEMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingEMI) return;
    payEMIInstallment(payingEMI.id, emiPaySourceAccountId || undefined);
    setPayingEMI(null);
  };

  // Open Convert / Add EMI Modal
  const handleOpenConvertEMI = (cardId?: string, defaultMode: 'new' | 'ongoing' = 'new') => {
    setEmiCardId(cardId || creditCards[0]?.id || '');
    setEmiCreationMode(defaultMode);
    setEmiTitle('');
    setEmiPurchaseAmount('60000');
    setEmiMonthlyAmount('5000');
    setEmiType('No-cost EMI');
    setEmiTenureMonths('12');
    setEmiInterestRate('0');
    setEmiProcessingFee('0');
    setEmiFirstDueDate(new Date().toISOString().split('T')[0]);
    setEmiPaidInstallmentsInput('4');
    setIsConvertEMIOpen(true);
    setActiveMenuCardId(null);
  };

  // Submit Convert / Add EMI
  const handleCreateEMI = (e: React.FormEvent) => {
    e.preventDefault();
    const purchAmt = parseFloat(emiPurchaseAmount);
    const tenure = parseInt(emiTenureMonths, 10);
    const interest = emiType === 'No-cost EMI' ? 0 : parseFloat(emiInterestRate) || 0;
    const procFee = parseFloat(emiProcessingFee) || 0;
    const paidCount = emiCreationMode === 'new' ? 0 : Math.min(tenure, Math.max(0, parseInt(emiPaidInstallmentsInput, 10) || 0));

    if (!emiTitle.trim() || isNaN(purchAmt) || purchAmt <= 0) return;
    if (emiCreationMode === 'ongoing' && emiLiveCalculations.isPaidExceeded) return;

    const isCompleted = paidCount >= tenure;

    addEMI({
      cardId: emiCardId || creditCards[0]?.id,
      title: emiTitle.trim(),
      purchaseTitle: emiTitle.trim(),
      purchaseAmount: purchAmt,
      downPayment: 0,
      principalAmount: purchAmt,
      interestAmount: emiLiveCalculations.interestAmount,
      processingFee: procFee,
      taxAmount: emiLiveCalculations.taxAmount,
      totalPayable: emiLiveCalculations.totalPayable,
      monthlyEmi: emiLiveCalculations.monthlyEmi,
      emiAmount: emiLiveCalculations.monthlyEmi,
      tenureMonths: tenure,
      paidMonths: paidCount,
      paidInstallments: paidCount,
      remainingInstallments: Math.max(0, tenure - paidCount),
      interestRate: interest,
      emiType,
      startDate: emiFirstDueDate,
      firstDueDate: emiFirstDueDate,
      nextDueDate: isCompleted ? emiFirstDueDate : emiLiveCalculations.nextDueDate,
      status: isCompleted ? 'Completed' : 'Active'
    });

    setIsConvertEMIOpen(false);
  };

  // Open Preclose Modal
  const handleOpenPreclose = (emi: EMI) => {
    setPrecloseEMIData(emi);
    const emiAmt = emi.monthlyEmi || emi.emiAmount || 0;
    const paidCount = emi.paidInstallments ?? emi.paidMonths ?? 0;
    const total = emi.totalPayable ?? emi.purchaseAmount;
    const remaining = Math.max(0, total - paidCount * emiAmt);
    setPrecloseAmount(remaining.toString());
    setPrecloseSourceAccountId(accounts.find((a) => a.isActive)?.id || '');
    setActiveMenuCardId(null);
  };

  // Confirm Preclose
  const handleConfirmPreclose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!precloseEMIData) return;
    const amt = parseFloat(precloseAmount);
    if (isNaN(amt) || amt < 0) return;

    precloseEMI(precloseEMIData.id, amt, precloseSourceAccountId || undefined);
    setPrecloseEMIData(null);
  };

  // Open Dedicated Card Drawer
  const handleOpenCardDrawer = (card: CreditCard, tab: typeof drawerTab = 'Overview') => {
    setDrawerCard(card);
    setDrawerTab(tab);
    setActiveMenuCardId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 mb-2">
            <CreditCardIcon className="w-3.5 h-3.5" />
            <span>Credit & Installment Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Credit Cards & EMIs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Monitor credit limits, billing dates, live utilization ratio, and installment schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenConvertEMI(undefined, 'new')}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            + Add EMI
          </button>
          <button
            onClick={handleOpenAddCard}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all border border-white/20 glass-shimmer cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credit Card</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Credit Limit</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {formatCurrency(totalLimit)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Across all active cards</span>
        </div>

        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-rose-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Outstanding</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 tracking-tight">
            {formatCurrency(totalOutstanding)}
          </p>
          <span className="text-[11px] text-rose-500/80 font-semibold mt-0.5 block">
            {overallUtilization}% of total limit used
          </span>
        </div>

        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-emerald-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Available Credit</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
            {formatCurrency(totalAvailable)}
          </p>
          <span className="text-[11px] text-emerald-600/80 font-semibold mt-0.5 block">
            {100 - overallUtilization}% credit capacity free
          </span>
        </div>

        <div className="glass-card glass-interactive p-5 sm:p-6 rounded-3xl shadow-xl border-amber-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Due This Month</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
            {formatCurrency(totalDueThisMonth)}
          </p>
          <span className="text-[11px] text-amber-600/80 font-semibold mt-0.5 block">
            Credit card statement dues
          </span>
        </div>
      </div>

      {/* Overall Credit Utilization & Monthly EMI Commitment Dual Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Bar (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Overall Credit Utilization
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${utilStatus.badgeBg} ${utilStatus.badgeText} ${utilStatus.badgeBorder}`}
              >
                {utilStatus.label}
              </span>
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">{overallUtilization}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200/70 dark:bg-slate-800/80 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all ${
                overallUtilization > 75
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : overallUtilization > 50
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                  : overallUtilization > 30
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500'
              }`}
              style={{ width: `${Math.min(100, overallUtilization)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{utilStatus.description}</span>
            <span>Recommended: &lt; 30%</span>
          </div>
        </div>

        {/* Monthly EMI Commitment (1 Col) */}
        <div className="glass-card p-6 rounded-3xl shadow-xl space-y-2 border-brand-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Monthly EMI Commitment
              </span>
              <Zap className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(monthlyCommitment)} <span className="text-xs text-slate-400 font-normal">/ month</span>
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Across {activeEmiCount} active EMIs · {formatCurrency(totalRemainingDebt)} remaining debt
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cards, banks, EMIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['Active', 'All', 'Archived', 'High Utilization', 'Payment Due'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setCardFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                cardFilter === tab
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'glass-subtle text-slate-600 dark:text-slate-300 hover:bg-brand-500/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE CREDIT CARDS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Credit Cards ({filteredCards.length})
          </h2>
        </div>

        {filteredCards.length === 0 ? (
          <div className="glass-card p-10 rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto text-brand-500">
              <CreditCardIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">No credit cards added yet.</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add your first card to track limits, statements and payments.
              </p>
            </div>
            <button
              onClick={handleOpenAddCard}
              className="px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95"
            >
              + Add Credit Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => {
              const usedPct = card.creditLimit > 0 ? Math.round((card.currentOutstanding / card.creditLimit) * 100) : 0;
              const available = Math.max(0, card.creditLimit - card.currentOutstanding);
              const isArchived = card.status === 'Archived';
              const cardBgGradient =
                CARD_THEME_GRADIENTS[card.cardTheme || 'purple'] ||
                card.cardColor ||
                CARD_THEME_GRADIENTS.purple;

              const { nextPaymentDueDate } = getNextBillingDates(card.statementDate || 15, card.paymentDueDate || 5);
              const rel = getRelativeDueLabel(nextPaymentDueDate);

              return (
                <div
                  key={card.id}
                  onClick={() => handleOpenCardDrawer(card, 'Overview')}
                  className={`p-6 rounded-3xl bg-gradient-to-tr ${cardBgGradient} text-white shadow-2xl flex flex-col justify-between space-y-6 relative border border-white/20 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-white/40 group ${
                    isArchived ? 'opacity-70 grayscale-[0.3]' : ''
                  }`}
                >
                  {/* Subtle High-Contrast Card Shimmer & Radial Depth */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />

                  {/* Card Header: Bank Logo + Card Name + Network Badge + Metallic Chip */}
                  <div className={`relative flex items-start justify-between gap-3 ${activeMenuCardId === card.id ? 'z-40' : 'z-10'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <BankLogo bankName={card.bank} accountName={card.cardName} size="md" />
                      <div className="min-w-0">
                        <h3 className="font-black text-lg text-white leading-snug tracking-tight truncate">
                          {card.cardName}
                        </h3>
                        <p className="text-xs text-white/75 font-semibold mt-0.5 truncate">
                          {card.bank}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex items-center gap-2">
                      <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-300 via-amber-100 to-amber-400 border border-amber-500/40 shadow-inner flex items-center justify-center opacity-90">
                        <div className="w-4 h-3 border border-amber-600/40 rounded-sm" />
                      </div>

                      {/* Dropdown 3-dot Menu Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuCardId(activeMenuCardId === card.id ? null : card.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                        title="Card options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Action Menu Popover */}
                      {activeMenuCardId === card.id && (
                        <div
                          className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-black/10 py-1.5 z-50 animate-fadeIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setActiveMenuCardId(null);
                              handleOpenEditCard(card);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit Card</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuCardId(null);
                              handleOpenConvertEMI(card.id, 'new');
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5 text-brand-500" />
                            <span>Convert to EMI</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuCardId(null);
                              handleOpenCardDrawer(card, 'Statements');
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            <span>View Statements</span>
                          </button>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                          <button
                            onClick={() => {
                              setActiveMenuCardId(null);
                              isArchived ? restoreCreditCard(card.id) : archiveCreditCard(card.id);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>{isArchived ? 'Restore Card' : 'Archive Card'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body: Outstanding Balance & Utilization Bar */}
                  <div className="relative z-0 space-y-2.5">
                    <span className="text-white/80 font-bold uppercase tracking-wider text-[11px] block">
                      Outstanding Balance
                    </span>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                        {formatCurrency(card.currentOutstanding)}
                      </p>
                      <span className="text-xs font-bold text-white/90">
                        {usedPct}% utilized
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden border border-white/20">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usedPct >= 75
                            ? 'bg-rose-400'
                            : usedPct >= 50
                            ? 'bg-amber-300'
                            : 'bg-emerald-300'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, usedPct))}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-bold text-white/80 pt-0.5">
                      <span>Available: {formatCurrency(available)}</span>
                      <span>Limit: {formatCurrency(card.creditLimit)}</span>
                    </div>
                  </div>

                  {/* Footer Metrics & Pay Button */}
                  <div className="relative z-0 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-white/85 text-[11px] font-bold block">
                        Statement: {formatCurrency(card.statementBalance || card.currentOutstanding)}
                      </span>
                      <span className="text-white font-black text-[11px]">
                        Due {rel.shortLabel} · Min {formatCurrency(card.minimumDue)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="font-mono text-xs font-black tracking-widest bg-black/40 text-white px-2 py-0.5 rounded-md border border-white/20">
                        •••• {card.last4Digits}
                      </span>
                      <button
                        onClick={() => handleOpenPayment(card)}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-white/90 font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        Pay Card
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* UPCOMING PAYMENTS SECTION */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Upcoming Payments</h2>
            <p className="text-xs text-slate-400 font-medium">Scheduled statement dues and purchase EMIs</p>
          </div>
          {upcomingPayments.length > 0 && (
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
              {upcomingPayments.length} due soon
            </span>
          )}
        </div>

        {upcomingPayments.length === 0 ? (
          <div className="p-8 text-center space-y-2 glass-subtle rounded-2xl">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">You&apos;re all clear.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No credit card or EMI payments are due soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingPayments.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl glass-subtle flex items-center justify-between gap-3 border border-slate-200/50 dark:border-white/5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">{item.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        item.status === 'Overdue'
                          ? 'bg-rose-500/15 text-rose-600 border border-rose-500/20'
                          : item.status === 'Due Today'
                          ? 'bg-rose-500/15 text-rose-600 border border-rose-500/20'
                          : item.status === 'Due Soon'
                          ? 'bg-amber-500/15 text-amber-600 border border-amber-500/20'
                          : 'bg-purple-500/15 text-purple-600 border border-purple-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 font-bold mt-1">
                    {item.relativeText}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-black text-sm text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                  <button
                    onClick={() => {
                      if (item.type === 'card' && item.cardId) {
                        const target = creditCards.find((c) => c.id === item.cardId);
                        if (target) handleOpenPayment(target);
                      } else if (item.type === 'emi' && item.emiId) {
                        const target = emis.find((e) => e.id === item.emiId);
                        if (target) handleOpenPayEMI(target);
                      }
                    }}
                    className="mt-1 px-3 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] transition-all cursor-pointer active:scale-95"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE EMIS SECTION */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Active EMIs</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                {formatCurrency(monthlyCommitment)}/mo
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Track purchase installments & repayment progress
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 glass-subtle p-1 rounded-2xl">
              {(['Active', 'All', 'Completed', 'Overdue'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEmiFilter(tab)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    emiFilter === tab
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleOpenConvertEMI(undefined, 'new')}
              className="px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all active:scale-95 cursor-pointer"
            >
              + Add / Convert EMI
            </button>
          </div>
        </div>

        {filteredEMIs.length === 0 ? (
          <div className="p-8 text-center space-y-2 glass-subtle rounded-2xl">
            <Zap className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-black text-sm text-slate-900 dark:text-white">No active EMIs.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Convert a purchase into an EMI to track installments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEMIs.map((emi) => {
              const targetCard = creditCards.find((c) => c.id === emi.cardId);
              const paidCount = emi.paidInstallments ?? emi.paidMonths ?? 0;
              const emiAmt = emi.monthlyEmi || emi.emiAmount || 0;
              const total = emi.totalPayable ?? emi.purchaseAmount;
              const paidAmt = paidCount * emiAmt;
              const remainingPrincipal = Math.max(0, total - paidAmt);
              const progressPct = Math.round((paidCount / emi.tenureMonths) * 100);
              const isCompleted = emi.status === 'Completed' || paidCount >= emi.tenureMonths;

              return (
                <div key={emi.id} className="p-5 sm:p-6 rounded-3xl glass-subtle space-y-4 glass-interactive">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {emi.purchaseTitle || emi.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-500/10 text-brand-600 border border-brand-500/20">
                          {emi.emiType || 'EMI'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Card: {targetCard?.cardName || 'Credit Card'} (•••• {targetCard?.last4Digits || '0000'})
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 font-black text-xs border border-brand-500/30 shrink-0">
                      {formatCurrency(emiAmt)} / mo
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>
                        {paidCount} of {emi.tenureMonths} installments paid
                      </span>
                      <span className="font-black text-brand-600 dark:text-brand-400">{progressPct}%</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-200/60 dark:bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Metrics Breakdown */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200/50 dark:border-white/5 text-center text-xs">
                    <div>
                      <span className="text-slate-400 font-medium text-[11px]">Original</span>
                      <p className="font-black text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(emi.purchaseAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium text-[11px]">Paid</span>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatCurrency(paidAmt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium text-[11px]">Remaining</span>
                      <p className="font-black text-rose-600 dark:text-rose-400 mt-0.5">
                        {formatCurrency(remainingPrincipal)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium text-[11px]">Next Due</span>
                      <p className="font-black text-slate-900 dark:text-white mt-0.5">
                        {isCompleted ? 'Done' : emi.nextDueDate}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setScheduleEMI(emi)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      View Schedule
                    </button>
                    {!isCompleted && (
                      <>
                        <button
                          onClick={() => handleOpenPreclose(emi)}
                          className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Pre-close
                        </button>
                        <button
                          onClick={() => handleOpenPayEMI(emi)}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-brand-500/20"
                        >
                          Pay Installment
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD CREDIT CARD MODAL (With Sticky Action Footer) */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsAddCardOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl shadow-2xl z-10 border border-white/40 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Credit Card</h3>
                <p className="text-xs text-slate-400">Add a new credit account to track limits and statements</p>
              </div>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <form id="add-card-form" onSubmit={handleCreateCard} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Quick Select Bank Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Quick Select Bank</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 glass-subtle rounded-2xl max-h-28 overflow-y-auto">
                  {POPULAR_BANKS.slice(0, 12).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBankForCard(b)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-brand-500/30 group cursor-pointer"
                      title={b.name}
                    >
                      <BankLogo bankName={b.name} size="sm" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-full text-center group-hover:text-brand-600">
                        {b.shortName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Details */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Card Name</label>
                <input
                  type="text"
                  placeholder="e.g. ICICI Amazon Pay, HDFC Regalia Gold"
                  value={formCardName}
                  onChange={(e) => setFormCardName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. ICICI, HDFC"
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Card Network</label>
                  <select
                    value={formNetwork}
                    onChange={(e) => setFormNetwork(e.target.value as CardNetwork)}
                    className="w-full px-3 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="American Express">American Express</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="8821"
                    value={formLast4}
                    onChange={(e) => setFormLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Credit Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Credit Limit (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="100000"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(e.target.value)}
                    className="w-full px-4 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Current Outstanding (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formCurrentOutstanding}
                    onChange={(e) => setFormCurrentOutstanding(e.target.value)}
                    className="w-full px-4 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Billing Days */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Statement Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formStatementDate}
                    onChange={(e) => setFormStatementDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Payment Due Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formPaymentDueDate}
                    onChange={(e) => setFormPaymentDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Optional Current Statement Initializers */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl glass-subtle">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Statement Balance (₹) <span className="text-[9px] text-brand-600 font-semibold">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formStatementBalance}
                    onChange={(e) => setFormStatementBalance(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Minimum Due (₹) <span className="text-[9px] text-brand-600 font-semibold">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formMinimumDue}
                    onChange={(e) => setFormMinimumDue(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Collapsible Advanced Details (Rewards are 100% Optional) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setFormShowAdvanced(!formShowAdvanced)}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{formShowAdvanced ? '− Hide Advanced Details' : '+ Advanced Details (Theme, Rewards, APR)'}</span>
                </button>

                {formShowAdvanced && (
                  <div className="mt-3 p-3.5 rounded-2xl glass-subtle space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Card Theme</label>
                      <div className="flex gap-2">
                        {(['purple', 'blue', 'dark', 'green', 'red', 'gold'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormCardTheme(t)}
                            className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${CARD_THEME_GRADIENTS[t]} border-2 transition-all cursor-pointer ${
                              formCardTheme === t ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Interest Rate (% APR)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="e.g. 42"
                          value={formInterestRate}
                          onChange={(e) => setFormInterestRate(e.target.value)}
                          className="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Annual Fee (₹)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 500"
                          value={formAnnualFee}
                          onChange={(e) => setFormAnnualFee(e.target.value)}
                          className="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Reward Fields (Reward Rate is hidden when Type is None) */}
                    <div className={formRewardType === 'None' ? 'space-y-1' : 'grid grid-cols-2 gap-3'}>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Reward Type</label>
                        <select
                          value={formRewardType}
                          onChange={(e) => {
                            const val = e.target.value as CardRewardType;
                            setFormRewardType(val);
                            if (val === 'None') setFormRewardRate('');
                          }}
                          className="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        >
                          <option value="None">None</option>
                          <option value="Cashback">Cashback</option>
                          <option value="Reward Points">Reward Points</option>
                          <option value="Miles">Miles</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {formRewardType !== 'None' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Reward Rate</label>
                          <input
                            type="text"
                            placeholder={
                              formRewardType === 'Cashback'
                                ? 'e.g. 5% on Amazon'
                                : formRewardType === 'Reward Points'
                                ? 'e.g. 2 pts / ₹100'
                                : 'e.g. 4 miles / ₹150'
                            }
                            value={formRewardRate}
                            onChange={(e) => setFormRewardRate(e.target.value)}
                            className="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddCardOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-card-form"
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 cursor-pointer hover:from-brand-500 hover:to-indigo-500 active:scale-95 transition-all"
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CREDIT CARD MODAL */}
      {isEditCardOpen && editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsEditCardOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl shadow-2xl z-10 border border-white/40 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <BankLogo bankName={formBank} accountName={formCardName} size="sm" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Credit Card</h3>
                  <p className="text-xs text-slate-400">Update card limits, dates, and theme</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditCardOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="edit-card-form" onSubmit={handleSaveEditCard} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Card Name</label>
                <input
                  type="text"
                  value={formCardName}
                  onChange={(e) => setFormCardName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Bank</label>
                  <input
                    type="text"
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Card Network</label>
                  <select
                    value={formNetwork}
                    onChange={(e) => setFormNetwork(e.target.value as CardNetwork)}
                    className="w-full px-3 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="American Express">American Express</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formLast4}
                    onChange={(e) => setFormLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Credit Limit (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(e.target.value)}
                    className="w-full px-4 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Current Outstanding (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formCurrentOutstanding}
                    onChange={(e) => setFormCurrentOutstanding(e.target.value)}
                    className="w-full px-4 py-2.5 glass-input rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Statement Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formStatementDate}
                    onChange={(e) => setFormStatementDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Payment Due Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formPaymentDueDate}
                    onChange={(e) => setFormPaymentDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Reward Details */}
              <div className={formRewardType === 'None' ? 'space-y-1' : 'grid grid-cols-2 gap-3'}>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Reward Type <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formRewardType}
                    onChange={(e) => {
                      const val = e.target.value as CardRewardType;
                      setFormRewardType(val);
                      if (val === 'None') setFormRewardRate('');
                    }}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Cashback">Cashback</option>
                    <option value="Reward Points">Reward Points</option>
                    <option value="Miles">Miles</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {formRewardType !== 'None' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      Reward Rate <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={
                        formRewardType === 'Cashback'
                          ? 'e.g. 5% on Amazon'
                          : formRewardType === 'Reward Points'
                          ? 'e.g. 2 pts / ₹100'
                          : 'e.g. 4 miles / ₹150'
                      }
                      value={formRewardRate}
                      onChange={(e) => setFormRewardRate(e.target.value)}
                      className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Card Theme</label>
                <div className="flex gap-2">
                  {(['purple', 'blue', 'dark', 'green', 'red', 'gold'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormCardTheme(t)}
                      className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${CARD_THEME_GRADIENTS[t]} border-2 transition-all cursor-pointer ${
                        formCardTheme === t ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditCardOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-card-form"
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 cursor-pointer hover:from-brand-500 hover:to-indigo-500 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAKE PAYMENT / PAY CARD MODAL */}
      {isPaymentModalOpen && paymentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center gap-3">
                <BankLogo bankName={paymentCard.bank} accountName={paymentCard.cardName} size="sm" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Pay {paymentCard.cardName}</h3>
                  <p className="text-xs text-slate-400">
                    {paymentCard.bank} •••• {paymentCard.last4Digits}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balances Card */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl glass-subtle text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Outstanding</span>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(paymentCard.currentOutstanding)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Statement</span>
                <p className="text-sm font-black text-brand-600 dark:text-brand-400 mt-0.5">
                  {formatCurrency(paymentCard.statementBalance || paymentCard.currentOutstanding)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Min Due</span>
                <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatCurrency(paymentCard.minimumDue)}
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Quick Amount</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('minimum');
                    setPaymentAmount(paymentCard.minimumDue.toString());
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    paymentType === 'minimum'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'glass-subtle border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Pay Minimum
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('statement');
                    setPaymentAmount((paymentCard.statementBalance || paymentCard.currentOutstanding).toString());
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    paymentType === 'statement'
                      ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                      : 'glass-subtle border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Pay Statement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('full');
                    setPaymentAmount(paymentCard.currentOutstanding.toString());
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    paymentType === 'full'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'glass-subtle border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Full Balance
                </button>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    setPaymentType('custom');
                  }}
                  className="w-full px-4 py-3 glass-input rounded-2xl text-xl font-black text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Payment Account
                </label>
                <select
                  value={paymentSourceAccountId}
                  onChange={(e) => setPaymentSourceAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Manual Record (No account debit)</option>
                  {accounts
                    .filter((a) => a.isActive)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.currentBalance)})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Recorded as liability settlement transfer (no double expense).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200/50 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/25 border border-white/20 cursor-pointer active:scale-95 transition-all"
                >
                  Make Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY EMI INSTALLMENT MODAL */}
      {payingEMI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setPayingEMI(null)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Pay EMI Installment</h3>
                <p className="text-xs text-slate-400">
                  {payingEMI.purchaseTitle || payingEMI.title} — Installment {(payingEMI.paidInstallments ?? payingEMI.paidMonths ?? 0) + 1} of {payingEMI.tenureMonths}
                </p>
              </div>
              <button
                onClick={() => setPayingEMI(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl glass-subtle text-center space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Installment Amount</span>
              <p className="text-3xl font-black text-brand-600 dark:text-brand-400">
                {formatCurrency(payingEMI.monthlyEmi || payingEMI.emiAmount)}
              </p>
              <span className="text-[11px] text-slate-500 font-medium block">
                Scheduled Due: {payingEMI.nextDueDate || '2026-09-05'}
              </span>
            </div>

            <form onSubmit={handleConfirmPayEMI} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Payment Account
                </label>
                <select
                  value={emiPaySourceAccountId}
                  onChange={(e) => setEmiPaySourceAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Manual Record (No account debit)</option>
                  {accounts
                    .filter((a) => a.isActive)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.currentBalance)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingEMI(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 cursor-pointer active:scale-95 transition-all"
                >
                  Mark Installment Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT / ADD EMI MODAL (Supporting New EMI vs Ongoing EMI) */}
      {isConvertEMIOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsConvertEMIOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl shadow-2xl z-10 border border-white/40 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Convert / Add EMI Plan</h3>
                  <p className="text-xs text-slate-400">Track purchase installments & live schedule</p>
                </div>
                <button
                  onClick={() => setIsConvertEMIOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Switcher: New EMI vs Existing / Ongoing EMI */}
              <div className="mt-4 flex p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEmiCreationMode('new')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    emiCreationMode === 'new'
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  New EMI
                </button>
                <button
                  type="button"
                  onClick={() => setEmiCreationMode('ongoing')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    emiCreationMode === 'ongoing'
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Existing / Ongoing EMI
                </button>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <form id="emi-form" onSubmit={handleCreateEMI} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Credit Card</label>
                <select
                  value={emiCardId}
                  onChange={(e) => setEmiCardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  required
                >
                  {creditCards
                    .filter((c) => c.status !== 'Archived')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cardName} ({c.bank} •••• {c.last4Digits})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Purchase Title</label>
                <input
                  type="text"
                  placeholder="e.g. Phone, Flight Tickets, Laptop, Furniture"
                  value={emiTitle}
                  onChange={(e) => setEmiTitle(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              {/* NEW EMI FIELDS */}
              {emiCreationMode === 'new' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Original Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="60000"
                        value={emiPurchaseAmount}
                        onChange={(e) => setEmiPurchaseAmount(e.target.value)}
                        className="w-full px-4 py-2.5 glass-input rounded-2xl text-base font-black text-slate-900 dark:text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">EMI Type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmiType('No-cost EMI');
                            setEmiInterestRate('0');
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            emiType === 'No-cost EMI'
                              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                              : 'glass-subtle text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          No-cost
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmiType('Regular EMI');
                            if (emiInterestRate === '0') setEmiInterestRate('14');
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            emiType === 'Regular EMI'
                              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                              : 'glass-subtle text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Regular
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Tenure</label>
                      <select
                        value={emiTenureMonths}
                        onChange={(e) => setEmiTenureMonths(e.target.value)}
                        className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="9">9 Months</option>
                        <option value="12">12 Months</option>
                        <option value="18">18 Months</option>
                        <option value="24">24 Months</option>
                        <option value="36">36 Months</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        First EMI Due Date
                      </label>
                      <input
                        type="date"
                        value={emiFirstDueDate}
                        onChange={(e) => setEmiFirstDueDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Regular EMI Interest / Fees */}
                  {emiType === 'Regular EMI' && (
                    <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                          Interest Rate (% p.a.)
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={emiInterestRate}
                            onChange={(e) => setEmiInterestRate(e.target.value)}
                            className="w-full pl-3.5 pr-8 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                            placeholder="0"
                          />
                          <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                          Processing Fee (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={emiProcessingFee}
                          onChange={(e) => setEmiProcessingFee(e.target.value)}
                          className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic Financial Live Preview for New EMI */}
                  <div className="p-4 rounded-2xl glass-subtle space-y-2 border border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Monthly Installment</span>
                      <span className="text-base font-black text-brand-600 dark:text-brand-400">
                        {formatCurrency(emiLiveCalculations.monthlyEmi)} / mo
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
                      <div>
                        <span className="text-slate-400">Interest</span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {emiType === 'No-cost EMI' ? '₹0 (No Interest)' : formatCurrency(emiLiveCalculations.interestAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">GST on Fee</span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(emiLiveCalculations.taxAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Payable</span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(emiLiveCalculations.totalPayable)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* EXISTING / ONGOING EMI FIELDS */
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Original Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="60000"
                        value={emiPurchaseAmount}
                        onChange={(e) => setEmiPurchaseAmount(e.target.value)}
                        className="w-full px-4 py-2.5 glass-input rounded-2xl text-base font-black text-slate-900 dark:text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Monthly EMI (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="5000"
                        value={emiMonthlyAmount}
                        onChange={(e) => setEmiMonthlyAmount(e.target.value)}
                        className="w-full px-4 py-2.5 glass-input rounded-2xl text-base font-black text-slate-900 dark:text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Tenure</label>
                      <select
                        value={emiTenureMonths}
                        onChange={(e) => setEmiTenureMonths(e.target.value)}
                        className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="9">9 Months</option>
                        <option value="12">12 Months</option>
                        <option value="18">18 Months</option>
                        <option value="24">24 Months</option>
                        <option value="36">36 Months</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        First EMI Date
                      </label>
                      <input
                        type="date"
                        value={emiFirstDueDate}
                        onChange={(e) => setEmiFirstDueDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Paid Installments
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={emiTenureMonths}
                        value={emiPaidInstallmentsInput}
                        onChange={(e) => setEmiPaidInstallmentsInput(e.target.value)}
                        className={`w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-black focus:outline-none ${
                          emiLiveCalculations.isPaidExceeded
                            ? 'text-rose-600 border-rose-500 ring-1 ring-rose-500'
                            : 'text-brand-600 dark:text-brand-400'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Validation message if paid exceeds installments due by today */}
                  {emiLiveCalculations.isPaidExceeded && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold animate-fadeIn">
                      Paid installments cannot exceed installments due as of today ({emiLiveCalculations.maxAllowedPaid} installments due by today).
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                        Interest Rate (% p.a.) <span className="text-[10px] text-slate-400 font-normal">(Auto-calculated)</span>
                      </label>
                      <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                        {(emiLiveCalculations.derivedRate || 0) > 0 ? `Auto-derived ~${(emiLiveCalculations.derivedRate || 0).toFixed(2)}% p.a.` : '0% (No-cost EMI)'}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={emiInterestRate}
                        onChange={(e) => setEmiInterestRate(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none font-mono"
                      />
                      <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">%</span>
                    </div>
                  </div>

                  {/* Dynamic Financial Live Preview for Ongoing EMI */}
                  <div className="p-4 rounded-2xl glass-subtle space-y-2.5 border border-brand-500/20 bg-brand-500/5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">
                        {emiLiveCalculations.paidInstallments} of {emiTenureMonths} Paid ({Math.round((emiLiveCalculations.paidInstallments / (parseInt(emiTenureMonths, 10) || 12)) * 100)}%)
                      </span>
                      <div className="flex items-center gap-1.5">
                        {emiLiveCalculations.overdueCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-600 border border-rose-500/30">
                            {emiLiveCalculations.overdueCount} Overdue
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-500">
                          Next Due: <strong className="text-slate-900 dark:text-white">{emiLiveCalculations.nextDueDate}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.round((emiLiveCalculations.paidInstallments / (parseInt(emiTenureMonths, 10) || 12)) * 100))}%`
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
                      <div>
                        <span className="text-slate-400">Paid Amount</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(emiLiveCalculations.paidAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Remaining</span>
                        <p className="font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(emiLiveCalculations.remainingAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Remaining Scheduled</span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {emiLiveCalculations.remainingInstallments} EMIs
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
                      <div>
                        <span className="text-slate-400">Total Payable</span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(emiLiveCalculations.totalPayable)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Interest</span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {emiLiveCalculations.totalInterest > 0
                            ? formatCurrency(emiLiveCalculations.totalInterest)
                            : '₹0 (No Interest)'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </form>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsConvertEMIOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="emi-form"
                disabled={emiCreationMode === 'ongoing' && emiLiveCalculations.isPaidExceeded}
                className={`flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 transition-all ${
                  emiCreationMode === 'ongoing' && emiLiveCalculations.isPaidExceeded
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:from-brand-500 hover:to-indigo-500 active:scale-95'
                }`}
              >
                Create EMI Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMI SCHEDULE MODAL */}
      {scheduleEMI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setScheduleEMI(null)} />
          <div className="relative w-full max-w-2xl glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {scheduleEMI.purchaseTitle || scheduleEMI.title} — Schedule
                </h3>
                <p className="text-xs text-slate-400">
                  {scheduleEMI.tenureMonths} Months Installment Plan • {formatCurrency(scheduleEMI.monthlyEmi || scheduleEMI.emiAmount)}/mo
                </p>
              </div>
              <button
                onClick={() => setScheduleEMI(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/50 dark:border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">EMI</th>
                    <th className="py-2.5 px-3 text-right">Principal</th>
                    <th className="py-2.5 px-3 text-right">Interest</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold">
                  {generateEMISchedule(scheduleEMI).map((inst) => (
                    <tr key={inst.installmentNumber} className="hover:bg-brand-500/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-400">{inst.installmentNumber}</td>
                      <td className="py-3 px-3 text-slate-900 dark:text-white">{inst.dueDate}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(inst.emiAmount)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">{formatCurrency(inst.principal)}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{formatCurrency(inst.interest)}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            inst.status === 'Paid'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : inst.status === 'Overdue'
                              ? 'bg-rose-500/15 text-rose-600'
                              : inst.status === 'Due'
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-slate-200/50 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setScheduleEMI(null)}
                className="px-5 py-2.5 rounded-2xl bg-brand-600 text-white font-bold text-xs cursor-pointer"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRE-CLOSE / PAY EARLY EMI MODAL */}
      {precloseEMIData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setPrecloseEMIData(null)} />
          <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Pre-close EMI</h3>
                <p className="text-xs text-slate-400">{precloseEMIData.purchaseTitle || precloseEMIData.title}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmPreclose} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Preclosure Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precloseAmount}
                  onChange={(e) => setPrecloseAmount(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-2xl text-xl font-black text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Payment Account
                </label>
                <select
                  value={precloseSourceAccountId}
                  onChange={(e) => setPrecloseSourceAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Manual Record (No account debit)</option>
                  {accounts
                    .filter((a) => a.isActive)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.currentBalance)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-medium">
                Pre-closing this plan will settle the remaining principal and complete the schedule.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPrecloseEMIData(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-500/25 border border-white/20 cursor-pointer active:scale-95 transition-all"
                >
                  Confirm Preclosure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED CARD DETAIL DRAWER / MODAL */}
      {drawerCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setDrawerCard(null)} />
          <div className="relative w-full max-w-3xl glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center gap-3.5">
                <BankLogo bankName={drawerCard.bank} accountName={drawerCard.cardName} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{drawerCard.cardName}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-600">
                      {drawerCard.network || 'Visa'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {drawerCard.bank} •••• {drawerCard.last4Digits}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={() => handleOpenPayment(drawerCard)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Pay Card</span>
                </button>
                <button
                  onClick={() => handleOpenConvertEMI(drawerCard.id, 'new')}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Add EMI</span>
                </button>
                <button
                  onClick={() => setDrawerTab('Statements')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View Statement</span>
                </button>
                <button
                  onClick={() => {
                    handleOpenEditCard(drawerCard);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Card</span>
                </button>
                <button
                  onClick={() => setDrawerCard(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-white/10 pb-2 overflow-x-auto">
              {(['Overview', 'Transactions', 'Statements', 'Payments', 'EMIs'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    drawerTab === tab
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            {drawerTab === 'Overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* 4 Overview Grid Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl glass-subtle">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Limit</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(drawerCard.creditLimit)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl glass-subtle">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Outstanding</span>
                    <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                      {formatCurrency(drawerCard.currentOutstanding)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl glass-subtle">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Available</span>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatCurrency(Math.max(0, drawerCard.creditLimit - drawerCard.currentOutstanding))}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl glass-subtle">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Statement Due</span>
                    <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatCurrency(drawerCard.statementBalance || drawerCard.currentOutstanding)}
                    </p>
                  </div>
                </div>

                {/* Additional Billing Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl glass-subtle space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Billing Schedule</h4>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Statement Day:</span>
                      <span className="text-slate-900 dark:text-white">Day {drawerCard.statementDate || 15} of month</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Payment Due Day:</span>
                      <span className="text-slate-900 dark:text-white">Day {drawerCard.paymentDueDate || 5} of month</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Minimum Due:</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(drawerCard.minimumDue)}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl glass-subtle space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Card Terms & Rewards</h4>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Interest Rate:</span>
                      <span className="text-slate-900 dark:text-white">{drawerCard.interestRate || 42}% APR</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Annual Fee:</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(drawerCard.annualFee || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Reward Type:</span>
                      <span className="text-slate-900 dark:text-white">{drawerCard.rewardType || 'None'}</span>
                    </div>
                    {drawerCard.rewardRate && (
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Reward Rate:</span>
                        <span className="text-brand-600 dark:text-brand-400">{drawerCard.rewardRate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {drawerTab === 'Transactions' && (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-xs text-slate-400 font-medium">Recent transactions linked to this credit card</p>
                {transactions.filter((t) => t.description.toLowerCase().includes(drawerCard.last4Digits) || t.description.toLowerCase().includes(drawerCard.cardName.toLowerCase())).length === 0 ? (
                  <div className="p-8 text-center glass-subtle rounded-2xl text-xs text-slate-400">
                    No transactions recorded for this card yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {transactions
                      .filter((t) => t.description.toLowerCase().includes(drawerCard.last4Digits) || t.description.toLowerCase().includes(drawerCard.cardName.toLowerCase()))
                      .map((t) => (
                        <div key={t.id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white">{t.description}</p>
                            <p className="text-[11px] text-slate-400">{t.date} · {t.category}</p>
                          </div>
                          <span className="font-black text-xs text-slate-900 dark:text-white">
                            {formatCurrency(t.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {drawerTab === 'Statements' && (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-xs text-slate-400 font-medium">Monthly billing statements & clearance history</p>
                {cardStatements.filter((s) => s.cardId === drawerCard.id).length === 0 ? (
                  <div className="p-8 text-center glass-subtle rounded-2xl text-xs text-slate-400">
                    No generated statements for this card yet. Statements generate on day {drawerCard.statementDate}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cardStatements
                      .filter((s) => s.cardId === drawerCard.id)
                      .map((stmt) => (
                        <div key={stmt.id} className="p-4 rounded-2xl glass-subtle flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-xs text-slate-900 dark:text-white">
                                Statement: {stmt.statementDate}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  stmt.status === 'Paid'
                                    ? 'bg-emerald-500/15 text-emerald-600'
                                    : 'bg-amber-500/15 text-amber-600'
                                }`}
                              >
                                {stmt.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Due Date: {stmt.paymentDueDate} · Minimum: {formatCurrency(stmt.minimumDue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-slate-900 dark:text-white">
                              {formatCurrency(stmt.statementAmount)}
                            </p>
                            {stmt.status !== 'Paid' && (
                              <button
                                onClick={() => handleOpenPayment(drawerCard, 'statement')}
                                className="mt-1 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Pay Statement
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {drawerTab === 'Payments' && (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-xs text-slate-400 font-medium">Payment receipts & bill clearance logs</p>
                {cardPayments.filter((p) => p.cardId === drawerCard.id).length === 0 ? (
                  <div className="p-8 text-center glass-subtle rounded-2xl text-xs text-slate-400">
                    No payment history recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {cardPayments
                      .filter((p) => p.cardId === drawerCard.id)
                      .map((p) => (
                        <div key={p.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-xs text-slate-900 dark:text-white">
                                {formatCurrency(p.amount)} Paid ({p.paymentType})
                              </p>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600">
                                Settled
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{p.paymentDate} · {p.notes || 'Card payment'}</p>
                          </div>
                          <span className="font-bold text-xs text-emerald-600">
                            −{formatCurrency(p.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {drawerTab === 'EMIs' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">Active installment plans on this card</p>
                  <button
                    onClick={() => handleOpenConvertEMI(drawerCard.id, 'new')}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    + Add New EMI
                  </button>
                </div>

                {emis.filter((e) => e.cardId === drawerCard.id).length === 0 ? (
                  <div className="p-8 text-center glass-subtle rounded-2xl text-xs text-slate-400">
                    No active EMIs running on this card.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emis
                      .filter((e) => e.cardId === drawerCard.id)
                      .map((emi) => (
                        <div key={emi.id} className="p-4 rounded-2xl glass-subtle flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-xs text-slate-900 dark:text-white">
                              {emi.purchaseTitle || emi.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {(emi.paidInstallments ?? emi.paidMonths ?? 0)} of {emi.tenureMonths} EMIs Paid • Next Due: {emi.nextDueDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-slate-900 dark:text-white">
                              {formatCurrency(emi.monthlyEmi || emi.emiAmount)}/mo
                            </p>
                            <button
                              onClick={() => setScheduleEMI(emi)}
                              className="mt-1 text-[10px] text-brand-600 font-bold hover:underline cursor-pointer"
                            >
                              View Schedule
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
