import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabase';
import { calcularHash } from '../../../src/lib/blockchain';
import { transaccionesPendientes, limpiarMempool } from '../../../src/lib/mempool';

export async function POST() {
  try {
    // Verificar si hay transacciones por minar
    if (transaccionesPendientes.length === 0) {
      return NextResponse.json({ error: 'No hay transacciones pendientes para minar' }, { status: 400 });
    }

    // Tomamos la primera transacción del mempool
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
    const dificultad = '00'; 

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
        fecha_fin: tx.fecha_fin,
        hash_actual: hashNuevo,
        hash_anterior: hashAnterior,
        nonce: nonce,
        firmado_por: "Nodo_Local"
      }])
      .select();

    if (insertError) {
      throw insertError;
    }

    // Limpia las transacción de la Mempool si ya fue minada con éxito
    transaccionesPendientes.shift();

    return NextResponse.json({
      mensaje: '¡Bloque minado con éxito!',
      bloque: nuevoBloque[0]
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al minar el bloque: ' + error.message }, { status: 500 });
  }
}