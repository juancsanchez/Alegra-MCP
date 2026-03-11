let cachedHeaders: Headers | null = null;

export function getAlegraAuthHeaders(): Headers {
    if (cachedHeaders) return cachedHeaders;

    const user = process.env.ALEGRA_USER;
    const token = process.env.ALEGRA_TOKEN;

    if (!user || !token) {
        throw new Error('ALEGRA_USER y ALEGRA_TOKEN deben estar definidos como variables de entorno');
    }

    const base64Credentials = Buffer.from(`${user}:${token}`).toString('base64');

    cachedHeaders = new Headers();
    cachedHeaders.append('Authorization', `Basic ${base64Credentials}`);
    cachedHeaders.append('Content-Type', 'application/json');

    return cachedHeaders;
}

/** Limpia el caché de headers (útil para testing o rotación de credenciales). */
export function clearAuthCache(): void {
    cachedHeaders = null;
}
