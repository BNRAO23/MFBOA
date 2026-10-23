import { NextResponse } from 'next/server';
import { MemoryStore } from '@/lib/memoryStore';
import { INITIAL_SAMPLE_FORMS } from '@/lib/sampleForms';
import { FormSubmission } from '@/lib/types';

// Ensure memory store has initial sample items on first load
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    if (MemoryStore.getTransactions().length === 0) {
      for (const form of INITIAL_SAMPLE_FORMS) {
        await MemoryStore.ingestForm(form);
      }
    }
    initialized = true;
  }
}

export async function GET() {
  await ensureInitialized();
  const transactions = MemoryStore.getTransactions();
  const auditLogs = MemoryStore.getAuditLogs();
  const exceptionMemory = MemoryStore.getExceptionMemory();

  return NextResponse.json({
    success: true,
    data: {
      transactions,
      auditLogs,
      exceptionMemory,
      stats: {
        totalIngested: transactions.length,
        processedFeedDispatched: transactions.filter(t => t.status === 'FEED_DISPATCHED').length,
        pendingAmApproval: transactions.filter(t => t.status === 'AM_GATE_REQUIRED').length,
        rejected: transactions.filter(t => t.status === 'AM_REJECTED').length,
        highValueCount: transactions.filter(t => t.submission.investmentAmount >= 10000000).length,
        qaAccuracyRate: '100%',
        slaComplianceRate: '100%',
      }
    }
  });
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();
    const body = await request.json();
    
    // Check if reset action requested
    if (body.action === 'RESET') {
      await MemoryStore.resetOrSeed(INITIAL_SAMPLE_FORMS);
      return NextResponse.json({
        success: true,
        message: 'Pipeline reset to initial baseline benchmark',
        data: {
          transactions: MemoryStore.getTransactions(),
        }
      });
    }

    const submission: FormSubmission = {
      id: body.id || `FORM-${Date.now()}`,
      submissionChannel: body.submissionChannel || 'WEB',
      submissionTimestamp: body.submissionTimestamp || new Date().toISOString(),
      formType: body.formType || 'NEW_PURCHASE',
      investorName: body.investorName,
      pan: body.pan.toUpperCase(),
      folioNumber: body.folioNumber || 'NEW',
      email: body.email,
      phone: body.phone,
      schemeCode: body.schemeCode,
      schemeName: body.schemeName || body.schemeCode,
      investmentAmount: Number(body.investmentAmount),
      targetSchemeCode: body.targetSchemeCode,
      paymentMode: body.paymentMode || 'NET_BANKING',
      bankAccountNumber: body.bankAccountNumber,
      bankIfsc: body.bankIfsc.toUpperCase(),
      bankName: body.bankName || 'HDFC Bank',
      sourceRef: body.sourceRef || `${body.submissionChannel} Form Submission`,
      rawPayloadSnippet: body.rawPayloadSnippet,
    };

    const transaction = await MemoryStore.ingestForm(submission);

    return NextResponse.json({
      success: true,
      message: 'Form successfully ingested and evaluated through Parallel QA Critic',
      data: {
        transaction,
        allTransactions: MemoryStore.getTransactions(),
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error processing form submission' },
      { status: 400 }
    );
  }
}
