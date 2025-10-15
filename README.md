# Grupo8UTN2025 — Tienda (SPA + API). Para Diplomatura Desarrollo Web I 2025.

Single Page App (Vite + React + Tailwind) con backend Node/Express + json-server, autenticación **JWT** (roles *admin* / *user*), carrito con checkout, **ABMC** de productos y compras, validaciones y **logs a archivo**.

- **Frontend (Vite + React)**: `/` (local: `http://localhost:5173`)
- **Backend (Node + Express)**: `/api` (local: `http://localhost:4001/api`)

## Cuentas de prueba

**Admin**  
Email: `admin@tienda.com`  
Password: `utn123`

**Usuario**  
Email: `griselmolina1970@gmail.com`  
Password: Juan1970

---
## Correr localmente

**Requisitos**: Node 20.x (o 22.12+).  
1) Instalar dependencias  
```bash
npm install

Crear .env en la raíz (valores por defecto recomendados):
PORT=4001
ORIGIN=http://localhost:5173
JWT_SECRET=dev-secret
ADMIN_EMAIL=admin@tienda.com

Levantar frontend + backend en paralelo
npm run dev
# WEB: http://localhost:5173
# API: http://localhost:4001/api

Logs: logs/access.log (accesos) y logs/error.log (errores)
Datos (json-server): db.json

Variables de entorno (Deploy)
Backend

PORT → provisto por el hosting .

ORIGIN → URL pública del front (si front por el mismo servidor entonces se  puede omitir).

JWT_SECRET → valor aleatorio y largo.

ADMIN_EMAIL → admin@tienda.com .

Frontend (Vite)

Si el front se sirve desde el mismo dominio que el backend, no definir VITE_API_URL y el cliente usará "/api".

Si el backend está en otro dominio, define:
VITE_API_URL=https://tu-backend/publico/api

 ## Deploy (Railway)

Proyecto publicado en **Railway** (Front + API en el mismo servicio):

- **URL pública:** http://grupo8utn2025-production.up.railway.app/
- **Base de API (desde el front):** `/api`  
  > No hace falta definir `VITE_API_URL` en producción: el cliente usa `"/api"` por defecto.

### Variables de entorno en Railway (Service → Variables)

Backend:
- `JWT_SECRET` → (valor largo y aleatorio)
- `ADMIN_EMAIL` → `admin@tienda.com`
- *(opcional)* `ORIGIN` → no necesario cuando el front se sirve en el mismo dominio

> Railway asigna `PORT` automáticamente; **no** lo fijes vos.

### Build & Start (Service → Settings)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

Esto compila el front (Vite) a `dist/` y Express lo sirve como estático, además de montar la API bajo `/api`.

### Notas de uso
- En planes gratuitos, el servicio puede “dormir”; el primer acceso puede demorar unos segundos.
- Las imágenes deben existir en `public/images/...` y las rutas en `db.json` deben empezar por `/images/...` (ej.: `/images/mujer/remeras/remera-04.webp`).
- Si cambiás imágenes o `db.json`, hacé **commit + push** a `main` para que Railway redepliegue.


Rutas principales (Front)

/ — Home (categorías y accesos)

/categoria/:cat — Listado por categoría (paginado)

/producto/:id — Detalle

/carrito — Carrito + Checkout (requiere login para finalizar)

/login, /signup

/admin/productos — ABMC Productos (admin)

/admin/compras — ABMC Compras: columnas Cliente/Fecha/Email/Teléfono/Total/Estado, filtro por estado, paginación, cambio de estado (PATCH) y alta manual (POST).

API (resumen)

Auth

POST /api/auth/signup

POST /api/auth/login → { token, user } (JWT expira en 7d)

POST /api/auth/logout → 204

GET /api/profile (requiere JWT)

Productos (admin para escribir)

GET /api/products?_page=1&_limit=20&_sort=createdAt&_order=desc

POST /api/products

PUT/PATCH /api/products/:id

DELETE /api/products/:id

Compras (orders)

GET /api/orders?_page=1&_limit=20&status=pending|pagado|enviado|cancelado

POST /api/orders (login requerido) — payload:

{
  "customer": "Nombre Apellido",
  "email": "user@mail.com",
  "phone": "opcional",
  "total": 12345,
  "items": [{"id":1, "name":"...", "price":1000, "qty":2}],
  "status": "pendiente"
}

PATCH /api/orders/:id — { "status": "pagado|enviado|cancelado|pendiente" }

DELETE /api/orders/:id (admin)

El cliente solo envía Authorization: Bearer <token> cuando corresponde.

Imágenes

colocarlas  en public/images/... y referencia desde db.json con rutas absolutas:

/images/mujer/vestidos/vestido-01.webp
/images/hombre/bermudas/bermuda-03.webp

Estructura (resumen)

/backend
  index.mjs
/db.json
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
    CategoryDetailPage.jsx
    ProductDetailPage.jsx
    CartPage.jsx
    AdminProductsPage.jsx
    AdminOrdersPage.jsx
  /services
    api.js
    auth.js
    products.js
    orders.js
    profile.js
  /styles
    index.css
/public
  /images/...
/docs
  /capturas/...


**_Evidencias & Matriz de cumplimiento_**

\*En docs/capturas incluimos capturas para cada punto de la consigna (home, registro/login, ABMC productos, carrito/checkout, ABMC compras, cambio de estado, compra manual).
La Matriz de cumplimiento está en la sección:Evidencias de este README.

**_ Consigna - Evidencia _**

       # Matriz de cumplimiento#

. Backend: JWT (Login/Registro) (02)  
. Backend: CRUD entidad principal (Productos) | 03 |
. Backend: CRUD entidad soporte (Compras) | 10, 11, 12 |
. Backend: Validaciones | 02, 05, 12 (errores visibles) |
. Backend: Relaciones (orden con items y total) | 09 (checkout crea orden con items/total) |
. Backend: Paginación | 04 , 10 (parte inferior) |
. Frontend: SPA + navegación (01)
. Frontend: ABMC (Productos/Compras) |(01 )
. Frontend: Hooks (useState/useEffect/useContext/useNavigate) 
. Frontend: Carrito + Checkout (08, 09)
.Deploy y README (ambos) | Enlaces y variables en README |

## Evidencias (capturas)

> Nota: Las capturas estÃ¡n en `docs/capturas/`. En cada una indicamos lo que se verifica según la consigna.

### 01 Home/sesión ok (SPA + navegación)

![Home](docs/capturas/01-home.png)
![con sesión iniciada como usuario común](docs/capturas/01-conSesion.png)
![con sesión iniciada como admin](docs/capturas/01-conSesionAdmin.png)

- Se ve la portada con categorís.
- Barra superior con enlaces a _Carrito_, _Login_, _Registro_ (si no hay sesión) o _Salir_ (si hay sesión), si sesión admin: se ve compras y productos. Si sesión ok: saludo en nav.

### 02 Registro (signup con validación)

![Registro](docs/capturas/02-formRegistro.png)
![rta 201 + login ](docs/capturas/02-rta201LoginInmediato.png)

- Form con validaciones básicas.
- Tras registrarse: respuesta 201 y login inmediato (token en storage).

### 03 vista de productos

![categoría mujer](docs/capturas/03-ProductosCategoriaMujer.png)
![categoría hombre](docs/capturas/03-ProductosCategoriaHombre.png)
![categoría unisex](docs/capturas/03-ProductosCategoriaUnisex.png)

### 04 Productos nuevos + listado + form autocopletado para editar + alerta eliminar (ABMC vista admin)

![Productos ABMC](docs/capturas/04-formProductos-Listado-Crear.png)

- Listado con paginado (si aplica).
- Acciones **Editar** / **Eliminar** y botón **Crear producto**.
  ![Autocompletado para editar un productos ABMC](docs/capturas/04-formAutoCompletadoParaEditar.png)
  ![Alerta eliminar producto ABMC](docs/capturas/04-alertaEliminar.png)

### 05 Crear producto (validaciones)

![Crear producto](docs/capturas/05-crearProductoCamposObligatorios.png)

- Alta con campos requeridos y mensajes de error si faltan datos.
- Imagen con ruta pública `public/images/...`.

### 06 Editar producto (update OK)

![Editar producto](docs/capturas/06-editarProducto-200Red.png)
![Editar producto](docs/capturas/06-editarProductoRespuesta200Red.png)

- Se modifica precio/descripcion y se ve reflejado en la grilla.
- Respuesta 200 en red.

### 07 Eliminar producto (delete OK)

![producto a eliminar Bermuda Gabardina Hombre](docs/capturas/07-productoEliminarBermudaGabardinaHombre.png)
![producto eliminado + rta RED](docs/capturas/07-productoEliminadoRespuestaRed.png)
![producto desaparecido del listado](docs/capturas/07-desapariciónProductoDelListado.png)

- Confirmación y eliminación.
- Respuesta 200/204 y desaparición del i­tem en listado.

### 08 Carrito (agregar, sumar/restar, quitar)

![Carrito](docs/capturas/08-carrito.png)
![producto agregado al carrito/cantidad](docs/capturas/08-productoAgregadoCarrito.png)

- Agregar desde detalle/listado, cambiar cantidades, quitar item.
- Totales correctos y persistencia (localStorage).
- se ve la cantidad de productos que el usuario agregó (carrito)

### 09 Checkout (user logueado)

![Checkout](docs/capturas/09-checkout.png)
![Compra finalizada](docs/capturas/09-comprafinalizada.png)

- Datos pre-rellenados (nombre/email), teléfono opcional.
- Al finalizar: orden creada, carrito vací­o, banner de éxito.

### 10 Compras (ABMC admin)

![Compras listado](docs/capturas/10-comprasListado.png)
-Botón para CREAR COMPRA (ejemplo realizada x whasapp)

- Columnas: Cliente/Fecha/email/teléfono/total/Estado y acción eliminar visibles.
- Filtro por estado (pendiente/pagado/enviado/cancelado/todos).
- Paginación `_page/_limit`.

### 11 Cambio de estado (PATCH)

![Cambios de estado](docs/capturas/11-cambioestadoDesplegable.png)
![respuesta en RED (200)](docs/capturas/11-Red200.png)

- Desplegable cambia a `pagado`/`enviado`/`cancelado`.
- Ver en pestaña en RED: la solicitud **PATCH /orders/:id** 200.

### 12 Crear compra manual (POST)

![Compra manual](docs/capturas/12-modalCompraManual.png)
![Compra manual ok: Red = 201](docs/capturas/12-compraManualRed201.png)

- Modal con **Cliente**, **Email**, **Teléfono**, **Total** y **Estado**.
- Guardar **POST /orders** 201 y aparece en listado.


**_Créditos_**

Grupo 8  Diplomatura Desarrollo Web I 2025 (UTN)
Integrantes: Axel · Magalí · Diego · Daniela · Griselda
