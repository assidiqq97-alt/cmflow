import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { AdminService } from '../../../../lib/adminService';

export const dynamic = 'force-dynamic';

// GET : Liste de toutes les agences
export async function GET() {
  try {
    const agencies = AdminService.getAgencies();
    return NextResponse.json({ success: true, agencies, total: agencies.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// POST : Création d'une nouvelle agence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agencyName, ownerName, email, phone, plan } = body;

    if (!agencyName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants (nom, email, téléphone)' },
        { status: 400 }
      );
    }

    const result = AdminService.addAgency({
      agencyName,
      ownerName: ownerName || agencyName,
      email,
      phone,
      plan: plan || 'trial',
    });

    // Sync Firestore Admin si dispo
    if (adminDb && result.agency) {
      try {
        await adminDb.collection('agencies').doc(result.agency.id).set({
          name: result.agency.agencyName,
          ownerName: result.agency.ownerName,
          email: result.agency.email,
          phone: result.agency.phone,
          planId: result.agency.plan,
          status: result.agency.status,
          createdAt: result.agency.createdAt,
        }, { merge: true });
      } catch (e) {
        console.warn('Sync Firestore ignoré:', e);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// PATCH : Actions (Prolonger trial, Changer forfait, Suspendre/Activer)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { agencyId, action, days, newPlan, newStatus } = body;

    if (!agencyId || !action) {
      return NextResponse.json(
        { success: false, error: 'agencyId et action sont requis' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'extend_trial') {
      result = AdminService.extendTrial(agencyId, days || 7);
    } else if (action === 'change_plan') {
      result = AdminService.changePlan(agencyId, newPlan);
    } else if (action === 'toggle_status') {
      result = AdminService.toggleStatus(agencyId, newStatus);
    } else if (action === 'delete') {
      result = AdminService.deleteAgency(agencyId);
    } else {
      return NextResponse.json({ success: false, error: `Action inconnue: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
