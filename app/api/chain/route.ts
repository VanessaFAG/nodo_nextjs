import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabase'; // Ajusta los ../ si tu ruta es diferente

export async function GET() {
  try {
    // Hacemos la consulta a Supabase y guardamos el resultado directamente en la variable "data"
    const { data, error } = await supabase
      .from('grados')
      .select('*')
      .order('creado_en', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      chain: data || [],
      length: data ? data.length : 0
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener la cadena: ' + error.message }, { status: 500 });
  }
}