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
        const baseUrl = url.replace(/\/$/, "");

        let response = await fetch(`${baseUrl}/chain`);

        if (!response.ok) {
          response = await fetch(`${baseUrl}/api/chain`);
        }
        if (!response.ok) continue;

        const nodeData = await response.json();

        // Validamos que los datos vengan bien formados
        if (nodeData && typeof nodeData.length === 'number' && nodeData.length > maxLongitud) {
          maxLongitud = nodeData.length;
          nuevaCadena = nodeData.chain;
        }
      } catch (e) {
        console.log(`No se pudo conectar con el nodo ${url}, lo saltamos.`);
      }
    }

    if (nuevaCadena) {
      // Borramos toda la cadena local para poner la ganadora
      const { error: deleteError } = await supabase
        .from('grados')
        .delete()
        .not('hash_actual', 'is', null);

      if (deleteError) throw deleteError;

      // Insertamos la nueva cadena y traductor (Acomodamos los datos dependiendo de quién minó el bloque)
      const cadenaFormateada = nuevaCadena.map((bloque: any) => {
        if (bloque.datos_grado) {
          return {
            persona_id: bloque.datos_grado.persona_id,
            institucion_id: bloque.datos_grado.institucion_id,
            programa_id: bloque.datos_grado.programa_id,
            titulo_obtenido: bloque.datos_grado.titulo_obtenido,
            fecha_inicio: bloque.datos_grado.fecha_inicio || null,
            fecha_fin: bloque.datos_grado.fecha_fin,
            hash_actual: bloque.hash_actual,
            hash_anterior: bloque.hash_anterior,
            nonce: bloque.nonce,
            firmado_por: bloque.firmado_por || "desconocido"
          };
        }
        return bloque;
      });
      const { error: insertError } = await supabase
        .from('grados')
        .insert(cadenaFormateada);

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