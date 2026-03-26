// Lista global en memoria para guardar las transacciones temporalmente
export let transaccionesPendientes: any[] = [];

// Función para limpiar la lista después de minar
export function limpiarMempool() {
  transaccionesPendientes = [];
}