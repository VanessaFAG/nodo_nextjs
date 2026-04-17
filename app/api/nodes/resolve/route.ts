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

      // Insertamos la nueva cadena y traductor 
      const cadenaFormateada = nuevaCadena.map((bloque: any) => {
        const datos = (bloque.datos_grado && typeof bloque.datos_grado === 'object') 
                      ? bloque.datos_grado 
                      : bloque;

        return {
          // Solo extraemos nuestras columnas. se ignorará el 'id' por completo, ya que supabase los genera
          persona_id: datos.persona_id || 0,
          institucion_id: datos.institucion_id || 0,
          programa_id: datos.programa_id || 0,
          titulo_obtenido: datos.titulo_obtenido || "Bloque Génesis",
          fecha_inicio: datos.fecha_inicio || null,
          fecha_fin: datos.fecha_fin || "2000-01-01",
          hash_actual: bloque.hash_actual || "hash_falso",
          hash_anterior: bloque.hash_anterior || "0",
          nonce: bloque.nonce || 0,
          firmado_por: bloque.firmado_por || "desconocido"
        };
      });

      // Insertamos la cadena limpia
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