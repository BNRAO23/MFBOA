import { MutualFundTransaction, ExceptionMemoryRecord, AuditLogEntry, FormSubmission } from './types';
import { ParallelQACriticAgent } from './qaAgent';
import { MutualFundProcessAgent } from './processAgent';

// Long-Term Exception Memory Store (Pre-populated with historical resolutions)
export const EXCEPTION_MEMORY_KNOWLEDGE_BASE: ExceptionMemoryRecord[] = [
  {
    id: 'MEM-EXP-001',
    category: 'ORACLE_DATA_MATCH',
    mismatchType: 'Minor Name Salutation Discrepancy (e.g. Dr./Sri vs Master Record)',
    occurrenceCount: 142,
    suggestedResolution: 'AM may approve if PAN (10-digit alphanumeric) and Date of Birth match 100% with Income Tax / KRA database.',
    sebiCircularReference: 'SEBI/HO/IMD/DF3/CIR/P/2019/166',
  },
  {
    id: 'MEM-EXP-002',
    category: 'SCHEME_CUTOFF',
    mismatchType: 'Network Latency timestamp within 5 minutes past 15:00 IST',
    occurrenceCount: 89,
    suggestedResolution: 'Accept for Next Business Day (T+1) NAV allotment automatically, notify investor via email/SMS.',
    sebiCircularReference: 'SEBI Master Circular for Mutual Funds, Chapter 8',
  },
  {
    id: 'MEM-EXP-003',
    category: 'VALUE_THRESHOLD',
    mismatchType: 'High Value Single Ticket >= ₹1.00 Crore',
    occurrenceCount: 312,
    suggestedResolution: 'Verify Source of Funds declaration, check RTGS credit confirmation from Escrow Bank, obtain dual sign-off from AM Ops.',
    sebiCircularReference: 'SEBI/HO/MIRSD/DOS3/CIR/P/2018/115 (PMLA Guidelines)',
  },
  {
    id: 'MEM-EXP-004',
    category: 'BANK_MANDATE',
    mismatchType: 'Bank Mandate Inactive or Expired',
    occurrenceCount: 64,
    suggestedResolution: 'Mandatory Rejection for Auto-debit. Direct investor to execute via NetBanking / UPI instant payment gateway.',
    sebiCircularReference: 'NPCI NACH Circular 2021/44',
  },
  {
    id: 'MEM-EXP-005',
    category: 'SEBI_COMPLIANCE',
    mismatchType: 'KYC Expired / Re-validation Pending (SEBI 2024 New Rule)',
    occurrenceCount: 205,
    suggestedResolution: 'Block transaction until Aadhaar-based DigiLocker e-KYC is submitted. Send one-click KYC update link.',
    sebiCircularReference: 'SEBI Circular SEBI/HO/MIRSD/FATF/P/CIR/2024/29',
  },
];

// Helper to compute sha256 mock hash for audit logging
function generateAuditHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(16, '0');
}

// In-Memory Global State (persisted across API calls in runtime)
let transactions: MutualFundTransaction[] = [];
let auditLogs: AuditLogEntry[] = [];
let exceptionMemory: ExceptionMemoryRecord[] = [...EXCEPTION_MEMORY_KNOWLEDGE_BASE];

export class MemoryStore {
  static getTransactions(): MutualFundTransaction[] {
    return transactions;
  }

  static getTransactionById(id: string): MutualFundTransaction | undefined {
    return transactions.find(t => t.id === id);
  }

  static getAuditLogs(): AuditLogEntry[] {
    return auditLogs;
  }

  static getExceptionMemory(): ExceptionMemoryRecord[] {
    return exceptionMemory;
  }

