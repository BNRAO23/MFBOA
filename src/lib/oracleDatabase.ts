import { InvestorProfile, BankMandateRecord, MutualFundScheme } from './types';

// Oracle Master Database Tables (Ground Truth)
export const ORACLE_INVESTORS: Record<string, InvestorProfile> = {
  'ABCDE1234F': {
    pan: 'ABCDE1234F',
    fullName: 'Bonela Narasinga Rao',
    dob: '1988-06-14',
    kycStatus: 'OK',
    aadhaarLinked: true,
    pekrnFatcaCompliant: true,
    email: 'narsing.rao@gmail.com',
    phone: '+91 98480 12345',
    riskCategory: 'AGGRESSIVE',
  },
  'BKAPM9821L': {
    pan: 'BKAPM9821L',
    fullName: 'Priya Sundaram',
    dob: '1992-11-20',
    kycStatus: 'OK',
    aadhaarLinked: true,
    pekrnFatcaCompliant: true,
    email: 'priya.sundaram@fintech.in',
    phone: '+91 97112 54321',
    riskCategory: 'MODERATE',
  },
  'CKLPR4412Q': {
    pan: 'CKLPR4412Q',
    fullName: 'Vikramaditya Singhania',
    dob: '1975-03-08',
    kycStatus: 'OK',
    aadhaarLinked: true,
    pekrnFatcaCompliant: true,
    email: 'v.singhania@corpventures.com',
    phone: '+91 99001 88888',
    riskCategory: 'AGGRESSIVE',
  },
  'DJMNT5590K': {
    pan: 'DJMNT5590K',
    fullName: 'Ananya Deshmukh',
    dob: '1995-09-12',
    kycStatus: 'EXPIRED', // SEBI KYC Re-validation pending
    aadhaarLinked: false,
    pekrnFatcaCompliant: true,
    email: 'ananya.deshmukh@gmail.com',
    phone: '+91 98220 33445',
    riskCategory: 'CONSERVATIVE',
  },
  'EOPTR7731M': {
    pan: 'EOPTR7731M',
    fullName: 'Rajesh Kumar Verma',
    dob: '1981-01-25',
    kycStatus: 'OK',
    aadhaarLinked: true,
    pekrnFatcaCompliant: false, // FATCA Missing
    email: 'rajesh.verma@enterprise.org',
    phone: '+91 98100 99221',
    riskCategory: 'MODERATE',
  },
  'FGHLK3329P': {
    pan: 'FGHLK3329P',
    fullName: 'Meenakshi Iyer',
    dob: '1990-07-30',
    kycStatus: 'OK',
    aadhaarLinked: true,
    pekrnFatcaCompliant: true,
    email: 'meenakshi.iyer@tcs.com',
    phone: '+91 94440 66778',
    riskCategory: 'MODERATE',
  }
};

export const ORACLE_BANK_MANDATES: Record<string, BankMandateRecord> = {
  '912010045678912': {
    accountNumber: '912010045678912',
    ifsc: 'UTIB0000045',
    bankName: 'Axis Bank',
    accountHolder: 'Bonela Narasinga Rao',
    status: 'ACTIVE',
    mandateLimit: 50000000, // 5 Cr limit
  },
  '000401552391': {
    accountNumber: '000401552391',
    ifsc: 'HDFC0000060',
    bankName: 'HDFC Bank',
    accountHolder: 'Priya Sundaram',
    status: 'ACTIVE',
    mandateLimit: 10000000, // 1 Cr limit
  },
  '50100298412763': {
    accountNumber: '50100298412763',
    ifsc: 'ICIC0000004',
    bankName: 'ICICI Bank',
    accountHolder: 'Vikramaditya Singhania',
    status: 'ACTIVE',
    mandateLimit: 250000000, // 25 Cr limit
  },
  '62110984512': {
    accountNumber: '62110984512',
    ifsc: 'SBIN0000691',
    bankName: 'State Bank of India',
    accountHolder: 'Ananya Deshmukh',
    status: 'ACTIVE',
    mandateLimit: 500000,
  },
  '102938475612': {
    accountNumber: '102938475612',
    ifsc: 'KKBK0000180',
    bankName: 'Kotak Mahindra Bank',
    accountHolder: 'Rajesh Kumar Verma',
    status: 'INACTIVE', // Inactive mandate triggers exception!
    mandateLimit: 2000000,
  },
  '334455667788': {
    accountNumber: '334455667788',
    ifsc: 'HDFC0000060',
    bankName: 'HDFC Bank',
    accountHolder: 'Meenakshi Iyer',
    status: 'ACTIVE',
    mandateLimit: 15000000,
  }
};

