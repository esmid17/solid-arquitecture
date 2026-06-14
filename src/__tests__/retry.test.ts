// Verifica que `retryWithBackoff` reintenta una operación fallida
// y devuelve el resultado cuando la operación tiene éxito.
import { describe, it, expect } from 'vitest';
import { retryWithBackoff } from '../utils/retry';

it('retryWithBackoff retries until success', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    if (attempts < 3) throw new Error('transient');
    return 'ok';
  };

  const res = await retryWithBackoff(fn, 5, 1);
  expect(res).toBe('ok');
  expect(attempts).toBe(3);
});
