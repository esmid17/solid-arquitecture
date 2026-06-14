/**
 * retryWithBackoff: ejecuta `fn` y reintentará en caso de error.
 * - `attempts`: número máximo de intentos (incluye el primero).
 * - `delayMs`: tiempo base en milisegundos para el backoff exponencial.
 *
 * Util para operaciones transitorias (lecturas remotas, conexiones temporales).
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, attempts = 3, delayMs = 200): Promise<T> {
    let lastErr: any;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            const backoff = delayMs * Math.pow(2, i);
            console.warn(`[retry] attempt ${i + 1} failed, retrying in ${backoff}ms`);
            await new Promise(res => setTimeout(res, backoff));
        }
    }
    // After exhausting attempts, propagate last error to caller
    throw lastErr;
}
