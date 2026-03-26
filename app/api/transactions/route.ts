import { NextResponse } from 'next/server';
import { transaccionesPendientes } from '../../../src/lib/mempool';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.persona_id || !body.institucion_id || !body.titulo_obtenido || !body.fecha_fin) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para la transacción' }, { status: 400 });
    }

    transaccionesPendientes.push(body);

    return NextResponse.json({
      mensaje: 'Transacción agregada a la lista de pendientes exitosamente',
      transaccion: body,
      total_pendientes: transaccionesPendientes.length
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar la transacción' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    mensaje: "Transacciones pendientes actuales",
    total: transaccionesPendientes.length,
    transacciones: transaccionesPendientes
  }, { status: 200 });
}