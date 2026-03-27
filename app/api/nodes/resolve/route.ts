import { NextResponse } from 'next/server';
import { supabase } from '../../../../src/lib/supabase';
import { nodosRegistrados } from '../../../../src/lib/nodes';

export async function GET() {
  try {
    // 1. Obtenemos nuestra cadena local para saber su tamaño
    const { data: cadenaLocal } = await supabase
      .from('grados')
      .select('*');
      
    let maxLongitud = cadenaLocal ? cadenaLocal.length : 0;
    let nuevaCadena = null;

    // 2. Le preguntamos a cada compañero registrado por su cadena
    // Usamos un ciclo for...of para poder usar await en cada petición
    for (const url of Array.from(nodosRegistrados)) {
      try {
        const response = await fetch(`${url}/api/chain`);
        if (response.ok) {
          const data = await response.json();
          
          // 3. Regla de Consenso: Si su cadena es más larga que la nuestra, la marcamos como la ganadora
          if (data.longitud > maxLongitud) {
            maxLongitud = data.longitud;
            nuevaCadena = data.cadena;
          }
        }
      } catch (e) {
        console.log(`El nodo ${url} está apagado o inalcanzable.`);
      }
    }

    // 4. Si encontramos una cadena ganadora (más larga), la adoptamos
    if (nuevaCadena) {
      // Borramos nuestra cadena desactualizada (Supabase requiere un filtro para borrar, usamos not null)
      await supabase.from('grados').delete().not('id', 'is', null);
      
      // Insertamos la cadena ganadora de nuestro compañero
      const { error } = await supabase.from('grados').insert(nuevaCadena);
      
      if (error) throw error;

      return NextResponse.json({
        mensaje: 'Conflictos resueltos: Nuestra cadena fue reemplazada por una más larga',
        nueva_longitud: maxLongitud
      }, { status: 200 });
    }

    // Si nadie tiene una cadena más larga, nos quedamos como estamos
    return NextResponse.json({
      mensaje: 'Nuestra cadena ya es la más larga o está sincronizada',
      longitud: maxLongitud
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al resolver conflictos: ' + error.message }, { status: 500 });
  }
}