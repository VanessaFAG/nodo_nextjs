import { NextResponse } from 'next/server';
import { transaccionesPendientes } from '../../../../src/lib/mempool';

export async function GET() {
  return NextResponse.json({
    transacciones_pendientes: transaccionesPendientes,
    total: transaccionesPendientes.length
  }, { status: 200 });
}