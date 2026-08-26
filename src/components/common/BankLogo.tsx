'use client';

import React from 'react';
import { Building2, Banknote, Wallet, Vault } from 'lucide-react';
import { detectBank, BankDefinition } from '@/lib/banks';
import { AccountType } from '@/lib/types';

interface BankLogoProps {
  bankName?: string;
  accountName?: string;
  accountType?: AccountType | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
  customColor?: string;
}

export default function BankLogo({
  bankName,
  accountName,
  accountType = 'bank',
  className = '',
  size = 'md',
  showBackground = true,
  customColor
}: BankLogoProps) {
  const bank: BankDefinition | null =
    detectBank(bankName, accountType) || detectBank(accountName, accountType);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8'
  };

  const bgStyle = showBackground
    ? { backgroundColor: customColor || bank?.primaryColor || '#6366f1' }
    : {};

  const renderLogoContent = () => {
    if (!bank) {
      if (accountType === 'cash') {
        return <Banknote className={`${iconSizes[size]} text-white`} />;
      }
      if (accountType === 'wallet') {
        return <Wallet className={`${iconSizes[size]} text-white`} />;
      }
      if (accountType === 'savings') {
        return <Vault className={`${iconSizes[size]} text-white`} />;
      }
      return <Building2 className={`${iconSizes[size]} text-white`} />;
    }

    switch (bank.id) {
      case 'hdfc':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* HDFC Bank Blue & Red geometric square mark */}
            <rect width="100" height="100" rx="18" fill="#004c8f" />
            <rect x="18" y="18" width="64" height="64" rx="4" fill="#ed1c24" />
            <rect x="28" y="28" width="44" height="44" fill="#ffffff" />
            <rect x="38" y="18" width="24" height="64" fill="#004c8f" />
            <rect x="18" y="38" width="64" height="24" fill="#004c8f" />
            <rect x="38" y="38" width="24" height="24" fill="#ffffff" />
          </svg>
        );

      case 'sbi':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* State Bank of India Blue circle & Keyhole */}
            <circle cx="50" cy="50" r="46" fill="#00a5ec" />
            <circle cx="50" cy="40" r="14" fill="#ffffff" />
            <rect x="44" y="40" width="12" height="38" fill="#ffffff" />
          </svg>
        );

      case 'icici':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* ICICI Bank vermilion badge with flame i */}
            <rect width="100" height="100" rx="20" fill="#b02a30" />
            <circle cx="60" cy="32" r="10" fill="#f37021" />
            <path
              d="M38 28C38 28 48 38 48 55C48 68 38 76 30 76C44 82 66 74 66 52C66 38 52 28 38 28Z"
              fill="#ffffff"
            />
            <path
              d="M45 42C45 42 55 48 55 60C55 69 48 74 42 75C52 77 65 72 65 58C65 48 54 42 45 42Z"
              fill="#f37021"
            />
          </svg>
        );

      case 'axis':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* Axis Bank Maroon Burgundy Angular A mark */}
            <rect width="100" height="100" rx="18" fill="#97144d" />
            <path d="M50 18L78 78H58L50 58L42 78H22L50 18Z" fill="#ffffff" />
            <path d="M50 38L64 70H54L50 58L46 70H36L50 38Z" fill="#97144d" />
            <path d="M35 62H65L58 76H28L35 62Z" fill="#ffffff" opacity="0.9" />
          </svg>
        );

      case 'kotak':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* Kotak Mahindra Bank Infinity Red Ribbon */}
            <rect width="100" height="100" rx="18" fill="#ed1c24" />
            <path
              d="M30 38C22 38 18 44 18 50C18 56 22 62 30 62C40 62 48 48 58 40C66 34 76 34 82 42C88 50 86 60 78 64C68 68 58 54 50 46"
              stroke="#ffffff"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'pnb':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* Punjab National Bank Circle & Yellow Crest */}
            <rect width="100" height="100" rx="18" fill="#a20a3a" />
            <circle cx="50" cy="50" r="32" stroke="#fdb813" strokeWidth="8" />
            <path d="M36 34H54C62 34 66 38 66 45C66 52 62 56 54 56H46V68H36V34Z" fill="#ffffff" />
            <circle cx="50" cy="50" r="10" fill="#fdb813" />
          </svg>
        );

      case 'bob':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* Bank of Baroda Vermilion Rising Sun Rays */}
            <rect width="100" height="100" rx="18" fill="#f26522" />
            <circle cx="50" cy="50" r="22" fill="#ffffff" />
            <path d="M50 16V26M50 74V84M16 50H26M74 50H84M26 26L34 34M66 66L74 74M26 74L34 66M66 34L74 26" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
            <circle cx="50" cy="50" r="12" fill="#f26522" />
          </svg>
        );

      case 'idfc':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* IDFC FIRST Bank Deep Maroon Crest */}
            <rect width="100" height="100" rx="18" fill="#9d1d27" />
            <text x="50" y="44" fill="#ffffff" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">IDFC</text>
            <rect x="22" y="52" width="56" height="4" fill="#f37021" rx="2" />
            <text x="50" y="72" fill="#ffffff" fontSize="15" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="2">FIRST</text>
          </svg>
        );

      case 'indusind':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* IndusInd Bank Royal Crimson Zebu Mark */}
            <rect width="100" height="100" rx="18" fill="#880e4f" />
            <circle cx="50" cy="50" r="30" stroke="#fdb813" strokeWidth="4" fill="#6a0b3e" />
            <path d="M35 48C40 38 60 38 65 48C62 60 38 60 35 48Z" fill="#fdb813" />
            <circle cx="50" cy="48" r="7" fill="#880e4f" />
          </svg>
        );

      case 'canara':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* Canara Bank Dual Blue & Orange Triangles */}
            <rect width="100" height="100" rx="18" fill="#0091df" />
            <path d="M28 68L50 28L72 68H28Z" fill="#f39200" opacity="0.9" />
            <path d="M40 76L60 38L80 76H40Z" fill="#ffffff" opacity="0.95" />
          </svg>
        );

      case 'union':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* Union Bank Interlocking U */}
            <rect width="100" height="100" rx="18" fill="#00488f" />
            <path d="M28 30V54C28 64 36 72 46 72C56 72 64 64 64 54V30H52V54C52 57 49 60 46 60C43 60 40 57 40 54V30H28Z" fill="#ed1c24" />
            <path d="M48 30V54C48 64 56 72 66 72C76 72 84 64 84 54V30H72V54C72 57 69 60 66 60C63 60 60 57 60 54V30H48Z" fill="#ffffff" />
          </svg>
        );

      case 'yes':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* Yes Bank Navy and Red Chevron */}
            <rect width="100" height="100" rx="18" fill="#003366" />
            <path d="M24 42L44 64L78 28" stroke="#e4002b" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 42L44 64L78 28" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'paytm':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            {/* Paytm Navy & Cyan */}
            <rect width="100" height="100" rx="18" fill="#002e6e" />
            <text x="50" y="58" fill="#00b9f5" fontSize="24" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">paytm</text>
          </svg>
        );

      case 'federal':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            <rect width="100" height="100" rx="18" fill="#004b87" />
            <circle cx="50" cy="50" r="30" fill="#f7a800" />
            <path d="M38 34H62V42H46V48H60V56H46V68H38V34Z" fill="#004b87" />
          </svg>
        );

      case 'rbl':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            <rect width="100" height="100" rx="18" fill="#003c71" />
            <path d="M30 26H56C66 26 72 32 72 40C72 48 66 52 58 54L74 74H60L46 54H40V74H30V26Z" fill="#e31837" />
            <circle cx="48" cy="40" r="6" fill="#ffffff" />
          </svg>
        );

      case 'jupiter':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            <rect width="100" height="100" rx="18" fill="#2b2353" />
            <circle cx="50" cy="50" r="28" fill="#ff7759" />
            <path d="M42 34V60C42 66 48 70 54 70C60 70 64 66 64 60V34" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
          </svg>
        );

      case 'fi':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
            <rect width="100" height="100" rx="18" fill="#1d2331" />
            <text x="50" y="64" fill="#00b98f" fontSize="38" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">Fi</text>
          </svg>
        );

      case 'cash':
        return (
          <div className="w-full h-full flex items-center justify-center bg-emerald-600 rounded-2xl">
            <Banknote className={`${iconSizes[size]} text-white`} />
          </div>
        );

      default:
        return <Building2 className={`${iconSizes[size]} text-white`} />;
    }
  };

  return (
    <div
      className={`rounded-2xl flex items-center justify-center shrink-0 shadow-md border border-white/20 overflow-hidden transition-all ${sizeClasses[size]} ${className}`}
      style={bgStyle}
      title={bank?.name || bankName || accountName || 'Account'}
    >
      {renderLogoContent()}
    </div>
  );
}
