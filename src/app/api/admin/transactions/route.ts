import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { AdminService } from '../../../../lib/adminService';

export const dynamic = 'force-dynamic';

// GET : Liste des transactions Mobile Money
export async function GET() {
  try {
    const transactions = AdminService.getTransactions();
    return NextResponse.json({ success: true, transactions, total: transactions.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// POST : Validation manuelle ou Création de transaction manuelle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, txId, agencyId, amount, channel, planId, notes } = body;

    if (action === 'validate_manually') {
      if (!txId) {
        return NextResponse.json({ success: false, error: 'txId requis' }, { status: 400 });
      }
      const result = AdminService.validateTransactionManually(txId);
      return NextResponse.json(result);
    }

    if (action === 'create_manual_tx') {
      if (!agencyId || !amount || !planId) {
        return NextResponse.json(
          { success: false, error: 'agencyId, amount et planId sont requis' },
          { status: 400 }
        );
      }
      const result = AdminService.createManualTransaction({
        agencyId,
        channel: channel || 'wave',
        amount: Number(amount),
        planId,
        notes,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
