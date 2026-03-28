import { NextResponse } from 'next/server';
import { nodosRegistrados } from '../../../../src/lib/nodes'; 

export async function GET() {
  const listaNodos = Array.from(nodosRegistrados);
  
  return NextResponse.json({
    nodos: listaNodos,
    total: listaNodos.length
  }, { status: 200 });
}