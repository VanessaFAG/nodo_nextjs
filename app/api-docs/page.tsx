"use client"; // Es obligatorio porque Swagger usa componentes interactivos del navegador

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import spec from '../../src/lib/swagger.json';

export default function ApiDocs() {
  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">Documentación OpenAPI</h1>
      <SwaggerUI spec={spec} />
    </div>
  );
}