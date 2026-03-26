import { NextResponse } from 'next/server';
import { nodosRegistrados } from '../../../../src/lib/nodes';

// POST: Recibe la URL de un nuevo nodo y lo añade a la red
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nodoUrl } = body;

    if (!nodoUrl) {
      return NextResponse.json({ error: 'Falta proveer la URL del nodo (nodoUrl)' }, { status: 400 });
    }

    nodosRegistrados.add(nodoUrl);

    return NextResponse.json({
      mensaje: 'Nodo añadido a la red exitosamente',
      total_nodos: nodosRegistrados.size,
      nodos_actuales: Array.from(nodosRegistrados)
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno al registrar el nodo' }, { status: 500 });
  }
}

// GET: Para consultar rápidamente qué nodos están en tu red
export async function GET() {
  return NextResponse.json({
    total_nodos: nodosRegistrados.size,
    nodos_actuales: Array.from(nodosRegistrados)
  }, { status: 200 });
}