[![Netlify Status](https://api.netlify.com/api/v1/badges/1d1a89ba-5b97-4775-b087-ce274b19a5a1/deploy-status)](https://app.netlify.com/projects/khatakithab/deploys)

# 💰 KhataKithab — Production Personal Finance & Expense Splitting App

**KhataKithab** is a full-stack, production-grade personal finance, recurring bill detector, and shared group expense splitting web application built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Firebase**.

Designed with **Indian financial patterns** in mind (₹ INR formatting, Reducing & Flat rate EMIs, credit card billing cycles, and UPI split culture).

---

## 🌟 Key Modules & Features

### 1. 🔁 Automatic Recurring & Subscription Detection Engine
- **Transaction-Derived Intelligence**: Detects repeating bills and software subscriptions directly from real expense transactions without name-only guesswork.
- **Merchant Normalization**: Strips terminal `#` plus numbers (`#01`, `#1042`), bank/gateway prefixes (`billdesk*`, `razorpay*`, `paytm*`), internal transaction reference numbers ($\ge 5$ digits), and punctuation while preserving original display merchants.
- **Cadence Window Classification**:
  - `weekly`: 5–9 days
  - `biweekly`: 12–17 days
  - `monthly`: 24–40 days
  - `quarterly`: 75–110 days
  - `annual`: 330–400 days
- **Strict False-Positive Protection**: Unhinted routine merchants require $\ge 3$ occurrences, cadence $\in \{\text{monthly}, \text{quarterly}, \text{annual}\}$ (strictly rejecting routine weekly shopping/groceries), and amount variation $\le 3\%$.
- **User Control & Dismissals**:
  - **Keep**: Confirms and saves item as an active tracked recurring payment or subscription.
  - **Ignore**: Persists normalized dismissal keys across sessions and devices.
  - **Settings Restore**: One-click restore for all dismissed patterns in Settings.
- **Dedicated Hubs**:
  - **Recurring Bills (`/recurring`)**: Live detection banner, combined monthly and annual commitments, next expected payments, and confirmed recurring bills.
  - **Subscriptions (`/subscriptions`)**: Streaming, software, and cloud tools tracking with renewal reminders and annual spend projections.

---

### 2. 📊 Personal Finance Command Center
- **Dashboard (`/`)**: Real-time net worth across active bank accounts, dynamic savings rate analysis, monthly income vs. spending cashflow charts, and upcoming due reminders.
- **Transactions Ledger (`/transactions`)**: Complete ledger supporting Expense, Income, and Internal Transfers. Features SHA-256 duplicate fingerprinting and real-time bounds validation.
- **Bank Accounts (`/accounts`)**: Multi-bank account tracking (HDFC, ICICI, SBI, Cash, Paytm, etc.) with automated balance synchronization. Internal transfers do not pollute expense analytics.
- **Credit Cards & CC EMIs (`/credit-cards`)**:
  - Track card limits, available credit, statement cycles, and minimum dues.
  - Complete **3-Dot Action Menu** on every EMI card (Edit, Record Payment, History, Archive, Delete).
  - Installment-level payment tracking with partial payment support and non-destructive payment history preservation.
- **Loans & Amortization (`/loans`)**:
  - Complete loan management independent from credit cards.
  - Supports both **Reducing Balance** and **Flat Rate** interest calculation models.
  - Full **Amortization Schedule** table (Opening balance, EMI, Principal, Interest, Closing balance, Status).
  - Historical payment preservation when modifying loan terms.
- **Category Budgets (`/budgets`)**: Monthly category spending caps, SVG Budget Health Score Ring, real-time warning indicators, and animated adjustment modals.
- **Savings Goals (`/goals`)**: Milestone tracking, goal cards, due dates, notes, and an instant Add Funds deposit modal with live total previews.
- **Reports & Analytics (`/reports`)**: Category donut charts, cashflow bar charts, persistent multi-device period selection (All time, 1M, 3M, 6M, 1Y), and CSV data exports.
- **Reminders (`/reminders`)**: Due date notifications for bills, EMIs, credit card statements, and custom reminder alarms.

---

### 3. 🍻 Circles — Shared Group Expense Splitting (`/circles`)
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

### 4. 🛡️ Financial Integrity & Money-Safe Engine
- **Decimal-Safe Calculations**: Centralized arithmetic in `src/lib/moneySafe.ts` and `src/lib/calculations.ts` guarding against `NaN`, `Infinity`, negative zero, and floating-point rounding inaccuracies.
- **Bounds Validation**: Live input validation and submission protection against unrealistic financial entries (> ₹10 Crores).
- **SHA-256 Duplicate Detection**: Fingerprinting preventing accidental duplicate manual and automated entries within 24 hours.
- **Accessible Modal Dialogs**: Custom animated `ConfirmDialog` components replacing raw browser alert/confirm popups across all destructive actions.

---

## ⚡ UX Rule: Sub-10 Second Quick Expense Entry

Click the floating **`+ Add Expense`** button or press **`⌘K` / `Ctrl+K`** anywhere in the application to record transactions or split circle bills in under 10 seconds!

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS, Glassmorphic UI design tokens, CSS variable dark mode
- **Visual Analytics**: Recharts & Custom SVG visual gauges
- **Icons**: Lucide React
- **Backend & Auth**: Firebase Auth, Cloud Firestore, Firebase Storage, Web Push & FCM architecture
- **Security Rules**: `firestore.rules` enforcing strict user isolation & circle membership authorization
- **Release Automation**: Dedicated multi-channel flight tooling (`scripts/release.js`, `scripts/update-version.js`)

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

## 🧪 Testing & Verification

```bash
# Run unit test suites (Recurring Detection, Loans, EMIs, Duplicate Fingerprinting)
npx tsx scratch/test_recurring_detection.ts
npx tsx scratch/test_loan_calculations.ts
npx tsx scratch/test_emi_calculations.ts

# Run TypeScript type check
npx tsc --noEmit

# Build production bundle
npm run build
```

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

> **Note**: When running without `.env.local`, KhataKithab automatically operates in **Demo Mode** with local storage fallback!

