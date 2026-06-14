
/**
 * Data provider con abstracciones y soporte transaccional simulado.
 * Provee una interfaz `DatabaseProvider` para invertir dependencias
 * y una implementación ligera `TransactionalLocalDatabaseService`.
 */

export interface Transaction {
    id: string;
}

export interface DatabaseProvider {
    beginTransaction(): Promise<Transaction>;
    commit(tx: Transaction): Promise<void>;
    rollback(tx: Transaction): Promise<void>;
    getFakePosts(tx?: Transaction): Promise<any[]>;
}

export class TransactionalLocalDatabaseService implements DatabaseProvider {
    async beginTransaction(): Promise<Transaction> {
        const tx = { id: `tx_${Date.now()}` };
        console.log('[DB] Begin transaction', tx.id);
        return tx;
    }
    async commit(tx: Transaction): Promise<void> {
        console.log('[DB] Commit transaction', tx.id);
    }

    async rollback(tx: Transaction): Promise<void> {
        console.log('[DB] Rollback transaction', tx.id);
    }
    async getFakePosts(tx?: Transaction) {
        if (tx) console.log('[DB] Reading posts inside transaction', tx.id);
        // Simulación de datos
        return [
            { id: 1, title: 'Avistamiento de Jaguar', body: 'Se reportó un jaguar cerca del río.' },
            { id: 2, title: 'Nuevas Orquídeas', body: 'Han florecido las especies raras en el jardín botánico.' }
        ];
    }
}

export class JsonDatabaseService implements DatabaseProvider {
    async beginTransaction(): Promise<Transaction> { return { id: 'json_tx' }; }
    async commit(tx: Transaction): Promise<void> { console.log('[JSON DB] commit', tx.id); }
    async rollback(tx: Transaction): Promise<void> { console.log('[JSON DB] rollback', tx.id); }
    async getFakePosts(tx?: Transaction) {
        return [ { id: 1, title: 'JSON Post 1', body: 'Contenido desde JSON' } ];
    }
}
