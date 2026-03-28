import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabase';

export async function POST() {
  try {
    // Primero revisamos si ya hay bloques para no duplicar el génesis
    const { data: existe } = await supabase.from('grados').select('id').limit(1);
    
    if (existe && existe.length > 0) {
      return NextResponse.json({ error: 'La cadena ya tiene bloques, no se puede crear otro génesis' }, { status: 400 });
    }

    const bloqueGenesis = {
      persona_id: "00000000-0000-0000-0000-000000000000", // Usuario Sistema
      institucion_id: "00000000-0000-0000-0000-000000000000", // Institución Sistema
      programa_id: "00000000-0000-0000-0000-000000000000", // Programa Sistema
      titulo_obtenido: "Bloque Génesis",
      fecha_inicio: "2000-01-01",
      fecha_fin: "2000-01-01",
      hash_anterior: "0",
      hash_actual: "0000000000000000000000000000000000000000000000000000000000000000",
      nonce: 0,
      firmado_por: "sistema"
    };

    const { data, error } = await supabase.from('grados').insert([bloqueGenesis]).select();
    
    if (error) throw error;

    return NextResponse.json({
      mensaje: "Bloque génesis creado",
      bloque: data[0]
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al crear génesis: ' + error.message }, { status: 500 });
  }
}