'use client';

import React, { useState } from 'react';
import {
  CreditCard as CreditCardIcon,
  Plus,
  Calendar,
  AlertCircle,
  Percent,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateCreditCardSummary } from '@/lib/calculations';

export default function CreditCardsPage() {
  const { creditCards, emis, addCreditCard, addEMI, user } = useData();

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddEMIOpen, setIsAddEMIOpen] = useState(false);

  // New Card State
  const [cardName, setCardName] = useState('');
  const [bank, setBank] = useState('');
  const [last4Digits, setLast4Digits] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [currentOutstanding, setCurrentOutstanding] = useState('');

  // New EMI State
  const [selectedCardId, setSelectedCardId] = useState(creditCards[0]?.id || '');
  const [emiTitle, setEmiTitle] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [monthlyEmi, setMonthlyEmi] = useState('');

  const { totalLimit, totalOutstanding, totalAvailable, totalMinimumDue } = calculateCreditCardSummary(creditCards);

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(creditLimit);
    const outNum = parseFloat(currentOutstanding) || 0;
    if (!cardName.trim() || isNaN(limitNum)) return;

    addCreditCard({
      userId: user.id,
      cardName,
      bank: bank || 'Bank',
      last4Digits: last4Digits || '0000',
      creditLimit: limitNum,
      statementDate: 15,
      paymentDueDate: 5,
      annualFee: 0,
      currentOutstanding: outNum,
      minimumDue: Math.round(outNum * 0.05),
      cardColor: 'from-purple-900 to-indigo-900'
    });

    setIsAddCardOpen(false);
    setCardName('');
    setCreditLimit('');
  };

  const handleCreateEMI = (e: React.FormEvent) => {
    e.preventDefault();
    const purchNum = parseFloat(purchaseAmount);
    const downNum = parseFloat(downPayment) || 0;
    const emiNum = parseFloat(monthlyEmi);
    const tenureNum = parseInt(tenureMonths, 10);
    if (!emiTitle.trim() || isNaN(purchNum) || isNaN(emiNum)) return;

    addEMI({
      cardId: selectedCardId || creditCards[0]?.id,
      title: emiTitle,
      purchaseAmount: purchNum,
      downPayment: downNum,
      principalAmount: purchNum - downNum,
      tenureMonths: tenureNum,
      paidMonths: 1,
      emiAmount: emiNum,
      interestRate: 0,
      nextDueDate: '2026-09-05'
    });

    setIsAddEMIOpen(false);
    setEmiTitle('');
    setPurchaseAmount('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCardIcon className="w-8 h-8 text-brand-600" />
            <span>Credit Cards & EMI Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track credit limits, billing cycles, minimum dues, & active EMIs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Credit Card</span>
          </button>
        </div>
      </div>

      {/* Credit Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-500">Total Credit Limit</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(totalLimit)}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-500">Current Outstanding</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-500">Available Credit</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalAvailable)}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-500">Total Minimum Due</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{formatCurrency(totalMinimumDue)}</p>
        </div>
      </div>

      {/* Credit Cards Visual Display */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Your Credit Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditCards.map((card) => {
            const usedPct = card.creditLimit > 0 ? Math.round((card.currentOutstanding / card.creditLimit) * 100) : 0;
            const available = card.creditLimit - card.currentOutstanding;

            return (
              <div
                key={card.id}
                className={`p-6 rounded-3xl bg-gradient-to-tr ${card.cardColor} text-white shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{card.cardName}</h3>
                    <p className="text-xs text-purple-200">{card.bank}</p>
                  </div>
                  <span className="font-mono text-sm tracking-widest bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                    •••• {card.last4Digits}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-purple-200">Outstanding: {formatCurrency(card.currentOutstanding)}</span>
                    <span className="font-bold">Limit: {formatCurrency(card.creditLimit)}</span>
                  </div>

                  {/* Limit Usage Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usedPct > 80 ? 'bg-rose-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, usedPct)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-purple-200">
                  <div>
                    <span>Available: </span>
                    <strong className="text-white">{formatCurrency(available)}</strong>
                  </div>
                  <div>
                    <span>Due: Day {card.paymentDueDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EMI Section */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Credit Card EMIs</h2>
            <p className="text-xs text-slate-500">Track purchase installments & tenure remaining</p>
          </div>
          <button
            onClick={() => setIsAddEMIOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md"
          >
            + Convert Purchase to EMI
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emis.map((emi) => {
            const targetCard = creditCards.find((c) => c.id === emi.cardId);
            const remainingMonths = emi.tenureMonths - emi.paidMonths;
            const remainingPrincipal = emi.principalAmount - emi.paidMonths * emi.emiAmount;
            const progressPct = Math.round((emi.paidMonths / emi.tenureMonths) * 100);

            return (
              <div key={emi.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{emi.title}</h3>
                    <p className="text-xs text-slate-500">
                      Card: {targetCard?.cardName || 'Credit Card'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-xs">
                    ₹{emi.emiAmount} / mo
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>
                      Progress: {emi.paidMonths} of {emi.tenureMonths} EMIs Paid
                    </span>
                    <span className="font-bold text-brand-600">{progressPct}%</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center text-xs">
                  <div>
                    <span className="text-slate-400">Total Purchase</span>
                    <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(emi.purchaseAmount)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Remaining</span>
                    <p className="font-bold text-rose-600">{formatCurrency(Math.max(0, remainingPrincipal))}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Next EMI</span>
                    <p className="font-bold text-slate-900 dark:text-white">{emi.nextDueDate}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Card Modal */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddCardOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Credit Card</h3>
            <form onSubmit={handleCreateCard} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Card Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Regalia Gold"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="8821"
                    value={last4Digits}
                    onChange={(e) => setLast4Digits(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Current Outstanding (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentOutstanding}
                    onChange={(e) => setCurrentOutstanding(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddCardOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add EMI Modal */}
      {isAddEMIOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddEMIOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 border space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Convert Purchase to EMI</h3>
            <form onSubmit={handleCreateEMI} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Select Credit Card</label>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                >
                  {creditCards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cardName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 16 Pro, Laptop"
                  value={emiTitle}
                  onChange={(e) => setEmiTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Purchase Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="72000"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={monthlyEmi}
                    onChange={(e) => setMonthlyEmi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tenure (Months)</label>
                <select
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="9">9 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddEMIOpen(false)} className="flex-1 py-2.5 rounded-xl border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
                  Save EMI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
