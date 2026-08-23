import { NextResponse } from 'next/server';
import { validateEnvironment } from '../../../../lib/envCheck';

export async function GET() {
  const result = validateEnvironment();
  return NextResponse.json(result, {
    status: result.isValid ? 200 : 200, // Retourne 200 pour le tableau de bord avec les détails d'audit
  });
}
