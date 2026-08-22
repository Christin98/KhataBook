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
  Users
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/calculations';
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

  // Income vs Expense comparative data
  const monthlyCashflow = [
    { month: 'May', Income: 135000, Expense: 82000, Savings: 53000 },
    { month: 'Jun', Income: 140000, Expense: 89000, Savings: 51000 },
    { month: 'Jul', Income: 145000, Expense: 74000, Savings: 71000 },
    { month: 'Aug', Income: 157500, Expense: 41549, Savings: 115951 }
  ];

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-brand-600" />
            <span>Financial Analytics & Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Category breakdowns, cashflow trends, net worth analytics & CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Toolbar */}
      <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 overflow-x-auto">
        {[
          { label: 'This Month', key: 'this_month' },
          { label: 'Last Month', key: 'last_month' },
          { label: 'Last 3 Months', key: 'last_3_months' },
          { label: 'This Year (2026)', key: 'this_year' }
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setDateFilter(btn.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              dateFilter === btn.key
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category Donut Chart */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Expenses by Category</h2>
            <PieChartIcon className="w-5 h-5 text-brand-600" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `₹${val}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cashflow Trend Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Income vs Expense vs Savings</h2>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(val: any) => `₹${val}`} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Savings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
