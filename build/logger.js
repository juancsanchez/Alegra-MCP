import { appendFileSync } from "fs";
import { join } from "path";
// Define la ruta del archivo de log en el mismo directorio que el script
const LOG_FILE = join(import.meta.dirname, "..", "alegra-mcp.log");
function formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    // Convierte errores a un formato legible
    const errorInfo = data instanceof Error ? { message: data.message, stack: data.stack } : data;
    const dataStr = data ? `\n${JSON.stringify(errorInfo, null, 2)}` : "";
    return `[${timestamp}] [${level}] ${message}${dataStr}\n\n`;
}
export const logger = {
    info(message, data) {
        appendFileSync(LOG_FILE, formatMessage("INFO", message, data));
    },
    error(message, error) {
        appendFileSync(LOG_FILE, formatMessage("ERROR", message, error));
    },
};
