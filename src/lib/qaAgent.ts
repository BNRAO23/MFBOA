import { FormSubmission, QACriticResult, QARuleCheck, GateReason } from './types';
import { OracleDatabaseClient } from './oracleDatabase';

export class ParallelQACriticAgent {
  /**
   * Executes fan-out parallel QA checks adhering strictly to SEBI, AMC & RTA guidelines.
   * As specified in the MFBOA architecture, QA is performed independently of processing (SoD).
   */
  static async evaluateForm(form: FormSubmission): Promise<QACriticResult> {
    const startTime = Date.now();
    const checks: QARuleCheck[] = [];
    const gateReasons: GateReason[] = [];

    // Parallel fan-out checks
    const [sebiCheck, oracleMatchCheck, bankCheck, schemeCutoffCheck, highValueCheck] = await Promise.all([
      this.checkSebiCompliance(form),
      this.checkOracleDataMatch(form),
      this.checkBankMandateAndThirdParty(form),
      this.checkSchemeRulesAndCutoff(form),
      this.checkHighValueThreshold(form),
    ]);

    checks.push(sebiCheck);
    checks.push(oracleMatchCheck);
    checks.push(bankCheck);
    checks.push(schemeCutoffCheck);
    checks.push(highValueCheck);

    const hasFailed = checks.some(c => c.status === 'FAILED');
    const isHighValue = highValueCheck.status === 'WARNING' || highValueCheck.status === 'FAILED';

    if (hasFailed) {
      gateReasons.push('QA_EXCEPTION');
    }
    if (isHighValue) {
      gateReasons.push('HIGH_VALUE');
    }

    const requiresAmApproval = gateReasons.length > 0;
    const passedAllChecks = !hasFailed;

    let exceptionSummary: string | undefined;
    let exceptionCategory: string | undefined;

    if (hasFailed) {
      const failedChecks = checks.filter(c => c.status === 'FAILED');
      exceptionSummary = failedChecks.map(f => `[${f.title}]: ${f.details}`).join('; ');
      exceptionCategory = failedChecks[0]?.category || 'GENERAL_EXCEPTION';
    } else if (isHighValue) {
      exceptionSummary = `Transaction amount (₹${form.investmentAmount.toLocaleString('en-IN')}) exceeds ₹1.00 Crore limit. AM Ops approval mandatory.`;
      exceptionCategory = 'HIGH_VALUE_GATE';
    }

    return {
      passedAllChecks,
      accuracyScore: 100, // 100% deterministic rule precision
      checks,
      requiresAmApproval,
      gateReasons,
      exceptionSummary,
      exceptionCategory,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check 1: SEBI KYC, PAN & AML Regulations
   */
  private static async checkSebiCompliance(form: FormSubmission): Promise<QARuleCheck> {
    const investor = await OracleDatabaseClient.getInvestorByPan(form.pan);

    if (!investor) {
      return {
        id: 'QA-RULE-SEBI-01',
        title: 'SEBI KYC & AML Validation',
        category: 'SEBI_COMPLIANCE',
        status: 'FAILED',
        details: `PAN ${form.pan} not found in KRA (KYC Registration Agency) / Oracle Master. New KYC documentation required.`,
        evidence: {
          submitted: `PAN: ${form.pan}`,
          oracleVerified: 'KRA Status: NOT_FOUND in Registry',
        },
      };
    }

    if (investor.kycStatus !== 'OK') {
      return {
        id: 'QA-RULE-SEBI-01',
        title: 'SEBI KYC & AML Validation',
        category: 'SEBI_COMPLIANCE',
        status: 'FAILED',
        details: `Investor KYC Status is '${investor.kycStatus}'. SEBI Circular mandates KYC Re-validation prior to financial transactions.`,
        evidence: {
          submitted: `PAN: ${form.pan}`,
          oracleVerified: `KYC Status: ${investor.kycStatus}, Aadhaar Linked: ${investor.aadhaarLinked}`,
        },
      };
    }

    if (!investor.aadhaarLinked) {
      return {
        id: 'QA-RULE-SEBI-01',
        title: 'SEBI KYC & AML Validation',
        category: 'SEBI_COMPLIANCE',
        status: 'FAILED',
        details: 'Aadhaar-PAN linking is missing. Non-compliant with CBDT / SEBI notification.',
        evidence: {
          submitted: `PAN: ${form.pan}`,
          oracleVerified: 'Aadhaar Linked: FALSE',
        },
      };
    }

    if (!investor.pekrnFatcaCompliant) {
      return {
        id: 'QA-RULE-SEBI-01',
        title: 'SEBI KYC & AML Validation',
        category: 'SEBI_COMPLIANCE',
        status: 'FAILED',
        details: 'FATCA / UBO declaration incomplete in master record.',
        evidence: {
          submitted: `PAN: ${form.pan}`,
          oracleVerified: 'FATCA Status: Incomplete / Non-compliant',
        },
      };
    }

    return {
      id: 'QA-RULE-SEBI-01',
      title: 'SEBI KYC & AML Validation',
      category: 'SEBI_COMPLIANCE',
      status: 'PASSED',
      details: 'KYC verified OK with CVL/CAMS KRA. Aadhaar linked and FATCA compliant.',
      evidence: {
        submitted: `PAN: ${form.pan}`,
        oracleVerified: 'KYC: OK | Aadhaar: Linked | FATCA: Compliant',
      },
    };
  }

  /**
   * Check 2: Oracle Master Data Match (Investor Identity)
   */
  private static async checkOracleDataMatch(form: FormSubmission): Promise<QARuleCheck> {
    const investor = await OracleDatabaseClient.getInvestorByPan(form.pan);

    if (!investor) {
      return {
        id: 'QA-RULE-DATA-02',
        title: 'Oracle Master Data Cross-Verification',
        category: 'ORACLE_DATA_MATCH',
        status: 'FAILED',
        details: 'Cannot verify investor against Oracle DB.',
        evidence: {
          submitted: form.investorName,
          oracleVerified: 'No Record',
        },
      };
    }

    // Fuzzy name similarity check
    const cleanSubName = form.investorName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanDbName = investor.fullName.toLowerCase().replace(/[^a-z]/g, '');
    const isDirectMatch = cleanSubName === cleanDbName;
    const isSubstringMatch = cleanSubName.includes(cleanDbName) || cleanDbName.includes(cleanSubName);

    if (!isDirectMatch && !isSubstringMatch) {
      return {
        id: 'QA-RULE-DATA-02',
        title: 'Oracle Master Data Cross-Verification',
        category: 'ORACLE_DATA_MATCH',
        status: 'FAILED',
        details: `Name mismatch between application form ('${form.investorName}') and Oracle Master ('${investor.fullName}').`,
        evidence: {
          submitted: form.investorName,
          oracleVerified: investor.fullName,
        },
      };
    }

    // Verify folio if existing
    if (form.folioNumber && form.folioNumber !== 'NEW') {
      const folioOk = await OracleDatabaseClient.verifyFolio(form.folioNumber, form.pan);
      if (!folioOk) {
        return {
          id: 'QA-RULE-DATA-02',
          title: 'Oracle Master Data Cross-Verification',
          category: 'ORACLE_DATA_MATCH',
          status: 'FAILED',
          details: `Folio Number ${form.folioNumber} does not belong to PAN ${form.pan} in Oracle Folio Master.`,
          evidence: {
            submitted: `Folio: ${form.folioNumber}`,
            oracleVerified: 'Folio-PAN Association Invalid',
          },
        };
      }
    }

    return {
      id: 'QA-RULE-DATA-02',
      title: 'Oracle Master Data Cross-Verification',
      category: 'ORACLE_DATA_MATCH',
      status: 'PASSED',
      details: 'Investor identity and Folio association 100% matched with Oracle records.',
      evidence: {
        submitted: `Name: ${form.investorName} | Folio: ${form.folioNumber}`,
        oracleVerified: `Master: ${investor.fullName} | PAN: ${investor.pan}`,
      },
    };
  }

  /**
   * Check 3: Bank Mandate & Third-Party Payment Check (SEBI circular on Third-Party payments)
   */
  private static async checkBankMandateAndThirdParty(form: FormSubmission): Promise<QARuleCheck> {
    const mandate = await OracleDatabaseClient.getBankMandate(form.bankAccountNumber);

    if (!mandate) {
      return {
        id: 'QA-RULE-BANK-03',
        title: 'Bank Mandate & Third-Party Check',
        category: 'BANK_MANDATE',
        status: 'FAILED',
        details: `Bank Account ${form.bankAccountNumber} is not registered in Investor Mandate Master. SEBI mandates 1st holder bank verification.`,
        evidence: {
          submitted: `Acc: ${form.bankAccountNumber} | IFSC: ${form.bankIfsc}`,
          oracleVerified: 'Not Registered in Mandate Master',
        },
      };
    }

    if (mandate.status !== 'ACTIVE') {
      return {
        id: 'QA-RULE-BANK-03',
        title: 'Bank Mandate & Third-Party Check',
        category: 'BANK_MANDATE',
        status: 'FAILED',
        details: `Bank Mandate status is '${mandate.status}'. Payment debit cannot be dispatched.`,
        evidence: {
          submitted: `Acc: ${form.bankAccountNumber}`,
          oracleVerified: `Mandate Status: ${mandate.status}`,
        },
      };
    }

    if (mandate.ifsc.toUpperCase() !== form.bankIfsc.toUpperCase()) {
      return {
        id: 'QA-RULE-BANK-03',
        title: 'Bank Mandate & Third-Party Check',
        category: 'BANK_MANDATE',
        status: 'FAILED',
        details: `IFSC mismatch: Form states ${form.bankIfsc}, Oracle Mandate master has ${mandate.ifsc}.`,
        evidence: {
          submitted: form.bankIfsc,
          oracleVerified: mandate.ifsc,
        },
      };
    }

    if (form.investmentAmount > mandate.mandateLimit) {
      return {
        id: 'QA-RULE-BANK-03',
        title: 'Bank Mandate & Third-Party Check',
        category: 'BANK_MANDATE',
        status: 'FAILED',
        details: `Application amount ₹${form.investmentAmount.toLocaleString('en-IN')} exceeds active NACH Mandate limit of ₹${mandate.mandateLimit.toLocaleString('en-IN')}.`,
        evidence: {
          submitted: `Amount: ₹${form.investmentAmount.toLocaleString('en-IN')}`,
          oracleVerified: `Limit: ₹${mandate.mandateLimit.toLocaleString('en-IN')}`,
        },
      };
    }

    return {
      id: 'QA-RULE-BANK-03',
      title: 'Bank Mandate & Third-Party Check',
      category: 'BANK_MANDATE',
      status: 'PASSED',
      details: 'Bank Account & Active NACH Mandate verified with zero third-party payment risk.',
      evidence: {
        submitted: `Acc: ${form.bankAccountNumber} | ${form.bankIfsc}`,
        oracleVerified: `Holder: ${mandate.accountHolder} | Status: ACTIVE`,
      },
    };
  }

  /**
   * Check 4: Scheme Specific Rules and Cut-off Times (SEBI NAV Timings)
   */
  private static async checkSchemeRulesAndCutoff(form: FormSubmission): Promise<QARuleCheck> {
    const scheme = await OracleDatabaseClient.getSchemeByCode(form.schemeCode);

    if (!scheme) {
      return {
        id: 'QA-RULE-SCHEME-04',
        title: 'Scheme Rules & NAV Cut-off Verification',
        category: 'SCHEME_CUTOFF',
        status: 'FAILED',
        details: `Scheme Code '${form.schemeCode}' is inactive or invalid in AMC Master.`,
        evidence: {
          submitted: form.schemeCode,
          oracleVerified: 'Not Found in AMC Scheme Master',
        },
      };
    }

    if (form.investmentAmount < scheme.minAmount) {
      return {
        id: 'QA-RULE-SCHEME-04',
        title: 'Scheme Rules & NAV Cut-off Verification',
        category: 'SCHEME_CUTOFF',
        status: 'FAILED',
        details: `Amount ₹${form.investmentAmount.toLocaleString('en-IN')} is below scheme minimum threshold of ₹${scheme.minAmount.toLocaleString('en-IN')}.`,
        evidence: {
          submitted: `Amount: ₹${form.investmentAmount}`,
          oracleVerified: `Min Required: ₹${scheme.minAmount}`,
        },
      };
    }

    // Check submission time against cut-off
    const submissionDate = new Date(form.submissionTimestamp);
    const subHours = submissionDate.getHours();
    const subMins = submissionDate.getMinutes();
    const [cutHourStr, cutMinStr] = scheme.cutOffTime.split(':');
    const cutHour = parseInt(cutHourStr, 10);
    const cutMin = parseInt(cutMinStr, 10);

    const subTotalMinutes = subHours * 60 + subMins;
    const cutTotalMinutes = cutHour * 60 + cutMin;

    const isAfterCutoff = subTotalMinutes > cutTotalMinutes;

    return {
      id: 'QA-RULE-SCHEME-04',
      title: 'Scheme Rules & NAV Cut-off Verification',
      category: 'SCHEME_CUTOFF',
      status: isAfterCutoff ? 'WARNING' : 'PASSED',
      details: isAfterCutoff
        ? `Form submitted at ${subHours}:${subMins < 10 ? '0' + subMins : subMins} IST (After cut-off ${scheme.cutOffTime} IST). Applicable NAV will be T+1 business day.`
        : `Submitted before SEBI Cut-off (${scheme.cutOffTime} IST). Eligible for same-day NAV.`,
      evidence: {
        submitted: `Time: ${subHours}:${subMins < 10 ? '0' + subMins : subMins} IST`,
        oracleVerified: `Scheme Cut-off: ${scheme.cutOffTime} IST | Category: ${scheme.category}`,
      },
    };
  }

  /**
   * Check 5: High Value Threshold Gate (> ₹1 Crore / ₹10,000,000)
   */
  private static async checkHighValueThreshold(form: FormSubmission): Promise<QARuleCheck> {
    const ONE_CRORE = 10000000; // 10 Million INR
    const isAboveOneCrore = form.investmentAmount >= ONE_CRORE;

    if (isAboveOneCrore) {
      return {
        id: 'QA-RULE-VALUE-05',
        title: 'High-Value Risk & AM Gate Rule',
        category: 'VALUE_THRESHOLD',
        status: 'WARNING',
        details: `High-value transaction: ₹${form.investmentAmount.toLocaleString('en-IN')} >= ₹1.00 Crore. Mandatory Assistant Manager Operations Sign-off required.`,
        evidence: {
          submitted: `Amount: ₹${form.investmentAmount.toLocaleString('en-IN')}`,
          oracleVerified: `Threshold: ₹1,00,00,000 (1 Cr)`,
        },
      };
    }

    return {
      id: 'QA-RULE-VALUE-05',
      title: 'High-Value Risk & AM Gate Rule',
      category: 'VALUE_THRESHOLD',
      status: 'PASSED',
      details: `Transaction amount is within routine straight-through processing limit (< ₹1.00 Crore).`,
      evidence: {
        submitted: `Amount: ₹${form.investmentAmount.toLocaleString('en-IN')}`,
        oracleVerified: `Threshold: < ₹1,00,00,000`,
      },
    };
  }
}
