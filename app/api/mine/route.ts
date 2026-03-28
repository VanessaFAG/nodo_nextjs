import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabase';
import { calcularHash } from '../../../src/lib/blockchain';
import { transaccionesPendientes, limpiarMempool } from '../../../src/lib/mempool';
import { nodosRegistrados } from '../../../src/lib/nodes';

export async function POST(request: Request) {
  try {
    // 1. Leemos quién está firmando el bloque desde el body
    const body = await request.json().catch(() => ({}));
    const firma = body.firmado_por || "nodo-nextjs-3000"; 

    if (transaccionesPendientes.length === 0) {
      return NextResponse.json({ error: 'No hay transacciones pendientes para minar' }, { status: 400 });
    }

    const tx = transaccionesPendientes[0];

    // Obtiene el último bloque de la cadena para sacar el hash_anterior
    const { data: ultimoBloque, error: errorSupabase } = await supabase
      .from('grados')
      .select('hash_actual')
      .order('creado_en', { ascending: false })
      .limit(1)
      .single();

    const hashAnterior = ultimoBloque ? ultimoBloque.hash_actual : ""; // Si no hay bloques, el hash anterior es una cadena vacía

    let nonce = 0;
    let hashNuevo = '';
    const dificultad = '000'; 

    do {
      nonce++;
      hashNuevo = calcularHash(
        tx.persona_id,
        tx.institucion_id,
        tx.titulo_obtenido,
        tx.fecha_fin,
        hashAnterior,
        nonce
      );
    } while (!hashNuevo.startsWith(dificultad));

    // Guarda el bloque minado en Supabase
    const { data: nuevoBloque, error: insertError } = await supabase
      .from('grados')
      .insert([{
        persona_id: tx.persona_id,
        institucion_id: tx.institucion_id,
        programa_id: tx.programa_id,
        titulo_obtenido: tx.titulo_obtenido,
        fecha_inicio: tx.fecha_inicio, // <- Agregamos el nuevo campo
        fecha_fin: tx.fecha_fin,
        hash_actual: hashNuevo,
        hash_anterior: hashAnterior,
        nonce: nonce,
        firmado_por: firma // <- Usamos la firma que llegó en el body
      }])
      .select();

    if (insertError) throw insertError;
    transaccionesPendientes.shift(); 

    // PROPAGACIÓN: Actualizamos la URL a /api/blocks/receive
    const bloqueGenerado = nuevoBloque[0];
    for (const url of Array.from(nodosRegistrados)) {
      fetch(`${url}/api/blocks/receive`, { // <- CAMBIO DE RUTA AQUÍ
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bloqueGenerado)
      }).catch(() => console.log(`Fallo al propagar bloque al nodo ${url}`));
    }

    return NextResponse.json({
      mensaje: '¡Bloque minado con éxito!',
      bloque: bloqueGenerado
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al minar: ' + error.message }, { status: 500 });
  }
}