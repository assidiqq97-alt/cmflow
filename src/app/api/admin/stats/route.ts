import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { AdminService, MONTHLY_EVOLUTION } from '../../../../lib/adminService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Si Firebase Admin SDK est connecté, on peut récupérer les données en direct
    // Sinon on utilise le service admin calculé
    const kpis = AdminService.calculateKPIs();

    return NextResponse.json({
      success: true,
      kpis,
      monthlyEvolution: MONTHLY_EVOLUTION,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Erreur API admin/stats :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur chargement statistiques admin' },
      { status: 500 }
    );
  }
}
