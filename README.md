\*Single Page App (SPA) con ABMC de Productos, ABMC de Compras, Carrito + Checkout, AutenticaciÃ³n JWT (roles admin / user) y logs a archivo.

\*Frontend (Vite + React + Tailwind): http://localhost:5173

\*Backend (Node + Express + json-server): http://localhost:4001
(ej: https://api.midominio.com/api)

**_Cuentas de prueba_**

*Admin
Email: admin@tienda.com
Password: utn123
*Usuario
Email: griselmolina1970
Password: Juan1970

**_ correr localmente_**

\*Requisitos: Node 18+. # 1) Instalar deps
npm install

     # 2) Variables de entorno

     # crear un .env en la raÃ­z con:
        *PORT=4001
        *ORIGIN=http://localhost:5173
        *JWT_SECRET=dev-secret
        *ADMIN_EMAIL=admin@tienda.com

      # 3) Levantar front + back juntos
          *npm run dev
          * WEB: http://localhost:5173
          * API: http://localhost:4001/api

\*\*\*Logs: se escriben en logs/access.log (accesos) y logs/error.log (errores).
Datos: la base estÃ¡ en db.json.

**_ Variables de entorno (deploy)_**

     *Backend:

       .PORT=4001
       .ORIGIN=<FRONTEND_URL>
       .JWT_SECRET=<un-secreto-seguro>
       .ADMIN_EMAIL=<admin@tienda.com>

     *Frontend (Vite):

        .VITE_API_URL=<BACKEND_URL>/api

**_­ Rutas principales (Front)_**

     / â€” Home (categorÃ­as y navegaciÃ³n SPA)
     /categoria/:cat â€” Listado por categorÃ­a/subcategorÃ­a
     /producto/:id â€” Detalle de producto
     /carrito â€” Carrito + Checkout
     /login, /signup
     /admin/productos â€” ABMC Productos
     /admin/compras â€” ABMC Compras (con Cliente, Fecha, Estado y paginado)

**_ API (resumen)_**

     .Auth
     .POST /api/auth/signup â€” registro (200/201)
     .POST /api/auth/login â€” login â†’ { token, user }
     .POST /api/auth/logout â€” 204
     .GET /api/profile â€” datos del usuario (requiere JWT)
     .Productos (admin)
     .GET /api/products?_page=1&_limit=20
     .POST /api/products â€” crear
     .PUT /api/products/:id / PATCH /api/products/:id â€” actualizar
     .DELETE /api/products/:id â€” borrar
     .Compras (orders)
     .GET /api/orders?_page=1&_limit=20&status=pending|pagado|enviado|cancelado
     .POST /api/orders â€” crear pedido (requiere login)
     .Payload esperado:

{
"customer": "Nombre Apellido",
"email": "user@mail.com",
"phone": "opcional",
"total": 12345,
"items": [{"id":1,"name":"...", "price":1000, "qty":2}],
"status": "pendiente"
}

    .PATCH /api/orders/:id â€” cambiar estado (admin)
    .Body: { "status": "pagado|enviado|cancelado|pendiente" }
    .DELETE /api/orders/:id â€” eliminar (admin)

\*\*\*El front no envÃ­a headers raros. Solo Authorization: Bearer <token> (inyectado por apiFetch).

**_ Funcionalidades implementadas_**

         *SPA + navegaciÃ³n con React Router

         .Carrito persistente (localStorage): agregar / sumar / restar / quitar
         .Checkout con datos prellenados, guarda telÃ©fono de contacto
         .Orden generada desde el checkout (user logueado)
         .ABMC Productos (admin): crear/editar/eliminar, validaciones
         .ABMC Compras (admin):
         .columnas Cliente y Fecha
         .filtro por estado (pendiente/pagado/enviado/cancelado/todos)
         .cambio de estado con PATCH /orders/:id
         .creaciÃ³n manual de compras con POST /orders
         .paginado con _page/_limit
         .Logger a archivo (logs/access.log y logs/error.log)
         .CORS configurado (preflight incluido)

**_Estilos_**

      .Tailwind:
         v4, en src/styles/index.css:
         @import "tailwindcss";

**_imágenes_**

Guardar en public/images/... y referenciar desde la data como rutas absolutas pÃºblicas:

/images/mujer/vestidos/vestido-01.webp
/images/hombre/bermudas/bermuda-03.webp

\*\*\*En caso de 404/imagen rota, verificar el path real en public y que en db.json la ruta comience con /images/....

**_Estructura (resumen)_**
/backend
index.mjs
db.json
/logs
access.log
error.log
/src
/components
/context
AuthContext.jsx
CartContext.jsx
/pages
HomePage.jsx
CartPage.jsx
AdminProductsPage.jsx
AdminOrdersPage.jsx
/services
api.js
products.js
orders.js
profile.js
/styles
index.css
public/
images/...
docs/
capturas/...

**_Evidencias & Matriz de cumplimiento_**

\*En docs/capturas incluimos capturas para cada punto de la consigna (home, registro/login, ABMC productos, carrito/checkout, ABMC compras, cambio de estado, compra manual y logs).
La Matriz de cumplimiento estÃ¡n en la secciÃ³n â€œEvidenciasâ€ de este README.

**_ Consigna - Evidencia _**

       # Matriz de cumplimiento#

. Backend: JWT (Login/Registro) (02, 03)  
. Backend: CRUD entidad principal (Productos) | 04, 05, 06, 07 |
. Backend: CRUD entidad soporte (Compras) | 10, 11, 12 |
. Backend: Validaciones | 02, 05, 12 (errores visibles) |
. Backend: Logger a archivo (13)
. Backend: Relaciones (orden con items y total) | 09 (checkout crea orden con items/total) |
. Backend: PaginaciÃ³n | 10 (parte inferior: â€œPÃ¡gina 1 de Xâ€) |
. Frontend: SPA + navegaciÃ³n (01)
. Frontend: ABMC (Productos/Compras) |(04â€“07 y 10â€“12 )
. Frontend: Hooks (useState/useEffect/useContext/useNavigate) | CÃ³digo (context + pages), visible en README â€œEstructuraâ€ |
. Frontend: Carrito + Checkout (08, 09)
.Deploy y README (ambos) | Enlaces y variables en README |

## Evidencias (capturas)

> Nota: Las capturas estÃ¡n en `docs/capturas/`. En cada una indicamos lo que se verifica según la consigna.

### 01 Home/sesión ok (SPA + navegación)

![Home](docs/capturas/01-home.png)
![con sesión iniciada como usuario común](docs\capturas\01-conSesión.png)
![con sesión iniciada como admin](docs\capturas\01-conSesiónAdmin.png)

- Se ve la portada con categorís.
- Barra superior con enlaces a _Carrito_, _Login_, _Registro_ (si no hay sesión) o _Salir_ (si hay sesión), si sesión admin: se ve compras y productos. Si sesión ok: saludo en nav.

### 02 Registro (signup con validación)

![Registro](docs\capturas\02-formRegistro.png)
![rta 201 + login ](docs\capturas\02-rta201LoginInmediato.png)

- Form con validaciones básicas.
- Tras registrarse: respuesta 201 y login inmediato (token en storage).

### 03 vista de productos

![categoría mujer](docs\capturas\03-ProductosCategoriaMujer.png)
![categoría hombre](docs\capturas\03-ProductosCategoriaHombre.png)
![categoría unisex](docs\capturas\03-ProductosCategoriaUnisex.png)

### 04 Productos nuevos + listado + form autocopletado para editar + alerta eliminar (ABMC vista admin)

![Productos ABMC](docs\capturas\04-formProductos-Listado-Crear.png)

- Listado con paginado (si aplica).
- Acciones **Editar** / **Eliminar** y botón **Crear producto**.
  ![Autocompletado para editar un productos ABMC](docs\capturas\04-formAutoCompletadoParaEditar.png)
  ![Alerta eliminar producto ABMC](docs\capturas\04-alertaEliminar.png)

### 05 Crear producto (validaciones)

![Crear producto](docs\capturas\05-crearProductoCamposObligatorios.png)

- Alta con campos requeridos y mensajes de error si faltan datos.
- Imagen con ruta pública `public/images/...`.

### 06 Editar producto (update OK)

![Editar producto](docs\capturas\06-editarProducto-200Red.png)
![Editar producto](docs\capturas\06-editarProductoRespuesta200Red.png)

- Se modifica precio/descripcion y se ve reflejado en la grilla.
- Respuesta 200 en red.

### 07 Eliminar producto (delete OK)

![producto a eliminar Bermuda Gabardina Hombre](docs\capturas\07-productoEliminarBermudaGabardinaHombre.png)
![producto eliminado + rta RED](docs\capturas\07-productoEliminadoRespuestaRed.png)
![producto desaparecido del listado](docs\capturas\07-desapariciónProductoDelListado.png)

- Confirmación y eliminación.
- Respuesta 200/204 y desaparición del i­tem en listado.

### 08 Carrito (agregar, sumar/restar, quitar)

![Carrito](docs\capturas\08-carrito.png)
![producto agregado al carrito/cantidad](docs\capturas\08-productoAgregadoCarrito.png)

- Agregar desde detalle/listado, cambiar cantidades, quitar item.
- Totales correctos y persistencia (localStorage).
- se ve la cantidad de productos que el usuario agregó (carrito)

### 09 Checkout (user logueado)

![Checkout](docs\capturas\09-checkout.png)
![Compra finalizada](docs\capturas\09-comprafinalizada.png)

- Datos pre-rellenados (nombre/email), teléfono opcional.
- Al finalizar: orden creada, carrito vací­o, banner de éxito.

### 10 Compras (ABMC admin)

![Compras listado](docs\capturas\10-comprasListado.png)
-Botón para CREAR COMPRA (ejemplo realizada x whasapp)

- Columnas: Cliente/Fecha/email/teléfono/total/Estado y acción eliminar visibles.
- Filtro por estado (pendiente/pagado/enviado/cancelado/todos).
- Paginación `_page/_limit`.

### 11 Cambio de estado (PATCH)

![Cambios de estado](docs\capturas\11-cambioestadoDesplegable.png)
![respuesta en RED (200)](docs\capturas\11-Red200.png)

- Desplegable cambia a `pagado`/`enviado`/`cancelado`.
- Ver en pestaña en RED: la solicitud **PATCH /orders/:id** 200.

### 12 Crear compra manual (POST)

![Compra manual](docs\capturas\12-modalCompraManual.png)
![Compra manual ok: Red = 201](docs\capturas\12-compraManualRed201.png)

- Modal con **Cliente**, **Email**, **Teléfono**, **Total** y **Estado**.
- Guardar **POST /orders** 201 y aparece en listado.

**_Créditos_**

Grupo 8  Diplomatura MERN (UTN)
Integrantes: Axel · Magalí · Diego · Daniela · Griselda
