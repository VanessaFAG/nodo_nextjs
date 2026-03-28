"use client";

import { useState, useEffect } from "react";

export default function NodoDashboard() {
  const [cadena, setCadena] = useState<any[]>([]);
  const [mempool, setMempool] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [formData, setFormData] = useState({
    persona_id: "",
    institucion_id: "",
    programa_id: "",
    titulo_obtenido: "",
    fecha_fin: "",
  });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const resChain = await fetch("/api/chain");
      const dataChain = await resChain.json();
      setCadena(dataChain.cadena || []);

      const resMempool = await fetch("/api/transactions");
      const dataMempool = await resMempool.json();
      setMempool(dataMempool.transacciones || []);
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };

  const manejarEnvioTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMensaje("Transacción agregada a la Mempool exitosamente");
        setFormData({
          persona_id: "",
          institucion_id: "",
          programa_id: "",
          titulo_obtenido: "",
          fecha_fin: "",
        });
        cargarDatos();
      } else {
        const errorData = await res.json();
        setMensaje("Error: " + errorData.error);
      }
    } catch (error) {
      setMensaje("Error de conexión");
    }
    setCargando(false);
  };

  const minarBloque = async () => {
    setCargando(true);
    setMensaje("Minando bloque... calculando Proof of Work");
    try {
      const res = await fetch("/api/mine", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMensaje("¡Bloque minado exitosamente! Hash: " + data.bloque.hash_actual);
        cargarDatos();
      } else {
        setMensaje("Error al minar: " + data.error);
      }
    } catch (error) {
      setMensaje("Error de conexión al minar");
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">Panel de Control: Nodo Blockchain</h1>

        {/* Notificaciones */}
        {mensaje && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
            <p>{mensaje}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario de Nueva Transacción */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Registrar Nuevo Grado</h2>
            <form onSubmit={manejarEnvioTransaccion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Persona (UUID)</label>
                <input type="text" placeholder="Ej: 33333333-3333..." className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.persona_id} onChange={(e) => setFormData({...formData, persona_id: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Institución (UUID)</label>
                <input type="text" placeholder="Ej: 11111111-1111..." className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.institucion_id} onChange={(e) => setFormData({...formData, institucion_id: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Programa (UUID)</label>
                <input type="text" placeholder="Ej: 22222222-2222..." className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.programa_id} onChange={(e) => setFormData({...formData, programa_id: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Título Obtenido</label>
                <input type="text" placeholder="Ej: Ingeniero en Sistemas" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.titulo_obtenido} onChange={(e) => setFormData({...formData, titulo_obtenido: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.fecha_fin} onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})} required />
              </div>
              <button type="submit" disabled={cargando} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
                Agregar a Mempool
              </button>
            </form>
          </div>

          {/* Mempool y Acciones */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-semibold">Mempool (Pendientes)</h2>
                <span className="bg-yellow-200 text-yellow-800 py-1 px-3 rounded-full text-sm font-bold">{mempool.length}</span>
              </div>
              {mempool.length === 0 ? (
                <p className="text-gray-500 italic">No hay transacciones pendientes.</p>
              ) : (
                <ul className="space-y-3">
                  {mempool.map((tx, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded border text-sm flex flex-col gap-1">
                      <p><strong>Estudiante:</strong> {tx.persona_id.substring(0,8)}...</p>
                      <p><strong>Título:</strong> {tx.titulo_obtenido}</p>
                    </li>
                  ))}
                </ul>
              )}
              
              <button 
                onClick={minarBloque} 
                disabled={mempool.length === 0 || cargando} 
                className={`mt-6 w-full font-bold py-3 px-4 rounded transition ${mempool.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                {cargando ? 'Procesando...' : 'Minar Bloque'}
              </button>
            </div>
          </div>
        </div>

        {/* Explorador de Bloques */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-2xl font-semibold">Explorador de la Cadena (Bloques Minados)</h2>
            <button onClick={cargarDatos} className="text-blue-600 hover:text-blue-800 font-medium">Actualizar</button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {cadena.map((bloque, index) => (
                <div key={bloque.id} className="min-w-[300px] bg-slate-800 text-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                  <div className="flex justify-between border-b border-slate-600 pb-2 mb-2">
                    <span className="font-bold text-green-400">Bloque #{index}</span>
                    <span className="text-xs text-slate-400">Nonce: {bloque.nonce}</span>
                  </div>
                  <div className="text-xs space-y-2 break-all">
                    <p><span className="text-slate-400">Título:</span> {bloque.titulo_obtenido}</p>
                    <p><span className="text-slate-400">Hash:</span> <br/><span className="text-green-300">{bloque.hash_actual}</span></p>
                    <p><span className="text-slate-400">Prev:</span> <br/>{bloque.hash_anterior || "Génesis (Vacío)"}</p>
                  </div>
                </div>
              ))}
              {cadena.length === 0 && (
                <p className="text-gray-500 italic">La cadena está vacía.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}