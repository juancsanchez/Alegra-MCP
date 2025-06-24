#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from 'isomorphic-fetch';
import { getAlegraAuthHeaders } from './auth.js';
import { logger } from './logger.js'; // Importar el logger
// Creamos la instancia del servidor
const server = new McpServer({
    name: "Alegra-MCP",
    version: "0.1.0",
});
logger.info("Iniciando Servidor MCP para Alegra...");
server.tool("AlegraAPI", // Nombre de la herramienta
"Una herramienta para interactuar con la API de contabilidad de Alegra. Permite consultar facturas, contactos y más.", // Descripción para la IA
{
    // Esquema de argumentos usando Zod
    endpoint: z.enum(['invoices', 'contacts', 'items']).describe("El tipo de recurso a consultar. Ej: 'invoices', 'contacts'."),
    method: z.enum(['get', 'post']).default('get').describe("El método HTTP a utilizar."),
    id: z.string().optional().describe("El ID específico de un recurso a consultar (ej: el ID de una factura)."),
    queryParams: z.record(z.string()).optional().describe("Parámetros de consulta adicionales, como 'start', 'limit', 'query'.")
}, async ({ endpoint, method, id, queryParams }) => {
    const BASE_URL = 'https://api.alegra.com/api/v1/';
    let url = `${BASE_URL}${endpoint}`;
    if (id) {
        url += `/${id}`;
    }
    if (queryParams) {
        const params = new URLSearchParams(queryParams);
        url += `?${params.toString()}`;
    }
    logger.info(`Realizando petición: ${method.toUpperCase()} ${url}`);
    try {
        const response = await fetch(url, {
            method: method.toUpperCase(),
            headers: getAlegraAuthHeaders()
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Error de la API de Alegra: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    catch (error) {
        logger.error("Error al llamar a la API de Alegra:", error);
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true
        };
    }
});
// Función principal para conectar y arrancar el servidor
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("Servidor MCP de Alegra conectado y esperando peticiones.");
}
main().catch((error) => {
    console.error("Error fatal en el servidor:", error);
    process.exit(1);
});
