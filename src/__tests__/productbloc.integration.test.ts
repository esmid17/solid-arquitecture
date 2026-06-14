// Verifica que `ProductBloc` guarda un producto,
// lo recupera y envía una notificación usando adaptadores en memoria.
import { it, expect } from 'vitest';
import { InMemoryProductRepository } from '../01-srp/in-memory-product-repo';
import { ConsoleNotificationService } from '../01-srp/console-notification';
import { ProductBloc } from '../01-srp/product-bloc';

it('ProductBloc saves, loads and sends notification (integration-like)', async () => {
  const repo = new InMemoryProductRepository();
  const notifications: any[] = [];
  class TestNotifier extends ConsoleNotificationService {
    async notify(email: string, message: string) {
      notifications.push({ email, message });
    }
  }

  const notifier = new TestNotifier();
  const bloc = new ProductBloc(repo, notifier);

  await bloc.saveProduct({ id: 1, name: 'P' }, 'u@example.com');
  const p = await bloc.loadProduct(1);

  expect(p).toBeDefined();
  expect(p?.name).toBe('P');
  expect(notifications.length).toBe(1);
});
