## Bitácora de refactorización

Se describe en profundidad el estado del código antes y después de la
refactorización, las decisiones de diseño, las implicaciones para pruebas y despliegue,
y recomendaciones prácticas para llevar estas mejoras a producción.

1) Estado ANTES — problemas concretos

- Acoplamiento a implementaciones concretas: varias clases importaban y usaban dependencias
	concretas directamente (por ejemplo `axios` en `src/02-ocp/news-service.ts` o
	`LocalDatabaseService` en `src/05-dip/post-service.ts`). Esto provoca dos problemas:
	1) Dificulta cambiar la infraestructura (por ejemplo, cambiar cliente HTTP o DB).
	2) Hace testing más caro porque hay que levantar dependencias reales o escribir mucho setup.

- Clases con responsabilidad mezclada (violación de SRP): el antiguo `ProductBloc` mezclaba
	carga/guardado de datos y envío de notificaciones. Las clases con múltiples responsabilidades
	tienden a crecer, rotar entre cambios por razones distintas y dificultar el razonamiento y las pruebas.

- Falta de abstracciones para transacciones y resiliencia: no había una interfaz que representara
	un proveedor de datos con soporte transaccional. Por tanto no existía una forma portátil de
	ejecutar operaciones dentro de un contexto transaccional ni de aplicar reintentos controlados.

- Code smell en manejo de errores: las operaciones que podían fallar (peticiones HTTP, accesos a BD)
	no tenían una política de reintentos o rollback, con lo que errores transitorios rompían flujos completos.

2) Estado DESPUÉS — qué se cambió y porqué

- Introducción de abstracciones (DIP/OCP):
	- `DatabaseProvider` en [src/data/local-database.ts](src/data/local-database.ts) encapsula
		operaciones transaccionales (`beginTransaction`, `commit`, `rollback`, `getFakePosts`).
	- `IHttpClient` en [src/02-ocp/http-client.ts](src/02-ocp/http-client.ts) abstrae el cliente HTTP.
	Beneficio: las capas de negocio ahora dependen de contratos estables; cambiar la implementación
	(ej. pasar de `axios` a `fetch`) sólo requiere proporcionar otro adaptador.

- Aplicación de SRP: `ProductBloc` en [src/01-srp/product-bloc.ts](src/01-srp/product-bloc.ts)
	ahora orquesta la lógica de negocio y delega persistencia y notificaciones a interfaces:
	`ProductRepository` y `NotificationService`. Esto reduce el área de cambio por motivo y facilita tests unitarios.

- Resiliencia transaccional y reintentos:
	- `TransactionalLocalDatabaseService` implementa la interfaz transaccional para demos/tests.
	- `retryWithBackoff` en [src/utils/retry.ts](src/utils/retry.ts) implementa reintentos
		exponenciales sencillos.
	- `PostService` en [src/05-dip/post-service.ts](src/05-dip/post-service.ts) ejecuta la lectura
		dentro de una transacción y envuelve la operación en `retryWithBackoff`. Diseño:
		- Intentos limitados (por defecto 3).
		- Backoff exponencial para evitar ráfagas de reintentos.
		- Rollback explícito en la rama de error para dejar el proveedor en estado consistente.

- Wiring y adaptadores para desarrollo y pruebas:
	- `InMemoryProductRepository` y `ConsoleNotificationService` (en `src/01-srp/`) permiten
		ejecutar demos y pruebas de integración locales sin infra externa.
	- `AxiosHttpClient` es un adaptador concreto para `IHttpClient` usado en demos.

3) Pruebas y despliegue

- Tests unitarios: al depender de interfaces, los servicios (`PostService`, `NewsService`, `ProductBloc`)
	se pueden probar con mocks/stubs ligeros que implementen las mismas interfaces. Esto mejora la rapidez
	y la fidelidad de las pruebas unitarias.

- Tests de integración: los adaptadores en memoria (`InMemoryProductRepository`, `TransactionalLocalDatabaseService`)
	permiten ejecutar pruebas de flujo completas sin necesidad de una base de datos real. Para staging/producción
	conviene añadir pruebas que usen la base real para validar contratos transaccionales ACID.

- Despliegue: la abstracción `DatabaseProvider` facilita introducir un adaptador para la base de datos
	que sea transaccional (p. ej. PostgreSQL). En producción el adaptador debería usar las transacciones
	nativas del motor y mapear `beginTransaction()`/`commit()`/`rollback()` al cliente real.

4) Puntos débiles y riesgos residuales

- Simulación vs realidad: las implementaciones transaccionales actuales son simuladas (logs y tokens).
	Pasar a un motor real exige mapear correctamente el ciclo de vida de la transacción y comprobar
	el comportamiento en casos de concurrencia y bloqueo.

- Clasificación de errores: hoy el reintento se aplica sobre cualquier excepción. En producción conviene
	distinguir errores transitorios (timeout, 5xx) de errores lógicos (400, validaciones) para evitar reintentos inútiles.

- Observabilidad: agregar métricas (conteo de reintentos, latencias, errores), logs estructurados y trazas
	ayudará a identificar problemas operativos.

5) Pruebas añadidas (resumen)

- `src/__tests__/retry.test.ts`: prueba unitaria de `retryWithBackoff`.
- `src/__tests__/post-service.test.ts`: prueba que simula fallos transitorios en `DatabaseProvider` y verifica
	que `PostService` reintenta y devuelve resultados.
- `src/__tests__/productbloc.integration.test.ts`: integración ligera usando `InMemoryProductRepository`
	y un notifier de prueba para comprobar orquestación.

6) Próximos pasos recomendados (priorizados)

1. Implementar un adaptador real de `DatabaseProvider` para el motor objetivo (p. ej. Postgres) y validar
	 transacciones y concurrencia.
2. Añadir clasificación de errores y política de reintentos basada en códigos/causas.
3. Integrar observabilidad (OpenTelemetry o similar) y dashboards para reintentos/errores.
4. Añadir un pipeline CI que ejecute `npm run test` y verifique linter/format y análisis estático.

---