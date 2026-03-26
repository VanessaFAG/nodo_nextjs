import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabase';

export async function GET() {
  try {
    // Consultamos todos los bloques 
    const { data: chain, error } = await supabase
      .from('grados')
      .select('*')
      .order('creado_en', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Retornamos la cadena completa
    return NextResponse.json({
      mensaje: "Cadena obtenida exitosamente",
      longitud: chain.length,
      cadena: chain
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}