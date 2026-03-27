import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabase';
import { calcularHash } from '../../../src/lib/blockchain';

// POST: Recibe un bloque minado por otro nodo y lo valida
export async function POST(request: Request) {
  try {
    const bloqueEntrante = await request.json();

    // Validar el Proof of Work, valida que inicie con dos ceros
    if (!bloqueEntrante.hash_actual.startsWith('00')) {
      return NextResponse.json({ error: 'Proof of Work inválido. Bloque rechazado.' }, { status: 400 });
    }

    const hashCalculado = calcularHash(
      bloqueEntrante.persona_id,
      bloqueEntrante.institucion_id,
      bloqueEntrante.titulo_obtenido,
      bloqueEntrante.fecha_fin,
      bloqueEntrante.hash_anterior,
      bloqueEntrante.nonce
    );

    if (hashCalculado !== bloqueEntrante.hash_actual) {
      return NextResponse.json({ error: 'El hash no coincide con los datos. Bloque rechazado.' }, { status: 400 });
    }

    // Validar el Hash Anterior para asegurar que encaja en nuestra cadena
    const { data: ultimoBloque } = await supabase
      .from('grados')
      .select('hash_actual')
      .order('creado_en', { ascending: false })
      .limit(1)
      .single();

    const miHashAnterior = ultimoBloque ? ultimoBloque.hash_actual : "";
    
    if (bloqueEntrante.hash_anterior !== miHashAnterior) {
      return NextResponse.json({ error: 'El hash_anterior no encaja con nuestra cadena actual' }, { status: 409 });
    }

    // Si pasa todas las validaciones, se guarda en nuestro Supabase
    const { error: insertError } = await supabase.from('grados').insert([bloqueEntrante]);
    if (insertError) throw insertError;

    return NextResponse.json({ mensaje: 'Bloque validado y añadido a la cadena local' }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error interno al procesar bloque: ' + error.message }, { status: 500 });
  }
}