  static addAuditLog(actor: AuditLogEntry['actor'], action: string, details: string, traceId: string, maskedPii: string): void {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      traceId,
      actor,
      action,
      details,
      maskedPii,
      hash: generateAuditHash(`${Date.now()}-${actor}-${action}-${traceId}`),
    };
    auditLogs.unshift(entry);
    if (auditLogs.length > 500) auditLogs.pop();
  }

  /**
   * Ingest and execute the deterministic single workflow agent pipeline:
   * 1. Ingest form
   * 2. Log in Short-Term Memory
   * 3. Fan-out to Parallel QA Critic Agent
   * 4. Check if AM Gate required (>1Cr or QA Exception)
   * 5. If Clean & <= 1Cr -> Auto-process via Process Agent (SoD)
   * 6. Return populated transaction state
   */
  static async ingestForm(submission: FormSubmission): Promise<MutualFundTransaction> {
    const traceId = `TRC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const txId = `TX-${Date.now().toString(36).toUpperCase()}`;

    const maskedPan = submission.pan.replace(/^(.{2})(.*)(.{2})$/, '$1******$3');
    const maskedAcc = submission.bankAccountNumber.slice(-4).padStart(submission.bankAccountNumber.length, '*');

    this.addAuditLog(
      'WORKFLOW_AGENT',
      `FORM_INGESTED_${submission.submissionChannel}`,
      `Ingested ${submission.formType} form for scheme ${submission.schemeCode}, Amount: ₹${submission.investmentAmount.toLocaleString('en-IN')}`,
      traceId,
      `PAN: ${maskedPan} | A/C: ${maskedAcc}`
    );

    const transaction: MutualFundTransaction = {
      id: txId,
      traceId,
      submission,
      status: 'VALIDATING',
      history: [
        {
          stage: 'INGESTED',
          timestamp: new Date().toISOString(),
          note: `Received form via ${submission.submissionChannel} (${submission.sourceRef})`,
        },
      ],
    };

    // Parallel QA Critic fan out
    const qaResult = await ParallelQACriticAgent.evaluateForm(submission);
    transaction.qaResult = qaResult;

    this.addAuditLog(
      'QA_CRITIC',
      qaResult.passedAllChecks ? 'QA_CHECKS_PASSED' : 'QA_CHECKS_EXCEPTION_FLAGGED',
      `Parallel QA checks evaluated: 5 rules analyzed. Result: ${qaResult.passedAllChecks ? 'ALL PASSED' : 'EXCEPTIONS FOUND'}. Requires AM: ${qaResult.requiresAmApproval}`,
      traceId,
      `PAN: ${maskedPan}`
    );

    if (qaResult.requiresAmApproval) {
      transaction.status = 'AM_GATE_REQUIRED';
      transaction.history.push({
        stage: 'AM_GATE_REQUIRED',
        timestamp: new Date().toISOString(),
        note: `Escalated to Assistant Manager Operations. Reasons: ${qaResult.gateReasons.join(', ')}. ${qaResult.exceptionSummary || ''}`,
      });
    } else {
      // Routine straight-through processing via Process Agent (Segregation of Duties)
      transaction.status = 'QA_PASSED';
      transaction.history.push({
        stage: 'QA_PASSED',
        timestamp: new Date().toISOString(),
        note: 'All parallel compliance, Oracle DB, and Bank checks passed with 100% accuracy.',
      });

      const { amcFeed, bankFeed } = await MutualFundProcessAgent.processTransaction(submission);
      transaction.amcFeed = amcFeed;
      transaction.bankFeed = bankFeed;
      transaction.status = 'FEED_DISPATCHED';

      transaction.history.push({
        stage: 'PROCESSED',
        timestamp: new Date().toISOString(),
        note: `Process Agent generated AMC Feed (${amcFeed.rtaName}) and Bank Settlement Feed (${bankFeed.clearingType})`,
      });

      this.addAuditLog(
        'PROCESS_AGENT',
        'FEEDS_DISPATCHED',
        `Generated AMC Feed [${amcFeed.amcFeedId}] and Bank Feed [${bankFeed.bankFeedId}]`,
        traceId,
        `PAN: ${maskedPan} | AMC: ${amcFeed.amcCode}`
      );
    }

    transactions.unshift(transaction);
    return transaction;
  }

  /**
   * Assistant Manager Operations Gate Action (Approve or Reject)
   */
  static async handleAmApproval(
    transactionId: string,
    action: 'APPROVE' | 'REJECT',
    managerName: string,
    remarks: string
  ): Promise<MutualFundTransaction> {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) throw new Error(`Transaction ${transactionId} not found`);

    if (tx.status !== 'AM_GATE_REQUIRED') {
      throw new Error(`Transaction ${transactionId} is not awaiting AM approval (Current status: ${tx.status})`);
    }

    const approvalCode = `AM-AUTH-${Date.now().toString(36).toUpperCase()}`;
    tx.amApproval = {
      action,
      managerId: 'AM-OPS-4091',
      managerName: managerName || 'Bonela Narasinga Rao (AM Operations)',
      timestamp: new Date().toISOString(),
      remarks,
      approvalCode,
    };

    const maskedPan = tx.submission.pan.replace(/^(.{2})(.*)(.{2})$/, '$1******$3');

    if (action === 'APPROVE') {
      tx.status = 'AM_APPROVED';
      tx.history.push({
        stage: 'AM_APPROVED',
        timestamp: new Date().toISOString(),
        note: `Approved by AM Ops ${managerName}. Remarks: "${remarks}". Auth code: ${approvalCode}`,
      });

      this.addAuditLog(
        'AM_OPERATIONS',
        'AM_GATE_OVERRIDE_APPROVED',
        `AM Operations authorized transaction. AuthCode: ${approvalCode}. Remarks: ${remarks}`,
        tx.traceId,
        `PAN: ${maskedPan}`
      );

      // Now hand over to Process Agent for settlement feed generation
      const { amcFeed, bankFeed } = await MutualFundProcessAgent.processTransaction(tx.submission, tx.amApproval);
      tx.amcFeed = amcFeed;
      tx.bankFeed = bankFeed;
      tx.status = 'FEED_DISPATCHED';

      tx.history.push({
        stage: 'PROCESSED',
        timestamp: new Date().toISOString(),
        note: `Process Agent generated AMC Feed (${amcFeed.rtaName}) and Bank Settlement Feed (${bankFeed.clearingType}) following AM sign-off.`,
      });

      this.addAuditLog(
        'PROCESS_AGENT',
        'FEEDS_DISPATCHED_POST_AM_APPROVAL',
        `Dispatched feeds after AM sign-off. AMC: ${amcFeed.amcFeedId}, Bank: ${bankFeed.bankFeedId}`,
        tx.traceId,
        `PAN: ${maskedPan}`
      );
    } else {
      tx.status = 'AM_REJECTED';
      tx.history.push({
        stage: 'AM_REJECTED',
        timestamp: new Date().toISOString(),
        note: `Rejected by AM Ops ${managerName}. Reason: "${remarks}". Transaction terminated.`,
      });

      this.addAuditLog(
        'AM_OPERATIONS',
        'AM_GATE_REJECTED',
        `AM Operations rejected transaction. Reason: ${remarks}`,
        tx.traceId,
        `PAN: ${maskedPan}`
      );
    }

    return tx;
  }

  static async resetOrSeed(initialForms: FormSubmission[]): Promise<void> {
    transactions = [];
    auditLogs = [];
    for (const form of initialForms) {
      await this.ingestForm(form);
    }
  }
}
