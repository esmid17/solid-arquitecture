import './style.css'

import { TransactionalLocalDatabaseService } from './data/local-database';
import { PostService } from './05-dip/post-service';
import { AxiosHttpClient } from './02-ocp/http-client';
import { NewsService } from './02-ocp/news-service';
import { InMemoryProductRepository } from './01-srp/in-memory-product-repo';
import { ConsoleNotificationService } from './01-srp/console-notification';
import { ProductBloc } from './01-srp/product-bloc';

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = (`
  <h1>CleanCode y SOLID</h1>
  <span>Revisar la consola de JavaScript</span>
`);

(async () => {
  // PostService con TransactionalLocalDatabaseService
  // Creamos un proveedor transaccional simulado y lo inyectamos en PostService.
  // Esto demuestra DIP + uso de transacciones + retry.
  const db = new TransactionalLocalDatabaseService();
  const postService = new PostService(db);
  try {
    const posts = await postService.getPosts();
    console.log('[Demo] Posts:', posts);
  } catch (err) {
    console.error('[Demo] getPosts failed', err);
  }

  // NewsService usando IHttpClient (AxiosHttpClient)
  // Creamos un cliente HTTP adaptador (Axios) y lo inyectamos en NewsService.
  // Permite cambiar la implementación HTTP sin tocar `NewsService`.
  const http = new AxiosHttpClient();
  const newsSvc = new NewsService(http);
  try {
    const news = await newsSvc.getLatestNews();
    console.log('[Demo] News count:', Array.isArray(news) ? news.length : 0);
  } catch (err) {
    console.error('[Demo] getLatestNews failed', err);
  }

  // ProductBloc con InMemoryProductRepository y ConsoleNotificationService
  // Wiring: orquestación de ejemplo para SRP.
  // - `InMemoryProductRepository` simula persistencia
  // - `ConsoleNotificationService` simula un canal de notificación
  // - `ProductBloc` permanece enfocado en la lógica de negocio
  const repo = new InMemoryProductRepository();
  const notifier = new ConsoleNotificationService();
  const productBloc = new ProductBloc(repo, notifier);

  await productBloc.saveProduct({ id: 1, name: 'Souvenir' }, 'visitante@example.com');
  const p = await productBloc.loadProduct(1);
  console.log('[Demo] Loaded product', p);

})();

