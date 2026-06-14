import { NotificationService } from './product-bloc';

/**
 * ConsoleNotificationService: implementación de `NotificationService`
 * que escribe la notificación en la consola. Útil para desarrollo.
 */
export class ConsoleNotificationService implements NotificationService {
    async notify(email: string, message: string): Promise<void> {
        console.log('[Notify] to', email, message);
    }
}
