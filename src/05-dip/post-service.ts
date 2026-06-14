
/**
 * PostService refactorizado para DIP + resiliencia transaccional.
 * Ahora depende de la abstracción `DatabaseProvider` y recibe la dependencia
 * por inyección. Implementa una transacción ligera y retry básico.
 */

import { DatabaseProvider } from '../data/local-database';
import { retryWithBackoff } from '../utils/retry';

export class PostService {

    private posts: any[] = [];

    constructor(private db: DatabaseProvider) {}

    async getPosts() {
        const work = async () => {
            const tx = await this.db.beginTransaction();
            try {
                const rows = await this.db.getFakePosts(tx);
                await this.db.commit(tx);
                this.posts = rows;
                return rows;
            } catch (err) {
                // Rollback ensures we don't leave partial state in the provider
                await this.db.rollback({ id: 'failed' });
                throw err;
            }
        };

        return retryWithBackoff(work, 3, 200);
    }

}
