import { ProductRepository, Product } from './product-bloc';

/**
 * InMemoryProductRepository: simple repositorio en memoria para demos y tests.
 * No es persistente entre ejecuciones, útil para ejemplos y pruebas unitarias.
 */
export class InMemoryProductRepository implements ProductRepository {
    private items: Product[] = [];

    /** Guarda el producto en una colección local en memoria. */
    async save(product: Product): Promise<void> {
        console.log('[InMemoryRepo] saving', product);
        this.items.push(product);
    }

    /** Busca un producto por `id` en la colección en memoria. */
    async findById(id: number): Promise<Product | undefined> {
        return this.items.find(p => p.id === id);
    }
}
