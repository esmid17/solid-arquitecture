import axios from 'axios';

/**
 * IHttpClient: simple abstracción sobre un cliente HTTP.
 * Permite inyectar diferentes implementaciones (axios, fetch, mocks).
 */
export interface IHttpClient {
    get<T = any>(url: string): Promise<T>;
}

/**
 * AxiosHttpClient: adaptador que implementa `IHttpClient` usando axios.
 * Encapsula la dependencia para que el resto del código no la conozca.
 */
export class AxiosHttpClient implements IHttpClient {
    async get<T = any>(url: string) {
        const resp = await axios.get(url);
        return resp.data as T;
    }
}
