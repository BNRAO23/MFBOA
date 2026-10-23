import { NextResponse } from 'next/server';
import { MemoryStore } from '@/lib/memoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, action, managerName, remarks } = body;

    if (!transactionId || !action || !remarks) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID, Action (APPROVE/REJECT), and Manager Remarks are required' },
        { status: 400 }
      );
    }

    const updatedTx = await MemoryStore.handleAmApproval(
      transactionId,
      action as 'APPROVE' | 'REJECT',
      managerName || 'Bonela Narasinga Rao (AM Operations)',
      remarks
    );

    return NextResponse.json({
      success: true,
      message: `Transaction ${transactionId} ${action === 'APPROVE' ? 'approved' : 'rejected'} by Assistant Manager Operations`,
      data: {
        transaction: updatedTx,
        allTransactions: MemoryStore.getTransactions(),
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error executing AM approval' },
      { status: 400 }
    );
  }
}
