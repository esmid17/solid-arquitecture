
/**
 * NewsService refactorizado para OCP: depende de `IHttpClient`.
 */

import { IHttpClient } from './http-client';

/**
 * NewsService: servicio de negocio que obtiene noticias usando un cliente HTTP
 * inyectado que cumple `IHttpClient`. Esto cumple OCP porque podemos proveer
 * otra implementación sin cambiar esta clase.
 */
export class NewsService {
    constructor(private http: IHttpClient) {}

    /**
     * getLatestNews: transfiere la obtención al cliente HTTP inyectado.
     */
    async getLatestNews() {
        console.log('Obteniendo noticias de la reserva biológica...');
        return this.http.get('https://jsonplaceholder.typicode.com/posts');
    }
}

/**
 * PhotosService: ejemplo adicional que reutiliza `IHttpClient`.
 */
export class PhotosService {
    constructor(private http: IHttpClient) {}

    async getGallery() {
        return this.http.get('https://jsonplaceholder.typicode.com/photos');
    }
}
