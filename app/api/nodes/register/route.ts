import { NextResponse } from 'next/server';
import { nodosRegistrados } from '../../../../src/lib/nodes';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const url = body.url; 

    if (!url) {
      return NextResponse.json({ error: 'Por favor envía la "url" del nodo' }, { status: 400 });
    }

    nodosRegistrados.add(url);

    return NextResponse.json({
      mensaje: 'Nodo registrado exitosamente',
      nodos: Array.from(nodosRegistrados),
      total: nodosRegistrados.size
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar el nodo' }, { status: 500 });
  }
}