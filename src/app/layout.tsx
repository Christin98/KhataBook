import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DataProvider } from '@/context/DataContext';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KhataKithab | Personal Finance & Shared Expense Splitting',
  description: 'Production-ready personal expense tracker and shared Circles expense splitting platform.',
  keywords: ['personal finance', 'expense tracker', 'expense splitting', 'khatakithab', 'india finance', 'split bills'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}>
        <DataProvider>
          <AppShell>{children}</AppShell>
        </DataProvider>
      </body>
    </html>
  );
}
