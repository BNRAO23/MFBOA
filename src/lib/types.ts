export type ChannelType = 'WEB' | 'EMAIL' | 'CHATBOT';

export type FormType = 'NEW_PURCHASE' | 'SWITCH' | 'REDEMPTION';

export type TransactionStatus = 
  | 'INGESTED' 
  | 'VALIDATING' 
  | 'QA_PASSED' 
  | 'AM_GATE_REQUIRED' 
  | 'AM_APPROVED' 
  | 'AM_REJECTED' 
  | 'PROCESSED' 
  | 'FEED_DISPATCHED';

export type GateReason = 'HIGH_VALUE' | 'QA_EXCEPTION' | 'BOTH' | 'NONE';

export interface InvestorProfile {
  pan: string;
  fullName: string;
  dob: string;
  kycStatus: 'OK' | 'EXPIRED' | 'REJECTED' | 'NOT_FOUND';
  aadhaarLinked: boolean;
  pekrnFatcaCompliant: boolean;
  email: string;
  phone: string;
  riskCategory: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

export interface BankMandateRecord {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolder: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  mandateLimit: number;
}

export interface MutualFundScheme {
  code: string;
  name: string;
  amc: string;
  category: 'EQUITY' | 'DEBT' | 'HYBRID' | 'LIQUID';
  cutOffTime: string; // "15:00" for equity/debt, "13:30" for liquid
  minAmount: number;
  latestNav: number;
}

export interface FormSubmission {
  id: string;
  submissionChannel: ChannelType;
  submissionTimestamp: string;
  formType: FormType;
  
  // Investor Info
  investorName: string;
  pan: string;
  folioNumber: string; // "NEW" or existing like "10482914/82"
  email: string;
  phone: string;
  
  // Transaction Info
  schemeCode: string;
  schemeName: string;
  investmentAmount: number; // in INR
  targetSchemeCode?: string; // For switch forms
  paymentMode: 'NET_BANKING' | 'UPI' | 'NEFT_RTGS' | 'NACH_MANDATE';
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  
  // Metadata & Source context
  sourceRef: string; // e.g., "Email Subject: New Lumpsum Form attached", or "Web Session: #W-9284"
  rawPayloadSnippet?: string;
}

export interface QARuleCheck {
  id: string;
  title: string;
  category: 'SEBI_COMPLIANCE' | 'ORACLE_DATA_MATCH' | 'BANK_MANDATE' | 'SCHEME_CUTOFF' | 'VALUE_THRESHOLD';
  status: 'PASSED' | 'FAILED' | 'WARNING';
  details: string;
  evidence: {
    submitted: string;
    oracleVerified: string;
  };
}

export interface QACriticResult {
  passedAllChecks: boolean;
  accuracyScore: number; // e.g. 100%
  checks: QARuleCheck[];
  requiresAmApproval: boolean;
  gateReasons: GateReason[];
  exceptionSummary?: string;
  exceptionCategory?: string;
  timestamp: string;
}

export interface AMApprovalAction {
  action: 'APPROVE' | 'REJECT';
  managerId: string;
  managerName: string;
  timestamp: string;
  remarks: string;
  approvalCode: string;
}

export interface AMCFeedItem {
  amcFeedId: string;
  rtaName: 'CAMS' | 'KFINTECH';
  amcCode: string;
  folioNumber: string;
  pan: string;
  schemeCode: string;
  transType: 'NEW_PURCHASE' | 'ADDITIONAL_PURCHASE' | 'SWITCH' | 'REDEMPTION';
  amount: number;
  navAppliedDate: string;
  amApprovalRef?: string;
  status: 'QUEUED' | 'SENT';
}

export interface BankFeedItem {
  bankFeedId: string;
  clearingType: 'ACH_DEBIT' | 'RTGS' | 'NEFT';
  investorAccount: string;
  investorIfsc: string;
  amount: number;
  amcPoolAccount: string;
  utrOrBatchRef: string;
  status: 'SETTLED' | 'PENDING';
}

export interface ExceptionMemoryRecord {
  id: string;
  category: string;
  mismatchType: string;
  occurrenceCount: number;
  suggestedResolution: string;
  sebiCircularReference?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  traceId: string;
  actor: 'WORKFLOW_AGENT' | 'QA_CRITIC' | 'AM_OPERATIONS' | 'PROCESS_AGENT' | 'SYSTEM';
  action: string;
  details: string;
  maskedPii: string;
  hash: string;
}

export interface MutualFundTransaction {
  id: string;
  traceId: string;
  submission: FormSubmission;
  status: TransactionStatus;
  qaResult?: QACriticResult;
  amApproval?: AMApprovalAction;
  amcFeed?: AMCFeedItem;
  bankFeed?: BankFeedItem;
  history: {
    stage: string;
    timestamp: string;
    note: string;
  }[];
}
