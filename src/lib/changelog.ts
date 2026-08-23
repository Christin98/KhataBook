import { ChangelogRelease } from './types';
import { APP_INFO } from './constants';

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: APP_INFO.version,
    stage: APP_INFO.stage,
    date: '2026-08-23',
    title: 'Smart Notification Center & Circle Auto-Ledger Sync',
    summary: 'A unified notification hub for bill dues & budget alarms, automatic bank debiting from Circle group expenses, and enhanced local developer tooling.',
    isCurrent: true,
    highlights: [
      '🔔 Live In-App Notification Center with browser Web Push alerts',
      '💳 Auto-Ledger Debit: Paying for circle expenses or settlements now directly logs personal transactions & updates bank balances',
      '⚡ Smart Reminders with "Pay & Record in Ledger" shortcut',
      '✨ Release Tracker & "What\'s New" changelog announcements'
    ],
    features: [
      {
        title: 'Unified Notification Center',
        description: 'Instant alerts for upcoming bill dues (3 days & today), overdue payments, 80%/100% budget breaches, and circle debts.',
        tag: 'New'
      },
      {
        title: 'Circle Auto-Ledger Integration',
        description: 'When adding a group expense or settling up, select which bank account or wallet was debited/credited to keep your ledger synchronized.',
        tag: 'Core'
      },
      {
        title: 'Native Browser Push Notifications',
        description: 'Opt-in for desktop and mobile browser push alarms so you never miss a credit card bill or rent deadline.',
        tag: 'Alarms'
      },
      {
        title: 'Environment Badging (Dev, Beta & Prod)',
        description: 'Distinct badges in header, sidebar, and footer for Local Dev (purple), Beta Flight (amber), and Production.',
        tag: 'System'
      }
    ],
    fixes: [
      'Resolved Netlify build secrets scan false-positive for NEXT_PUBLIC Firebase variables',
      'Unlocked Budgets, Goals, and Reminders in local development and beta preview modes',
      'Updated Node.js runtime to Node 22 for optimized serverless performance'
    ]
  },
  {
    version: 'v0.3.0',
    stage: 'Major Update',
    date: '2026-08-23',
    title: 'Dual-Branch Architecture & Beta Access Gate',
    summary: 'Production and Beta flight channels on Netlify, secured by client-side AES-256 encryption and passcode flight gates.',
    highlights: [
      '🔐 Client-side AES-256-GCM authenticated encryption for financial fields',
      '🔒 Private Beta Access Gate with passcode verification & instant Google developer login',
      '🌿 Dual-branch deployment on Netlify (main for Prod, beta for Flight)',
      '🛡️ Global End-to-End Encryption status indicator'
    ],
    features: [
      {
        title: 'AES-256-GCM Zero-Knowledge Encryption',
        description: 'Financial amounts, descriptions, account balances, and notes are encrypted on your device using Web Crypto API before saving.',
        tag: 'Security'
      },
      {
        title: 'Beta Access Gate',
        description: 'Glassmorphic access gate for invite-only testers on the beta branch with passcode unlock and developer sign-in.',
        tag: 'Preview'
      },
      {
        title: 'Under Active Development Showcase',
        description: 'Rich preview screens explaining upcoming capabilities for Budgets, Goals, and Reminders on the production site.',
        tag: 'UI'
      }
    ],
    fixes: [
      'Resolved Firebase Firestore security rules for multi-user circles and subcollections',
      'Fixed mobile drawer z-index and footer spacing for bottom nav'
    ]
  },
  {
    version: 'v0.2.0',
    stage: 'Feature Drop',
    date: '2026-08-22',
    title: 'Circles Split Engine & Firebase Realtime Cloud Sync',
    summary: 'Group expense splitting with simplified debt algorithms, QR invite codes, and Firebase Auth sync.',
    highlights: [
      '👥 Shared Circles: Split bills equally or by custom amounts',
      '⚡ Simplified Debt Engine ("Who Owes Whom")',
      '☁️ Realtime Firebase Firestore synchronization across all devices'
    ],
    features: [
      {
        title: 'Splitwise-Style Circles',
        description: 'Create shared expense groups (e.g. Trips, Flatmates, Office Lunches) and track shared liabilities effortlessly.',
        tag: 'Shared'
      },
      {
        title: 'Simplified Debt Settlement',
        description: 'Minimizes total number of transactions required to settle up with friends.',
        tag: 'Engine'
      }
    ]
  }
];

export const CURRENT_RELEASE = CHANGELOG_RELEASES[0];
