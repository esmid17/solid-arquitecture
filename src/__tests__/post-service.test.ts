// Asegura que `PostService.getPosts` reintenta lecturas transaccionales
// cuando el proveedor lanza errores transitorios y devuelve filas.
import { it, expect } from 'vitest';
import { PostService } from '../05-dip/post-service';
import type { DatabaseProvider, Transaction } from '../data/local-database';

it('PostService retries transactional reads on transient errors', async () => {
  let calls = 0;
  const provider: DatabaseProvider = {
    async beginTransaction() { return { id: `t${Date.now()}` }; },
    async commit() {},
    async rollback() {},
    async getFakePosts(tx?: Transaction) {
      calls++;
      if (calls < 3) throw new Error('transient');
      return [{ id: 1, title: 'OK' }];
    }
  };

  const svc = new PostService(provider);
  const rows = await svc.getPosts();
  expect(Array.isArray(rows)).toBe(true);
  expect(calls).toBe(3);
});
