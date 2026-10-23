import { NextResponse } from 'next/server';
import { MemoryStore } from '@/lib/memoryStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';
  const type = searchParams.get('type') || 'all'; // 'amc', 'bank', or 'all'

  const transactions = MemoryStore.getTransactions();
  const processedWithFeeds = transactions.filter(t => t.amcFeed && t.bankFeed);

  const amcFeeds = processedWithFeeds.map(t => t.amcFeed!);
  const bankFeeds = processedWithFeeds.map(t => t.bankFeed!);

  if (format === 'csv') {
    if (type === 'amc') {
      const headers = ['AMC_FEED_ID', 'RTA', 'AMC_CODE', 'FOLIO_NO', 'INVESTOR_PAN', 'SCHEME_CODE', 'TRANS_TYPE', 'AMOUNT_INR', 'NAV_DATE', 'AM_APPROVAL_REF', 'STATUS'];
      const rows = amcFeeds.map(f => [
        f.amcFeedId,
        f.rtaName,
        `"${f.amcCode}"`,
        f.folioNumber,
        f.pan,
        f.schemeCode,
        f.transType,
        f.amount,
        f.navAppliedDate,
        f.amApprovalRef || 'STP_AUTO',
        f.status,
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="AMC_RTA_FEED_BATCH_${Date.now()}.csv"`,
        },
      });
    }

    if (type === 'bank') {
      const headers = ['BANK_FEED_ID', 'CLEARING_TYPE', 'DEBIT_ACCOUNT', 'IFSC', 'AMOUNT_INR', 'CREDIT_POOL_ACC', 'UTR_BATCH_REF', 'SETTLEMENT_STATUS'];
      const rows = bankFeeds.map(b => [
        b.bankFeedId,
        b.clearingType,
        b.investorAccount,
        b.investorIfsc,
        b.amount,
        `"${b.amcPoolAccount}"`,
        b.utrOrBatchRef,
        b.status,
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="BANK_SETTLEMENT_BATCH_${Date.now()}.csv"`,
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      totalDispatchedFeeds: processedWithFeeds.length,
      amcFeeds,
      bankFeeds,
    }
  });
}
