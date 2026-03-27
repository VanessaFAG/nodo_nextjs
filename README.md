# Documentación: Nodo Blockchain Usando NextJS 🔗
Las faces del proyecto 1, 2 y 4 se hcieron de manera local, se priorizó que funcionará de manera local antes de implementar la fase de integracion con los nodos de los demas integrantes del equipo (fase 3).

## 1. Arquitectura y Stack Tecnológico
API Route utilizando **NextJS (App Router)**. 
* **Backend:** NextJS procesa la lógica del blockchain de forma aislada en el servidor (Node.js).
* **Persistencia:** Se utilizó **Supabase** (PostgreSQL). Al ejecutarse el código del lado del servidor, interactuamos con la base de datos de manera directa y segura, sin exponer credenciales en el cliente.

## 2. Estructura de la Blockchain y Hashing
Cada registro en la tabla `grados` de Supabase representa un bloque de la cadena.
Para garantizar la inmutabilidad, se implementó una función, usando la librería `crypto-js`. 

La "huella digital" (`hash_actual`) se calcula concatenando de manera estricta los siguientes datos exactos de la transacción:
`persona_id + institucion_id + titulo_obtenido + fecha_fin + hash_anterior + nonce`

## 3. Mempool (Transacciones Pendientes)
Para gestionar las transacciones antes de ser minadas, se implementó **Mempool en memoria**. 
Se utilizó una variable global en el servidor (`transaccionesPendientes`) que almacena temporalmente los objetos JSON recibidos a través del endpoint `POST /api/transactions` hasta que el proceso de minería los reclame.

## 4. Minería y Proof of Work (PoW)
El proceso de minado (`POST /api/mine`) toma la primera transacción de la Mempool y ejecuta un ciclo `do-while` para calcular hashes de forma repetitiva incrementando la variable `nonce`.

## 5. Propagación y Red P2P (Fase 2 y 3)
* **Registro de Nodos:** Se utilizó la estructura de datos `Set` en TypeScript (`nodosRegistrados`) para almacenar las URLs de los demás nodos. El uso de `Set` garantiza matemáticamente que no haya URLs duplicadas en la memoria.
* **Propagación:** Se modificaron los endpoints de transacciones y minería (pasaron de ser locales, para pruebas de funcionalidad, a poder unirse a los demás nodos). Al recibir un dato nuevo, el nodo itera sobre el arreglo de nodos registrados usando `fetch` asíncrono para enviar copias (transacciones o bloques) a los demás, incluyendo una bandera `propagado: true` para evitar bucles infinitos en la red.
* **Validación:** El endpoint `/api/blocks` recalcula el hash de cualquier bloque entrante para verificar su integridad matemática antes de aceptarlo.

## 6. Algoritmo de Consenso (Fase 4)
Para resolver conflictos (`GET /api/nodes/resolve`), el nodo consulta el endpoint `/api/chain` de todos sus compañeros registrados. Si detecta que un compañero posee una cadena válida con una `longitud` mayor a la cadena local, el nodo purga sus registros desactualizados en Supabase y realiza una inserción masiva de la cadena ganadora, logrando la sincronización total.

## Referencia de la API (OpenAPI)
Toda la documentación interactiva de los endpoints se centralizaron en un archivo `swagger.json`. Esta interfaz gráfica se renderiza mediante un componente de React en NextJS, permitiendo a cualquier usuario interactuar con los endpoints (registrar nodos, minar bloques, consultar la cadena) directamente desde el navegador con la siguiente ruta:

--> **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**
