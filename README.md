# Servidor MCP para Alegra API

Este proyecto implementa un servidor compatible con el Protocolo de Contexto de Modelo (MCP) que actúa como un puente hacia la API de contabilidad de Alegra. Permite que los Modelos de Lenguaje Grandes (LLMs) interactúen de forma segura con una amplia gama de recursos de Alegra, como facturas, contactos, ítems, pagos y más.

Elaborado por Juan Sánchez.

## Características

  * **Integración Completa con Alegra**: Ofrece una herramienta (`AlegraAPI`) para realizar operaciones CRUD (`GET`, `POST`, `PUT`, `DELETE`) en la mayoría de los *endpoints* de la API de Alegra.
  * **Amplia Gama de Recursos**: Soporta una gran variedad de recursos, incluyendo `invoices`, `contacts`, `items`, `credit-notes`, `purchase-orders`, `bills`, `warehouses`, `bank-accounts`, `taxes`, entre muchos otros.
  * **Operaciones Flexibles**: Permite la consulta de colecciones de recursos, la obtención de un recurso por su ID específico, la creación de nuevos recursos y la actualización o eliminación de los existentes.
  * **Búsqueda y Filtrado**: Admite el uso de parámetros de consulta para filtrar y paginar resultados en las solicitudes `GET`.
  * **Manejo de Cuerpo de Solicitud**: Utiliza el parámetro `queryParams` para enviar el cuerpo (body) de las solicitudes `POST` y `PUT`.
  * **Registro de Actividad**: Todas las solicitudes y errores se registran en un archivo local `alegra-mcp.log` para facilitar la depuración y el seguimiento.

## Aviso de Seguridad Importante

**Sus credenciales de Alegra nunca salen de su máquina.**

Este servidor está diseñado con la seguridad como prioridad. La autenticación con la API de Alegra se gestiona de la siguiente manera:

1.  **Credenciales Locales**: El servidor lee su usuario (`ALEGRA_USER`) y token (`ALEGRA_TOKEN`) directamente desde un archivo `.env` en su entorno local en el momento en que se realiza cada solicitud.
2.  **Sin Almacenamiento**: Las credenciales no están codificadas en el programa, no se almacenan en ninguna base de datos ni se guardan en el estado del servidor.
3.  **Protección en Git**: El archivo `.gitignore` está configurado para excluir explícitamente cualquier archivo `.env`, evitando que sus credenciales sean enviadas accidentalmente a un repositorio de código.

> **Usted puede utilizar su LLM de confianza para validar el código y confirmar que sus credenciales no son almacenadas ni transmitidas a terceros.** El archivo clave para revisar es `src/auth.ts`, donde se leen las variables de entorno para generar los headers de autorización.

## Método 1: Ejecución Directa con NPX (para usuarios finales) - Fácil

Si no necesita modificar el código y solo desea utilizar la herramienta con su LLM, puede configurar su cliente MCP (por ejemplo, en el `settings.json` de VS Code) para que descargue y ejecute el servidor automáticamente.

Agregue la siguiente configuración a su cliente MCP:

```json
"mcp.servers": {
    "Alegra-MCP-Public": {
        "command": "npx",
        "args": [
            "-y",
            "@juancsanchez/alegra-mcp"
        ],
        "env": {
            "ALEGRA_USER": "su_email@dominio.com",
            "ALEGRA_TOKEN": "su_token_de_api_aqui"
        }
    }
}
```

Esta configuración le indica a su cliente que use `npx` para ejecutar la última versión del paquete, pasando sus credenciales de forma segura a través de variables de entorno, sin necesidad de clonar o instalar el proyecto manualmente.

## Método 2: Instalación Local (para desarrolladores)

Siga estos pasos si desea modificar o examinar el código.

### Requisitos Previos

  * **Node.js**: Se requiere la versión 18 o superior.
  * **Credenciales de Alegra**: Necesita un usuario y un token de API de su cuenta de Alegra.

### Instalación y Configuración

1.  **Clonar el Repositorio**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd alegra-mcp
    ```

2.  **Instalar Dependencias**

    ```bash
    npm install
    ```

3.  **Configurar las Credenciales**
    Cree un archivo llamado `.env` en la raíz del proyecto.

    ```bash
    touch .env
    ```

    Añada sus credenciales de Alegra al archivo `.env`:

    ```dotenv
    # Archivo .env
    ALEGRA_USER="su-correo@ejemplo.com"
    ALEGRA_TOKEN="su_token_secreto_de_la_api"
    ```

### Uso

1.  **Compilar el Código**

    ```bash
    npm run build
    ```

2.  **Iniciar el Servidor**

    ```bash
    npm start
    ```