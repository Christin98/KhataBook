'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  PieChart as PieChartIcon,
  TrendingUp,
  CreditCard,
  Landmark,
  Users,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateMonthlyCashflowTrend } from '@/lib/calculations';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export default function ReportsPage() {
  const { transactions, accounts, creditCards, loans, circles, circleExpenses } = useData();
  const [dateFilter, setDateFilter] = useState<'this_month' | 'last_month' | 'last_3_months' | 'this_year'>('this_month');

  // Category breakdown calculation
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#6366f1'];

  // Income vs Expense comparative data calculated dynamically from transactions
  const monthlyCashflow = calculateMonthlyCashflowTrend(transactions, 4);

  const handleExportCSV = () => {
    const headers = 'ID,Type,Amount,Category,Description,Date,Account\n';
    const rows = transactions
      .map((t) => `${t.id},${t.type},${t.amount},"${t.category}","${t.description}",${t.date},${t.accountId}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KhataKithab_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Deep Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Category breakdowns, cashflow trendlines, net worth trajectory, and full CSV exports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center border border-white/20 glass-shimmer cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Date Range Filter Toolbar */}
      <div className="glass-card p-2 rounded-2xl flex items-center gap-2 overflow-x-auto shadow-md border-white/20">
        {[
          { label: 'This Month', key: 'this_month' },
          { label: 'Last Month', key: 'last_month' },
          { label: 'Last 3 Months', key: 'last_3_months' },
          { label: 'This Year (2026)', key: 'this_year' }
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setDateFilter(btn.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              dateFilter === btn.key
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category Donut Chart */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Expenses by Category</h2>
              <p className="text-xs text-slate-400 font-medium">Distribution breakdown of outflows</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 shadow-inner">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">No expense records available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '16px',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cashflow Trend Bar Chart */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Income vs Outflow vs Net Savings</h2>
              <p className="text-xs text-slate-400 font-medium">Comparative savings velocity</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Savings" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