export const ORACLE_SCHEMES: MutualFundScheme[] = [
  {
    code: 'PPFAS-FC-DIR',
    name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
    amc: 'PPFAS Mutual Fund',
    category: 'EQUITY',
    cutOffTime: '15:00',
    minAmount: 1000,
    latestNav: 84.62
  },
  {
    code: 'HDFC-TOP100-DIR',
    name: 'HDFC Top 100 Fund - Direct Plan - Growth',
    amc: 'HDFC Mutual Fund',
    category: 'EQUITY',
    cutOffTime: '15:00',
    minAmount: 500,
    latestNav: 1142.35
  },
  {
    code: 'SBI-BC-DIR',
    name: 'SBI Bluechip Fund - Direct Plan - Growth',
    amc: 'SBI Mutual Fund',
    category: 'EQUITY',
    cutOffTime: '15:00',
    minAmount: 5000,
    latestNav: 98.41
  },
  {
    code: 'ICICI-LIQ-DIR',
    name: 'ICICI Prudential Liquid Fund - Direct Plan - Growth',
    amc: 'ICICI Prudential MF',
    category: 'LIQUID',
    cutOffTime: '13:30', // Liquid fund 1:30 PM cutoff as per SEBI
    minAmount: 500,
    latestNav: 382.19
  },
  {
    code: 'NIPPON-SM-DIR',
    name: 'Nippon India Small Cap Fund - Direct Plan - Growth',
    amc: 'Nippon India MF',
    category: 'EQUITY',
    cutOffTime: '15:00',
    minAmount: 5000,
    latestNav: 165.73
  },
  {
    code: 'AXIS-HYB-DIR',
    name: 'Axis Balanced Advantage Fund - Direct Plan - Growth',
    amc: 'Axis Mutual Fund',
    category: 'HYBRID',
    cutOffTime: '15:00',
    minAmount: 500,
    latestNav: 64.12
  }
];

export const ORACLE_FOLIOS: Record<string, { folioNumber: string; pan: string; amc: string }> = {
  '10482914/82': { folioNumber: '10482914/82', pan: 'ABCDE1234F', amc: 'PPFAS Mutual Fund' },
  '88219430/19': { folioNumber: '88219430/19', pan: 'BKAPM9821L', amc: 'HDFC Mutual Fund' },
  '99401287/01': { folioNumber: '99401287/01', pan: 'CKLPR4412Q', amc: 'SBI Mutual Fund' },
  '77102944/55': { folioNumber: '77102944/55', pan: 'FGHLK3329P', amc: 'ICICI Prudential MF' }
};

// Simulated Oracle DB Gateway with latency and logging
export class OracleDatabaseClient {
  static async getInvestorByPan(pan: string): Promise<InvestorProfile | null> {
    const cleanPan = pan.trim().toUpperCase();
    return ORACLE_INVESTORS[cleanPan] || null;
  }

  static async getBankMandate(accountNumber: string): Promise<BankMandateRecord | null> {
    const cleanAcc = accountNumber.trim();
    return ORACLE_BANK_MANDATES[cleanAcc] || null;
  }

  static async getSchemeByCode(schemeCode: string): Promise<MutualFundScheme | null> {
    return ORACLE_SCHEMES.find(s => s.code.toLowerCase() === schemeCode.trim().toLowerCase()) || null;
  }

  static async verifyFolio(folioNumber: string, pan: string): Promise<boolean> {
    const cleanFolio = folioNumber.trim();
    const cleanPan = pan.trim().toUpperCase();
    const record = ORACLE_FOLIOS[cleanFolio];
    if (!record) return false;
    return record.pan === cleanPan;
  }
}
