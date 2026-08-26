export interface BankDefinition {
  id: string;
  name: string;
  shortName: string;
  keywords: string[];
  primaryColor: string;
  accentColor: string;
  category: 'bank' | 'wallet' | 'cash' | 'neobank';
}

export const POPULAR_BANKS: BankDefinition[] = [
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    shortName: 'HDFC',
    keywords: ['hdfc', 'hdfc bank', 'hdfc salary'],
    primaryColor: '#004c8f',
    accentColor: '#ed1c24',
    category: 'bank'
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    shortName: 'SBI',
    keywords: ['sbi', 'state bank', 'state bank of india'],
    primaryColor: '#280071',
    accentColor: '#00a5ec',
    category: 'bank'
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    keywords: ['icici', 'icici bank', 'icici direct'],
    primaryColor: '#b02a30',
    accentColor: '#f37021',
    category: 'bank'
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    shortName: 'Axis',
    keywords: ['axis', 'axis bank', 'uti'],
    primaryColor: '#97144d',
    accentColor: '#b4195c',
    category: 'bank'
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    shortName: 'Kotak',
    keywords: ['kotak', 'kotak mahindra', 'kotak 811'],
    primaryColor: '#ed1c24',
    accentColor: '#0f3460',
    category: 'bank'
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    shortName: 'PNB',
    keywords: ['pnb', 'punjab national bank'],
    primaryColor: '#a20a3a',
    accentColor: '#fdb813',
    category: 'bank'
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    shortName: 'BoB',
    keywords: ['bob', 'baroda', 'bank of baroda'],
    primaryColor: '#f26522',
    accentColor: '#d64d0c',
    category: 'bank'
  },
  {
    id: 'idfc',
    name: 'IDFC FIRST Bank',
    shortName: 'IDFC FIRST',
    keywords: ['idfc', 'idfc first', 'idfc bank'],
    primaryColor: '#9d1d27',
    accentColor: '#7d151d',
    category: 'bank'
  },
  {
    id: 'indusind',
    name: 'IndusInd Bank',
    shortName: 'IndusInd',
    keywords: ['indusind', 'indus ind'],
    primaryColor: '#880e4f',
    accentColor: '#6a0b3e',
    category: 'bank'
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    shortName: 'Canara',
    keywords: ['canara', 'canara bank', 'syndicate'],
    primaryColor: '#0091df',
    accentColor: '#f39200',
    category: 'bank'
  },
  {
    id: 'union',
    name: 'Union Bank of India',
    shortName: 'Union Bank',
    keywords: ['union bank', 'ubi', 'andhra bank', 'corporation bank'],
    primaryColor: '#00488f',
    accentColor: '#ed1c24',
    category: 'bank'
  },
  {
    id: 'yes',
    name: 'Yes Bank',
    shortName: 'Yes Bank',
    keywords: ['yes bank', 'yes'],
    primaryColor: '#003366',
    accentColor: '#e4002b',
    category: 'bank'
  },
  {
    id: 'paytm',
    name: 'Paytm Payments Bank',
    shortName: 'Paytm',
    keywords: ['paytm', 'paytm wallet', 'paytm payments'],
    primaryColor: '#002e6e',
    accentColor: '#00b9f5',
    category: 'wallet'
  },
  {
    id: 'federal',
    name: 'Federal Bank',
    shortName: 'Federal',
    keywords: ['federal', 'federal bank'],
    primaryColor: '#004b87',
    accentColor: '#f7a800',
    category: 'bank'
  },
  {
    id: 'rbl',
    name: 'RBL Bank',
    shortName: 'RBL',
    keywords: ['rbl', 'ratnakar', 'rbl bank'],
    primaryColor: '#003c71',
    accentColor: '#e31837',
    category: 'bank'
  },
  {
    id: 'jupiter',
    name: 'Jupiter Money',
    shortName: 'Jupiter',
    keywords: ['jupiter', 'jupiter money', 'federal jupiter'],
    primaryColor: '#ff7759',
    accentColor: '#2b2353',
    category: 'neobank'
  },
  {
    id: 'fi',
    name: 'Fi Money',
    shortName: 'Fi',
    keywords: ['fi', 'fi money', 'epifi'],
    primaryColor: '#00b98f',
    accentColor: '#1d2331',
    category: 'neobank'
  },
  {
    id: 'cash',
    name: 'Cash / Physical Wallet',
    shortName: 'Cash',
    keywords: ['cash', 'physical cash', 'pocket cash', 'wallet cash'],
    primaryColor: '#10b981',
    accentColor: '#059669',
    category: 'cash'
  }
];

export function detectBank(
  nameOrBank?: string,
  accountType?: string
): BankDefinition | null {
  if (!nameOrBank && accountType === 'cash') {
    return POPULAR_BANKS.find((b) => b.id === 'cash') || null;
  }
  if (!nameOrBank) return null;

  const normalized = nameOrBank.toLowerCase().trim();

  // 1. Direct keyword match
  for (const bank of POPULAR_BANKS) {
    for (const kw of bank.keywords) {
      if (
        normalized === kw ||
        normalized.startsWith(kw + ' ') ||
        normalized.endsWith(' ' + kw) ||
        normalized.includes(` ${kw} `) ||
        normalized.includes(kw)
      ) {
        return bank;
      }
    }
  }

  // 2. Type based fallback
  if (accountType === 'cash' || normalized.includes('cash')) {
    return POPULAR_BANKS.find((b) => b.id === 'cash') || null;
  }

  return null;
}
