import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/lib/supabase';
import { nodosRegistrados } from '../../../../src/lib/nodes';

export async function GET() {
  try {
    const { data: miCadena, error: errorMiCadena } = await supabase
      .from('grados')
      .select('*')
      .order('creado_en', { ascending: true });

    if (errorMiCadena) throw errorMiCadena;

    let maxLongitud = miCadena ? miCadena.length : 0;
    let nuevaCadena = null;

    for (const url of Array.from(nodosRegistrados)) {
      try {
        const response = await fetch(`${url}/api/chain`);
        const nodeData = await response.json();

        if (nodeData.length > maxLongitud) {
          maxLongitud = nodeData.length;
          nuevaCadena = nodeData.chain;
        }
      } catch (e) {
        console.log(`No se pudo conectar con el nodo ${url}, lo saltamos.`);
      }
    }

    if (nuevaCadena) {
      const { error: deleteError } = await supabase
        .from('grados')
        .delete()
        .not('hash_actual', 'is', null);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('grados')
        .insert(nuevaCadena);

      if (insertError) throw insertError;

      return NextResponse.json({
        mensaje: "Cadena reemplazada por una más larga",
        cadena: nuevaCadena
      }, { status: 200 });
    }

    return NextResponse.json({
      mensaje: "Nuestra cadena es la autoridad (no hubo reemplazo)",
      cadena: miCadena || []
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error en el consenso: ' + error.message }, { status: 500 });
  }
}