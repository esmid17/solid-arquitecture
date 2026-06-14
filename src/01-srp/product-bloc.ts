
/**
 * VIOLACIÓN AL PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP)
 * 
 * Este archivo muestra una clase "Dios" o un componente que hace demasiadas cosas.
 * En el contexto de la Reserva Ecológica, el ProductBloc gestiona el inventario de la tienda
 * de souvenirs y, al mismo tiempo, se encarga de las notificaciones por correo.
 */

export interface Product {
    id: number;
    name: string;
}

/**
 * ProductRepository: abstracción para persistencia de `Product`.
 * Implementaciones concretas (DB, in-memory) deben cumplir esta interfaz.
 */
export interface ProductRepository {
    save(product: Product): Promise<void>;
    findById(id: number): Promise<Product | undefined>;
}

/**
 * NotificationService: abstracción mínima para enviar notificaciones.
 * Permite usar console, SMTP y colas sin cambiar la lógica.
 */
export interface NotificationService {
    notify(email: string, message: string): Promise<void>;
}

/**
 * ProductBloc: coordinador de operaciones de negocio sobre productos.
 * - No conoce detalles de persistencia ni de envío de notificaciones.
 * - Recibe sus dependencias por inyección para facilitar pruebas y cambio de infra.
 */
export class ProductBloc {
    constructor(private repo: ProductRepository, private notifier: NotificationService) {}

    /**
     * loadProduct: delega la recuperación al repositorio.
     */
    async loadProduct(id: number) {
        return this.repo.findById(id);
    }

    /**
     * saveProduct: guarda y opcionalmente notifica al usuario.
     * Mantiene la responsabilidad limitada a la orquestación de la operación.
     */
    async saveProduct(product: Product, notifyEmail?: string) {
        await this.repo.save(product);
        if (notifyEmail) {
            await this.notifier.notify(notifyEmail, `Producto ${product.name} guardado`);
        }
    }
}
