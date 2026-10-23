import { FormSubmission, AMCFeedItem, BankFeedItem, AMApprovalAction } from './types';
import { OracleDatabaseClient } from './oracleDatabase';

export class MutualFundProcessAgent {
  /**
   * Executes settlement processing and feed generation.
   * Adheres to Segregation of Duties (SoD): Process Agent handles execution
   * only after QA Critic has validated and any required AM Approval is logged.
   */
  static async processTransaction(
    form: FormSubmission,
    amApproval?: AMApprovalAction
  ): Promise<{ amcFeed: AMCFeedItem; bankFeed: BankFeedItem }> {
    const scheme = await OracleDatabaseClient.getSchemeByCode(form.schemeCode);
    const rta: 'CAMS' | 'KFINTECH' = scheme?.amc.includes('HDFC') || scheme?.amc.includes('SBI') ? 'CAMS' : 'KFINTECH';
    
    const timestampStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();

    // 1. Generate AMC Feed (RTA Batch Transmission)
    const amcFeed: AMCFeedItem = {
      amcFeedId: `AMC-FEED-${rta}-${timestampStr}-${randomHex}`,
      rtaName: rta,
      amcCode: scheme?.amc || 'MF-AMC',
      folioNumber: form.folioNumber === 'NEW' ? `NEW-${randomHex}` : form.folioNumber,
      pan: form.pan,
      schemeCode: form.schemeCode,
      transType: form.formType,
      amount: form.investmentAmount,
      navAppliedDate: new Date().toISOString().slice(0, 10),
      amApprovalRef: amApproval?.approvalCode,
      status: 'SENT',
    };

    // 2. Generate Bank Feed (Settlement Gateway Transmission)
    const clearingType: 'ACH_DEBIT' | 'RTGS' | 'NEFT' = 
      form.investmentAmount >= 200000 ? 'RTGS' : 'ACH_DEBIT';

    const bankFeed: BankFeedItem = {
      bankFeedId: `BNK-SETTLE-${timestampStr}-${randomHex}`,
      clearingType,
      investorAccount: form.bankAccountNumber,
      investorIfsc: form.bankIfsc,
      amount: form.investmentAmount,
      amcPoolAccount: '99008811223344 (AMC ESCROW A/C)',
      utrOrBatchRef: `UTR${Date.now()}${randomHex}`,
      status: 'SETTLED',
    };

    return { amcFeed, bankFeed };
  }
}
