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
    prompts: [
        {
            title: "Listar las 5 facturas de venta más recientes",
            description: "Ejemplo para obtener un listado de las últimas 5 facturas emitidas.",
            prompt: "Por favor, muéstreme las últimas 5 facturas de venta."
        },
        {
            title: "Buscar un contacto por su nombre",
            description: "Demuestra cómo usar los parámetros de consulta para buscar un cliente específico.",
            prompt: "Encuentre el contacto con el nombre \"Cliente Ejemplo S.A.S\""
        },
        {
            title: "Obtener detalles de un ítem por su ID",
            description: "Ejemplo para recuperar un producto o servicio usando su identificador único.",
            prompt: "Obtenga los detalles del ítem con ID 15."
        },
        {
            title: "Crear un borrador de factura de venta",
            description: "Muestra cómo estructurar una solicitud para crear una nueva factura en estado de borrador.",
            prompt: "Cree un nuevo borrador de factura para el cliente con ID 1, con el ítem de ID 4 (cantidad 2, precio 50000)."
        },
        {
            title: "Listar las cuentas bancarias",
            description: "Ejemplo para consultar recursos que no requieren parámetros complejos.",
            prompt: "Liste todas las cuentas bancarias registradas."
        }
    ]
});
logger.info("Iniciando Servidor MCP para Alegra...");
server.tool("AlegraAPI", // Nombre de la herramienta
"Una herramienta para interactuar con la API de contabilidad de Alegra. Permite realizar operaciones CRUD en una amplia gama de recursos como Facturas, Contactos, Items, Notas de Crédito, Órdenes de Compra y muchos más.", // Descripción para la IA
{
    // Esquema de argumentos usando Zod
    endpoint: z.enum([
        'invoices',
        'contacts',
        'items',
        'credit-notes',
        'remissions',
        'purchase-orders',
        'estimates',
        'income-debit-notes',
        'global-invoices',
        'transportation-receipts',
        'recurring-invoices',
        'payments',
        'bills',
        'debit-notes', // Este es para notas débito de proveedor
        'recurring-payments',
        'warehouses',
        'warehouse-transfers',
        'inventory-adjustments',
        'price-lists',
        'custom-fields',
        'variant-attributes',
        'item-categories',
        'sellers',
        'categories', // Para Cuentas Contables
        'cost-centers',
        'journals',
        'bank-accounts',
        'reconciliations',
        'taxes',
        'retentions',
        'currencies',
        'terms',
        'company',
        'users',
        'number-templates',
        'webhooks-subscriptions',
        'additional-charges'
    ]).describe("El tipo de recurso de la API de Alegra a consultar o modificar. Ej: 'invoices', 'contacts', 'items', 'credit-notes', 'purchase-orders', etc."),
    method: z.enum(['get', 'post', 'put', 'delete']).default('get').describe("El método HTTP a utilizar (get, post, put, delete)."),
    id: z.string().optional().describe("El ID específico de un recurso (ej: el ID de una factura para get, put, delete)."),
    queryParams: z.record(z.union([z.string(), z.any()])).optional().describe("Parámetros de consulta adicionales (ej: 'start', 'limit', 'query' para GET) o cuerpo de la solicitud para POST/PUT.")
}, async ({ endpoint, method, id, queryParams }) => {
    const BASE_URL = 'https://api.alegra.com/api/v1/';
    let url = `${BASE_URL}${endpoint}`;
    if (id) {
        url += `/${id}`;
    }
    // Definimos RequestInit aquí para poder modificarlo antes de fetch
    const fetchOptions = {
        method: method.toUpperCase(),
        headers: getAlegraAuthHeaders() // Content-Type application/json ya está en getAlegraAuthHeaders
    };
    if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') {
        if (queryParams && Object.keys(queryParams).length > 0) {
            const params = new URLSearchParams(queryParams);
            url += `?${params.toString()}`;
        }
    }
    else if (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT') {
        if (queryParams && Object.keys(queryParams).length > 0) {
            fetchOptions.body = JSON.stringify(queryParams);
        }
        else {
            // Para POST/PUT, si no se proporcionan queryParams (cuerpo), enviar un cuerpo JSON vacío.
            fetchOptions.body = JSON.stringify({});
        }
    }
    logger.info(`Realizando petición: ${method.toUpperCase()} ${url}`);
    if (fetchOptions.body) {
        logger.info(`Con cuerpo: ${fetchOptions.body}`);
    }
    try {
        const response = await fetch(url, fetchOptions);
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
