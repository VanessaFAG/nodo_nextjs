import SHA256 from 'crypto-js/sha256';

export function calcularHash(
  persona_id: string,
  institucion_id: string,
  titulo_obtenido: string,
  fecha_fin: string,
  hash_anterior: string,
  nonce: number
): string {
  // Concatenamos exactamente los datos que pide el examen
  const dataString = `${persona_id}${institucion_id}${titulo_obtenido}${fecha_fin}${hash_anterior}${nonce}`;
  
  // Generamos y retornamos el hash en formato texto
  return SHA256(dataString).toString();
}