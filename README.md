[![Netlify Status](https://api.netlify.com/api/v1/badges/1d1a89ba-5b97-4775-b087-ce274b19a5a1/deploy-status)](https://app.netlify.com/projects/khatakithab/deploys)

# 💰 KhataKithab — Production Personal Finance & Expense Splitting App

**KhataKithab** is a full-stack, production-ready personal finance and shared expense splitting web application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase**.

---

## 🌟 Key Highlights & Features

### 1. 📊 Personal Finance Command Center
- **Dashboard**: Live financial health score, net balance across active bank accounts, monthly income vs expense cashflow charts, and upcoming bill reminders.
- **Transactions**: Complete ledger supporting Expense, Income, and Internal Transfers. Features rich categories (Food & Dining, Transportation, Shopping, Bills & Utilities, Lifestyle, Financial) and custom categories.
- **Accounts**: Manage HDFC, ICICI, SBI, Cash Wallets, & Paytm accounts with automatic balance updating. Transfers between accounts do not count as personal expenses.
- **Credit Cards & CC EMI**: Credit limits, outstanding tracking, minimum dues, statement/due dates, and EMI tracker with visual progress bars.
- **Loans & Mortgages**: Personal Loan, Home Loan, Vehicle Loan, & Education Loan tracking with principal reduction metrics.
- **Monthly Budgets**: Category spending limits with automated **80% amber warning** & **100% red breach alerts**.
- **Savings Goals**: Emergency Reserve Fund, Vacation, Bike, Phone, & House savings meters.
- **Reports**: Interactive financial charts (Category donut chart, cashflow trend) with flexible date filters (This month, Last month, Last 3 months, This year) & CSV export capability.
- **Reminders**: Due date notifications for bills, EMIs, credit card statements & Firebase Cloud Messaging (FCM) architecture.

### 2. 🍻 Circles — Shared Expense Splitting
> **CRITICAL RULE**: Circles are strictly isolated for shared bill splitting with friends, family, flatmates, and colleagues. Circles do not mix with personal bank ledgers.

- **14 Predefined Indian Fun Categories**:
  - `Goa Plan (Never Happens)` 🏖️
  - `3 BHK Ki Kahani` 🏠
  - `Kaminey Dost` 🍻
  - `Chai, Charcha & Kharcha` ☕
  - `Backbenchers & Proxy` 🎒
  - `Hum Saath Saath Hain` 👨‍👩‍👧‍👦
  - `Corporate Majdoor` 💼
  - `Sale Mein Sab Jayaz Hai` 🛍️
  - `Party Sharty Unlimited` 🎉
  - `Petrol Kaun Bharenga?` 🚗
  - `Auto-Debit Ke Shikaar` 💳
  - ...and more!
- **Splitting Engine**: Equal split, Exact amounts, Percentage (%), and Shares.
- **Debt Minimizer ("Who Owes Whom")**: Live algorithm minimizing group transactions (e.g. *"Rahul owes you ₹500"*, *"You owe Anu ₹300"*).
- **Settlements**: Full or partial settlement recording with celebratory confetti animations (`canvas-confetti`).
- **Shareable Invites**: One-click invite link generation.

---

## ⚡ UX Rule: Sub-10 Second Quick Expense Entry

Click the floating **`+ Add Expense`** button or press **`⌘K` / `Ctrl+K`** anywhere in the application to record transactions or split circle bills in under 10 seconds!

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS, Glassmorphism design tokens, CSS variable dark mode
- **Visual Analytics**: Recharts (Financial cashflow & category charts)
- **Icons**: Lucide React
- **Backend & Auth**: Firebase Auth, Cloud Firestore, Firebase Storage, FCM architecture setup
- **Security Rules**: `firestore.rules` enforcing strict user isolation & circle membership authorization
- **Financial Engine**: Centralized decimal-safe math in `lib/calculations.ts` preventing floating-point rounding errors

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Firebase Configuration (`.env.local`)

To connect your own Firebase project, create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **Note**: When running without `.env.local`, KhataKithab automatically operates in **Demo Mode** with realistic sample data pre-loaded!
