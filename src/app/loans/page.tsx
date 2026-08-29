'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Landmark,
  Plus,
  Calendar,
  Percent,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Building,
  MoreVertical,
  Pencil,
  DollarSign,
  Receipt,
  BarChart3,
  Archive,
  RotateCcw,
  Trash2,
  X,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
  Check,
  Search,
  HelpCircle
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import {
  formatCurrency,
  safeRound,
  calculateLoanSummary,
  calculateLoanDetailedSummary,
  calculateLoanAmortizationSchedule,
  calculateLoanEMI
} from '@/lib/calculations';
import { MAX_SAFE_TRANSACTION_AMOUNT, MAX_SAFE_BALANCE_AMOUNT, toSafeMoney } from '@/lib/moneySafe';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  Loan,
  LoanPayment,
  LoanType,
  LoanInterestType,
  LoanStatus,
  LoanAmortizationRow,
  LoanDetailedSummary
} from '@/lib/types';

export default function LoansPage() {
  const {
    loans,
    loanPayments,
    accounts,
    addLoan,
    editLoan,
    recordLoanPayment,
    archiveLoan,
    restoreLoan,
    deleteLoan,
    user
  } = useData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [loanFilter, setLoanFilter] = useState<'Active' | 'Completed' | 'Archived' | 'All'>('Active');

  // 3-Dot Action Menu State
  const [activeMenuLoanId, setActiveMenuLoanId] = useState<string | null>(null);

  // Add Loan Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addLender, setAddLender] = useState('');
  const [addType, setAddType] = useState<LoanType>('Personal Loan');
  const [addPrincipal, setAddPrincipal] = useState('500000');
  const [addInterestRate, setAddInterestRate] = useState('10.5');
  const [addInterestType, setAddInterestType] = useState<LoanInterestType>('Reducing Balance');
  const [addTenureMonths, setAddTenureMonths] = useState('36');
  const [addEmiAmount, setAddEmiAmount] = useState('');
  const [addStartDate, setAddStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [addDueDay, setAddDueDay] = useState('10');
  const [addLinkedAccountId, setAddLinkedAccountId] = useState('');
  const [addNotes, setAddNotes] = useState('');

  // Edit Loan Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editName, setEditName] = useState('');
  const [editLender, setEditLender] = useState('');
  const [editType, setEditType] = useState<LoanType>('Personal Loan');
  const [editPrincipal, setEditPrincipal] = useState('');
  const [editInterestRate, setEditInterestRate] = useState('');
  const [editInterestType, setEditInterestType] = useState<LoanInterestType>('Reducing Balance');
  const [editTenureMonths, setEditTenureMonths] = useState('24');
  const [editEmiAmount, setEditEmiAmount] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editDueDay, setEditDueDay] = useState('10');
  const [editEndDate, setEditEndDate] = useState('');
  const [editLinkedAccountId, setEditLinkedAccountId] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Record Payment Modal State
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [recordingLoan, setRecordingLoan] = useState<Loan | null>(null);
  const [recordInstallmentNum, setRecordInstallmentNum] = useState<number>(1);
  const [recordAmount, setRecordAmount] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordSourceAccountId, setRecordSourceAccountId] = useState('');
  const [recordPrincipalComp, setRecordPrincipalComp] = useState('');
  const [recordInterestComp, setRecordInterestComp] = useState('');
  const [recordNotes, setRecordNotes] = useState('');

  // Payment History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLoan, setHistoryLoan] = useState<Loan | null>(null);

  // Amortization Schedule Modal State
  const [isAmortizationOpen, setIsAmortizationOpen] = useState(false);
  const [amortizationLoan, setAmortizationLoan] = useState<Loan | null>(null);

  // Delete Loan Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingLoan, setDeletingLoan] = useState<Loan | null>(null);
  const [isDeletingLoan, setIsDeletingLoan] = useState(false);

  // Close menus on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuLoanId(null);
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsRecordPaymentOpen(false);
        setIsHistoryOpen(false);
        setIsAmortizationOpen(false);
        setIsDeleteConfirmOpen(false);
      }
    };

    const handleClickOutside = () => {
      setActiveMenuLoanId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Top Summaries (Derived strictly from actual loans records only)
  const {
    totalOriginalPrincipal,
    totalOutstandingPrincipal,
    totalMonthlyEMI,
    totalInterestRemaining,
    nextPaymentDue
  } = useMemo(() => calculateLoanSummary(loans, loanPayments), [loans, loanPayments]);

  // Live Auto-calculated EMI for Add Loan Modal
  const addCalculatedEMI = useMemo(() => {
    const p = parseFloat(addPrincipal) || 0;
    const r = parseFloat(addInterestRate) || 0;
    const n = parseInt(addTenureMonths, 10) || 12;
    return calculateLoanEMI(p, r, n, addInterestType);
  }, [addPrincipal, addInterestRate, addTenureMonths, addInterestType]);

  // Auto-sync calculated EMI into Add Modal input when empty
  useEffect(() => {
    if (addCalculatedEMI > 0 && (!addEmiAmount || addEmiAmount === '0')) {
      setAddEmiAmount(addCalculatedEMI.toString());
    }
  }, [addCalculatedEMI, addEmiAmount]);

  // Filtered Loans List
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      if (loan.isDeleted) return false;

      const summary = calculateLoanDetailedSummary(loan, loanPayments);
      const matchesSearch =
        loan.loanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.lender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loan.loanType && loan.loanType.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (loanFilter === 'Active') {
        return !summary.isArchived && !summary.isCompleted;
      }
      if (loanFilter === 'Completed') {
        return !summary.isArchived && (summary.isCompleted || loan.status === 'Completed');
      }
      if (loanFilter === 'Archived') {
        return summary.isArchived;
      }
      return true;
    });
  }, [loans, loanPayments, searchQuery, loanFilter]);

  // Handler: Open Add Modal
  const handleOpenAddModal = () => {
    setAddName('');
    setAddLender('HDFC Bank');
    setAddType('Personal Loan');
    setAddPrincipal('500000');
    setAddInterestRate('10.5');
    setAddInterestType('Reducing Balance');
    setAddTenureMonths('36');
    setAddStartDate(new Date().toISOString().split('T')[0]);
    setAddDueDay('10');
    setAddLinkedAccountId(accounts.find((a) => a.isActive)?.id || '');
    setAddNotes('');

    const autoEmi = calculateLoanEMI(500000, 10.5, 36, 'Reducing Balance');
    setAddEmiAmount(autoEmi.toString());
    setIsAddModalOpen(true);
  };

  // Handler: Save New Loan
  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const prinNum = parseFloat(addPrincipal);
    const rateNum = parseFloat(addInterestRate) || 0;
    const tenureNum = parseInt(addTenureMonths, 10) || 12;
    const emiNum = parseFloat(addEmiAmount) || addCalculatedEMI;
    const dueDayNum = parseInt(addDueDay, 10) || 10;

    if (!addName.trim() || isNaN(prinNum) || prinNum <= 0 || isNaN(emiNum) || emiNum <= 0) return;

    await addLoan({
      userId: user.id,
      loanName: addName.trim(),
      lender: addLender.trim() || 'Bank',
      loanType: addType,
      principal: prinNum,
      interestRate: rateNum,
      interestType: addInterestType,
      tenureMonths: tenureNum,
      emiAmount: emiNum,
      paidMonths: 0,
      startDate: addStartDate,
      dueDay: dueDayNum,
      paymentDayOfMonth: dueDayNum,
      linkedAccountId: addLinkedAccountId || undefined,
      notes: addNotes.trim() || undefined,
      outstandingPrincipal: prinNum
    });

    setIsAddModalOpen(false);
  };

  // Handler: Open Edit Modal
  const handleOpenEditModal = (loan: Loan) => {
    setEditingLoan(loan);
    setEditName(loan.loanName);
    setEditLender(loan.lender || '');
    setEditType(loan.loanType || 'Personal Loan');
    setEditPrincipal(loan.principal.toString());
    setEditInterestRate(loan.interestRate.toString());
    setEditInterestType(loan.interestType || 'Reducing Balance');
    setEditTenureMonths((loan.tenureMonths || 24).toString());
    setEditEmiAmount((loan.emiAmount || '').toString());
    setEditStartDate(loan.startDate || new Date().toISOString().split('T')[0]);
    setEditDueDay((loan.dueDay || loan.paymentDayOfMonth || 10).toString());
    setEditEndDate(loan.endDate || '');
    setEditLinkedAccountId(loan.linkedAccountId || '');
    setEditNotes(loan.notes || '');
    setIsEditModalOpen(true);
    setActiveMenuLoanId(null);
  };

  // Handler: Save Edit Loan
  const handleSaveEditLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;

    const prinNum = parseFloat(editPrincipal);
    const rateNum = parseFloat(editInterestRate) || 0;
    const tenureNum = parseInt(editTenureMonths, 10) || 12;
    const emiNum = parseFloat(editEmiAmount) || calculateLoanEMI(prinNum, rateNum, tenureNum, editInterestType);
    const dueDayNum = parseInt(editDueDay, 10) || 10;

    if (!editName.trim() || isNaN(prinNum) || prinNum <= 0 || isNaN(emiNum) || emiNum <= 0) return;

    await editLoan(editingLoan.id, {
      loanName: editName.trim(),
      lender: editLender.trim() || 'Bank',
      loanType: editType,
      principal: prinNum,
      interestRate: rateNum,
      interestType: editInterestType,
      tenureMonths: tenureNum,
      emiAmount: emiNum,
      startDate: editStartDate,
      dueDay: dueDayNum,
      paymentDayOfMonth: dueDayNum,
      endDate: editEndDate || undefined,
      linkedAccountId: editLinkedAccountId || undefined,
      notes: editNotes.trim() || undefined
    });

    setIsEditModalOpen(false);
    setEditingLoan(null);
  };

  // Handler: Open Record Payment Modal
  const handleOpenRecordPayment = (loan: Loan, installmentNum?: number) => {
    const summary = calculateLoanDetailedSummary(loan, loanPayments);
    const targetNum = installmentNum || summary.amortizationSchedule.find((r) => r.status !== 'Paid')?.installmentNumber || 1;
    const row = summary.amortizationSchedule.find((r) => r.installmentNumber === targetNum);

    const defaultAmt = row?.remainingAmount && row.remainingAmount > 0 ? row.remainingAmount : summary.monthlyEMI;
    const defaultPrin = row ? row.principalComponent : 0;
    const defaultInt = row ? row.interestComponent : 0;

    setRecordingLoan(loan);
    setRecordInstallmentNum(targetNum);
    setRecordAmount(defaultAmt > 0 ? defaultAmt.toString() : '');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setRecordSourceAccountId(loan.linkedAccountId || accounts.find((a) => a.isActive)?.id || '');
    setRecordPrincipalComp(defaultPrin > 0 ? defaultPrin.toString() : '');
    setRecordInterestComp(defaultInt > 0 ? defaultInt.toString() : '');
    setRecordNotes('');
    setIsRecordPaymentOpen(true);
    setActiveMenuLoanId(null);
  };

  // Handler: Submit Record Payment
  const handleSaveRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingLoan) return;

    const amt = parseFloat(recordAmount);
    if (isNaN(amt) || amt <= 0 || amt > MAX_SAFE_TRANSACTION_AMOUNT) return;

    const pComp = recordPrincipalComp ? parseFloat(recordPrincipalComp) : undefined;
    const iComp = recordInterestComp ? parseFloat(recordInterestComp) : undefined;

    await recordLoanPayment({
      loanId: recordingLoan.id,
      installmentNumber: recordInstallmentNum,
      amount: amt,
      paymentDate: recordDate,
      principalComponent: pComp,
      interestComponent: iComp,
      sourceAccountId: recordSourceAccountId || undefined,
      notes: recordNotes.trim() || undefined
    });

    setIsRecordPaymentOpen(false);
    setRecordingLoan(null);
  };

  // Handler: Open Payment History
  const handleOpenHistory = (loan: Loan) => {
    setHistoryLoan(loan);
    setIsHistoryOpen(true);
    setActiveMenuLoanId(null);
  };

  // Handler: Open Amortization Schedule
  const handleOpenAmortization = (loan: Loan) => {
    setAmortizationLoan(loan);
    setIsAmortizationOpen(true);
    setActiveMenuLoanId(null);
  };

  // Handler: Open Delete Loan Confirmation
  const handleOpenDelete = (loan: Loan) => {
    setDeletingLoan(loan);
    setIsDeleteConfirmOpen(true);
    setActiveMenuLoanId(null);
  };

  // Handler: Confirm Delete Loan
  const handleConfirmDelete = async () => {
    if (!deletingLoan) return;
    setIsDeletingLoan(true);
    try {
      await deleteLoan(deletingLoan.id, true);
    } finally {
      setIsDeletingLoan(false);
      setIsDeleteConfirmOpen(false);
      setDeletingLoan(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Borrowing & Mortgages</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Loans & Long-Term EMIs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Monitor Personal, Home, Vehicle, and Education loans with amortization payoff meters.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Loan</span>
        </button>
      </div>

      {/* Top Summary Metrics (Only Actual Loans) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card glass-interactive p-5 rounded-3xl shadow-xl">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Original Total Borrowed</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {formatCurrency(totalOriginalPrincipal)}
          </p>
        </div>

        <div className="glass-card glass-interactive p-5 rounded-3xl shadow-xl border-rose-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Outstanding Principal</span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 tracking-tight">
            {formatCurrency(totalOutstandingPrincipal)}
          </p>
        </div>

        <div className="glass-card glass-interactive p-5 rounded-3xl shadow-xl border-brand-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly EMI Commitments</span>
          <p className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400 mt-1 tracking-tight">
            {formatCurrency(totalMonthlyEMI)}
          </p>
        </div>

        <div className="glass-card glass-interactive p-5 rounded-3xl shadow-xl border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Next Payment Due</span>
            {nextPaymentDue?.isOverdue && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/15 text-rose-600 border border-rose-500/30">
                Overdue
              </span>
            )}
          </div>
          {nextPaymentDue ? (
            <div className="mt-1">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                {formatCurrency(nextPaymentDue.amount)}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {nextPaymentDue.loanName} · Due {nextPaymentDue.dueDate}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-400 mt-2">No upcoming payments due</p>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 glass-subtle p-1.5 rounded-2xl self-start">
          {(['Active', 'Completed', 'Archived', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setLoanFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                loanFilter === tab
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search loans or lenders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Loans Grid */}
      {filteredLoans.length === 0 ? (
        <div className="p-12 text-center space-y-3 glass-card rounded-3xl">
          <Landmark className="w-10 h-10 text-slate-400 mx-auto opacity-75" />
          <h3 className="font-black text-base text-slate-900 dark:text-white">
            {loanFilter === 'Archived'
              ? 'No archived loans.'
              : loanFilter === 'Completed'
              ? 'No completed loans yet.'
              : 'No active loans found.'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {loanFilter === 'Archived'
              ? 'Archived loans and their historical amortization schedules will appear here.'
              : 'Track mortgage, vehicle, or personal loans by creating a new loan plan.'}
          </p>
          {loanFilter === 'Active' && (
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              + Create First Loan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLoans.map((loan) => {
            const summary = calculateLoanDetailedSummary(loan, loanPayments);
            const isOverdue = summary.nextDueStatus === 'Overdue';
            const isDueToday = summary.nextDueStatus === 'Due' && summary.overdueDays === 0;

            return (
              <div
                key={loan.id}
                className={`glass-card glass-interactive p-6 sm:p-7 rounded-3xl space-y-5 shadow-2xl relative overflow-visible transition-all ${
                  summary.isArchived ? 'opacity-75 grayscale-[0.15]' : ''
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shadow-inner shrink-0">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-lg text-slate-900 dark:text-white leading-snug truncate">
                          {loan.loanName}
                        </h3>
                        {summary.isArchived && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                            Archived
                          </span>
                        )}
                        {summary.isCompleted && !summary.isArchived && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Completed
                          </span>
                        )}
                        {isOverdue && !summary.isCompleted && !summary.isArchived && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/15 text-rose-600 border border-rose-500/30">
                            {summary.overdueDays}d Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        {loan.lender} • <span className="capitalize font-bold text-brand-600 dark:text-brand-400">{loan.loanType}</span>
                      </p>
                    </div>
                  </div>

                  {/* Interest Rate & 3-Dot Menu */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-black text-xs border border-blue-500/30">
                      {loan.interestRate}% p.a.
                    </span>

                    {/* 3-Dot Action Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuLoanId(activeMenuLoanId === loan.id ? null : loan.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Loan options"
                        aria-label="Loan options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuLoanId === loan.id && (
                        <div
                          className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-black/10 py-1.5 z-50 animate-fadeIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenEditModal(loan)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit Loan</span>
                          </button>

                          <button
                            onClick={() => handleOpenRecordPayment(loan)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Record Payment</span>
                          </button>

                          <button
                            onClick={() => handleOpenHistory(loan)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Payment History</span>
                          </button>

                          <button
                            onClick={() => handleOpenAmortization(loan)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                            <span>Amortization Schedule</span>
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                          {summary.isArchived ? (
                            <button
                              onClick={() => {
                                setActiveMenuLoanId(null);
                                restoreLoan(loan.id);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore to Active</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveMenuLoanId(null);
                                archiveLoan(loan.id);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>Archive Loan</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenDelete(loan)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Loan</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold">
                    <span>
                      Tenure: {summary.paidInstallmentsCount} of {summary.totalTenure} Months Paid
                      {summary.partiallyPaidCount > 0 && ` (${summary.partiallyPaidCount} partial)`}
                    </span>
                    <span className="font-black text-brand-600 dark:text-brand-400">
                      {summary.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200/60 dark:bg-slate-800/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${summary.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* 3-Column Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/50 dark:border-white/5 text-center text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Principal</span>
                    <p className="font-black text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(summary.originalPrincipal)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Monthly EMI</span>
                    <p className="font-black text-brand-600 dark:text-brand-400 mt-0.5">
                      {formatCurrency(summary.monthlyEMI)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Due Day</span>
                    <p className="font-black text-slate-900 dark:text-white mt-0.5">
                      Day {loan.dueDay || loan.paymentDayOfMonth || 10}
                    </p>
                  </div>
                </div>

                {/* Bottom Highlight Row */}
                <div className="p-3.5 rounded-2xl glass-subtle flex items-center justify-between gap-3 text-xs border border-slate-200/40 dark:border-white/5">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Outstanding Principal</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-black text-sm">
                      {formatCurrency(summary.outstandingPrincipal)}
                    </strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {summary.isCompleted ? 'Status' : 'Next Due'}
                    </span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {summary.isCompleted ? 'Fully Repaid' : summary.nextDueDate}
                    </strong>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => handleOpenHistory(loan)}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>History & Schedule</span>
                  </button>

                  {!summary.isCompleted && !summary.isArchived && (
                    <button
                      onClick={() => handleOpenRecordPayment(loan)}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD LOAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl shadow-2xl z-10 border border-white/40 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Loan</h3>
                  <p className="text-xs text-slate-400">Set up repayment schedule & amortization plan</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="add-loan-form" onSubmit={handleCreateLoan} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Loan Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Home Loan, Axis Car Loan"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Lender / Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. SBI, HDFC, ICICI"
                    value={addLender}
                    onChange={(e) => setAddLender(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Loan Type</label>
                  <select
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as LoanType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Vehicle Loan">Vehicle Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Other Loan">Other Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Principal Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_SAFE_BALANCE_AMOUNT}
                    placeholder="500000"
                    value={addPrincipal}
                    onChange={(e) => setAddPrincipal(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="10.5"
                    value={addInterestRate}
                    onChange={(e) => setAddInterestRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Interest Calculation
                  </label>
                  <select
                    value={addInterestType}
                    onChange={(e) => setAddInterestType(e.target.value as LoanInterestType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Reducing Balance">Reducing Balance (Standard)</option>
                    <option value="Flat">Flat Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    placeholder="36"
                    value={addTenureMonths}
                    onChange={(e) => setAddTenureMonths(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                      Monthly EMI (₹)
                    </label>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                      ~{formatCurrency(addCalculatedEMI)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={MAX_SAFE_TRANSACTION_AMOUNT}
                    placeholder="Auto-calculated"
                    value={addEmiAmount}
                    onChange={(e) => setAddEmiAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={addStartDate}
                    onChange={(e) => setAddStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Monthly Due Day (1–31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={addDueDay}
                    onChange={(e) => setAddDueDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Linked Bank / Account
                  </label>
                  <select
                    value={addLinkedAccountId}
                    onChange={(e) => setAddLinkedAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">None / Manual Tracking</option>
                    {accounts
                      .filter((a) => a.isActive)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.currentBalance)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Account number, fixed rate terms, loan reference"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </form>

            <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-loan-form"
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 transition-all cursor-pointer active:scale-95"
              >
                Save Loan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LOAN MODAL (With Payment Preservation Guard) */}
      {isEditModalOpen && editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl shadow-2xl z-10 border border-white/40 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Loan</h3>
                  <p className="text-xs text-slate-400">Update loan parameters and repayment terms</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="edit-loan-form" onSubmit={handleSaveEditLoan} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Payment Preservation Warning Banner */}
              {(loanPayments.filter((p) => p.loanId === editingLoan.id).length > 0 || (editingLoan.paidMonths || 0) > 0) && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Payment History Preserved:</strong> This loan already has payment history. Changes will affect future calculations but will not modify previous payments.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Loan Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Lender / Bank</label>
                  <input
                    type="text"
                    value={editLender}
                    onChange={(e) => setEditLender(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Loan Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as LoanType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Vehicle Loan">Vehicle Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Other Loan">Other Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Principal (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_SAFE_BALANCE_AMOUNT}
                    value={editPrincipal}
                    onChange={(e) => setEditPrincipal(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editInterestRate}
                    onChange={(e) => setEditInterestRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Interest Method
                  </label>
                  <select
                    value={editInterestType}
                    onChange={(e) => setEditInterestType(e.target.value as LoanInterestType)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Reducing Balance">Reducing Balance</option>
                    <option value="Flat">Flat Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={editTenureMonths}
                    onChange={(e) => setEditTenureMonths(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_SAFE_TRANSACTION_AMOUNT}
                    value={editEmiAmount}
                    onChange={(e) => setEditEmiAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Monthly Due Day (1–31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editDueDay}
                    onChange={(e) => setEditDueDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Linked Bank Account
                  </label>
                  <select
                    value={editLinkedAccountId}
                    onChange={(e) => setEditLinkedAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">None / Manual</option>
                    {accounts
                      .filter((a) => a.isActive)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.currentBalance)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </form>

            <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-loan-form"
                className="flex-1 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-lg shadow-brand-500/25 border border-white/20 transition-all cursor-pointer active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD LOAN PAYMENT MODAL */}
      {isRecordPaymentOpen && recordingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => setIsRecordPaymentOpen(false)} />
          <div className="relative w-full max-w-md glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl shadow-2xl z-10 border border-white/40 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Record Loan Payment</h3>
                  <p className="text-xs text-slate-400">{recordingLoan.loanName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordPaymentOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="record-loan-payment-form" onSubmit={handleSaveRecordPayment} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Installment Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Installment Number
                </label>
                <select
                  value={recordInstallmentNum}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    setRecordInstallmentNum(num);
                    const summary = calculateLoanDetailedSummary(recordingLoan, loanPayments);
                    const row = summary.amortizationSchedule.find((r) => r.installmentNumber === num);
                    const rem = row?.remainingAmount && row.remainingAmount > 0 ? row.remainingAmount : summary.monthlyEMI;
                    setRecordAmount(rem > 0 ? rem.toString() : '');
                    if (row) {
                      setRecordPrincipalComp(row.principalComponent.toString());
                      setRecordInterestComp(row.interestComponent.toString());
                    }
                  }}
                  className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  {calculateLoanDetailedSummary(recordingLoan, loanPayments).amortizationSchedule.map((row) => (
                    <option key={row.installmentNumber} value={row.installmentNumber}>
                      Installment #{row.installmentNumber} ({row.status} · Due {row.dueDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Installment Status Helper Card */}
              {(() => {
                const summary = calculateLoanDetailedSummary(recordingLoan, loanPayments);
                const row = summary.amortizationSchedule.find((r) => r.installmentNumber === recordInstallmentNum);
                const emiAmt = row?.emiAmount || summary.monthlyEMI;
                const paidSoFar = row?.paidAmount || 0;
                const remaining = row?.remainingAmount ?? emiAmt;

                return (
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                      <span>Installment #{recordInstallmentNum} Target:</span>
                      <span>{formatCurrency(emiAmt)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Paid so far for this installment:</span>
                      <span className="text-emerald-600 font-bold">{formatCurrency(paidSoFar)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Remaining balance:</span>
                      <span className="text-rose-600 font-bold">{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Payment Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={MAX_SAFE_TRANSACTION_AMOUNT}
                    placeholder="e.g. 10000"
                    value={recordAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRecordAmount(val);
                      const amtNum = parseFloat(val);
                      if (!isNaN(amtNum) && amtNum > 0) {
                        const summary = calculateLoanDetailedSummary(recordingLoan, loanPayments);
                        const row = summary.amortizationSchedule.find((r) => r.installmentNumber === recordInstallmentNum);
                        if (row) {
                          const iComp = safeRound(Math.min(amtNum, row.interestComponent));
                          const pComp = safeRound(Math.max(0, amtNum - iComp));
                          setRecordInterestComp(iComp.toString());
                          setRecordPrincipalComp(pComp.toString());
                        }
                      }
                    }}
                    className="w-full pl-8 pr-4 py-3 glass-input rounded-2xl text-lg font-black text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Principal & Interest Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Principal Part (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={recordPrincipalComp}
                    onChange={(e) => setRecordPrincipalComp(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Interest Part (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={recordInterestComp}
                    onChange={(e) => setRecordInterestComp(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Payment Date & Source Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Account Used
                  </label>
                  <select
                    value={recordSourceAccountId}
                    onChange={(e) => setRecordSourceAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Manual Entry (No account debit)</option>
                    {accounts
                      .filter((a) => a.isActive)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.currentBalance)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Payment Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via Auto-debit ECS / Netbanking"
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px]">
                💡 Partial payments are supported. The installment will be marked <strong>Fully Paid</strong> only when the complete EMI amount is settled.
              </div>
            </form>

            <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsRecordPaymentOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="record-loan-payment-form"
                disabled={!recordAmount || parseFloat(recordAmount) <= 0}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/25 border border-white/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY MODAL */}
      {isHistoryOpen && historyLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsHistoryOpen(false)} />
          <div className="relative w-full max-w-4xl glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-6 max-h-[92vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{historyLoan.loanName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/10 text-blue-600">
                      {historyLoan.loanType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {historyLoan.lender} • {historyLoan.tenureMonths} Months • {formatCurrency(historyLoan.emiAmount)}/mo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsHistoryOpen(false);
                    handleOpenRecordPayment(historyLoan);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Summary Strip (8 Metrics) */}
            {(() => {
              const summary = calculateLoanDetailedSummary(historyLoan, loanPayments);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl glass-subtle">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Tenure</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{summary.totalTenure}</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-subtle">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Paid EMIs</span>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{summary.paidInstallmentsCount}</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-subtle">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Partial</span>
                    <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">{summary.partiallyPaidCount}</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-subtle">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Remaining</span>
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5">{summary.remainingInstallmentsCount}</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-subtle">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Principal Paid</span>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{formatCurrency(summary.totalPrincipalPaid)}</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-subtle">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Interest Paid</span>
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">{formatCurrency(summary.totalInterestPaid)}</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-subtle">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Total Paid</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">{formatCurrency(summary.totalAmountPaid)}</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-subtle">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Outstanding</span>
                    <p className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5 truncate">{formatCurrency(summary.outstandingPrincipal)}</p>
                  </div>
                </div>
              );
            })()}

            {/* Chronological Installments Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Chronological Installment Payment History
              </h4>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {calculateLoanDetailedSummary(historyLoan, loanPayments).amortizationSchedule.map((inst) => {
                  const matchingPayments = loanPayments.filter(
                    (p) => p.loanId === historyLoan.id && p.installmentNumber === inst.installmentNumber
                  );

                  return (
                    <div
                      key={inst.installmentNumber}
                      className="p-3.5 rounded-2xl glass-subtle border border-slate-200/50 dark:border-white/5 space-y-2 hover:border-brand-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                            #{inst.installmentNumber}
                          </span>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white">
                              EMI: {formatCurrency(inst.emiAmount)} · Principal: {formatCurrency(inst.principalComponent)} · Interest: {formatCurrency(inst.interestComponent)}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {inst.status === 'Paid' && inst.paymentDate
                                ? `Paid on ${inst.paymentDate}`
                                : `Due Date: ${inst.dueDate}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              inst.status === 'Paid'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : inst.status === 'Partially Paid'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : inst.status === 'Overdue'
                                ? 'bg-rose-500/15 text-rose-600'
                                : inst.status === 'Due'
                                ? 'bg-blue-500/15 text-blue-600'
                                : 'bg-slate-200/50 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {inst.status === 'Partially Paid'
                              ? `Partial (${formatCurrency(inst.paidAmount)})`
                              : inst.status}
                          </span>

                          {inst.status !== 'Paid' && (
                            <button
                              onClick={() => {
                                setIsHistoryOpen(false);
                                handleOpenRecordPayment(historyLoan, inst.installmentNumber);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] transition-all cursor-pointer active:scale-95"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Attached Transaction Records */}
                      {matchingPayments.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/40 dark:border-white/5 space-y-1">
                          {matchingPayments.map((pmt) => (
                            <div key={pmt.id} className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>
                                💳 Payment on {pmt.paymentDate} {pmt.notes ? `• ${pmt.notes}` : ''} (Principal: {formatCurrency(pmt.principalComponent)}, Interest: {formatCurrency(pmt.interestComponent)})
                              </span>
                              <strong className="text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(pmt.amount)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AMORTIZATION SCHEDULE MODAL */}
      {isAmortizationOpen && amortizationLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsAmortizationOpen(false)} />
          <div className="relative w-full max-w-4xl glass-panel bg-white/98 dark:bg-slate-900/98 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-white/40 dark:border-white/10 space-y-6 max-h-[92vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {amortizationLoan.loanName} — Amortization Schedule
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {amortizationLoan.interestType || 'Reducing Balance'} method · {amortizationLoan.interestRate}% p.a. · {amortizationLoan.tenureMonths} Months
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAmortizationOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amortization Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-white/5">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-3 py-3 text-center">#</th>
                    <th className="px-3 py-3">Due Date</th>
                    <th className="px-3 py-3 text-right">Opening Principal</th>
                    <th className="px-3 py-3 text-right">EMI</th>
                    <th className="px-3 py-3 text-right">Principal</th>
                    <th className="px-3 py-3 text-right">Interest</th>
                    <th className="px-3 py-3 text-right">Closing Principal</th>
                    <th className="px-3 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-mono font-medium">
                  {calculateLoanAmortizationSchedule(amortizationLoan, loanPayments).map((row) => (
                    <tr key={row.installmentNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-3 py-2.5 text-center font-sans font-bold text-slate-400">
                        {row.installmentNumber}
                      </td>
                      <td className="px-3 py-2.5 font-sans font-semibold text-slate-700 dark:text-slate-300">
                        {row.dueDate}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">
                        {formatCurrency(row.openingPrincipal)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-brand-600 dark:text-brand-400">
                        {formatCurrency(row.emiAmount)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatCurrency(row.principalComponent)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatCurrency(row.interestComponent)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(row.closingPrincipal)}
                      </td>
                      <td className="px-3 py-2.5 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            row.status === 'Paid'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : row.status === 'Partially Paid'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : row.status === 'Overdue'
                              ? 'bg-rose-500/15 text-rose-600'
                              : row.status === 'Due'
                              ? 'bg-blue-500/15 text-blue-600'
                              : 'bg-slate-200/50 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAmortizationOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLoan && (
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          title={
            loanPayments.filter((p) => p.loanId === deletingLoan.id).length > 0
              ? '⚠️ Delete Loan with Payment History?'
              : 'Delete Loan?'
          }
          description={
            loanPayments.filter((p) => p.loanId === deletingLoan.id).length > 0
              ? `⚠️ This loan has ${loanPayments.filter((p) => p.loanId === deletingLoan.id).length} payment records. Deleting this loan may permanently remove its financial records.`
              : `This loan has no payment history and will be permanently removed.`
          }
          confirmText="Delete Loan"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeletingLoan}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setIsDeleteConfirmOpen(false);
            setDeletingLoan(null);
          }}
        />
      )}
    </div>
  );
}
