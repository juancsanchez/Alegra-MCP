export function getAlegraAuthHeaders(): Headers {
    const user = process.env.ALEGRA_USER;
    const token = process.env.ALEGRA_TOKEN;

    if (!user || !token) {
        throw new Error('ALEGRA_USER y ALEGRA_TOKEN deben estar definidos en el archivo .env');
    }

    const base64Credentials = Buffer.from(`${user}:${token}`).toString('base64');

    const headers = new Headers();
    headers.append('Authorization', `Basic ${base64Credentials}`);
    headers.append('Content-Type', 'application/json');

    return headers;
}