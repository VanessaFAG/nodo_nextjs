import { NextResponse } from 'next/server';
import { transaccionesPendientes } from '../../../src/lib/mempool';
import { nodosRegistrados } from '../../../src/lib/nodes';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.persona_id || !body.institucion_id || !body.titulo_obtenido || !body.fecha_inicio || !body.fecha_fin) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para la transacción' }, { status: 400 });
    }

    // Guarda la transacción localmente
    transaccionesPendientes.push(body);

    if (!body.propagado) {
      const txParaPropagar = { ...body, propagado: true };

      // Se envia la transacción a los demas nodos, no se espera que respondan
      for (const url of Array.from(nodosRegistrados)) {
        try {
          // Se usa fetch de manera asíncrona para no bloquear nuestro servidor
          fetch(`${url}/api/transactions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(txParaPropagar),
          }).catch(err => console.log(`No se pudo propagar al nodo ${url}`));
        } catch (e) {
        }
      }
    }

   return NextResponse.json({
      mensaje: 'Transacción agregada exitosamente',
      transaccion: body
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar la transacción' }, { status: 500 });
  }
}