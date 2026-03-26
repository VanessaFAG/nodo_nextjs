import SHA256 from 'crypto-js/sha256';

export function calcularHash(
  persona_id: string,
  institucion_id: string,
  titulo_obtenido: string,
  fecha_fin: string,
  hash_anterior: string,
  nonce: number
): string {
  const dataString = `${persona_id}${institucion_id}${titulo_obtenido}${fecha_fin}${hash_anterior}${nonce}`; // Concatenamos todos los datos
  
  // Generamos y retornamos el hash
  return SHA256(dataString).toString();
}