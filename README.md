# Grupo 8 – UTN CUDI – Tienda (SPA + API)
### Diplomatura Desarrollo Web I – 2025

**Resumen:** Proyecto full‑stack con frontend SPA (Vite + React) y backend API (Node + Express). La **persistencia principal es MongoDB Atlas** vía Mongoose. Se mantiene un **modo alternativo JSON** solo para práctica/offline.

---

## Tecnologías utilizadas
- **Frontend:** Vite + React
- **Backend:** Node.js + Express
- **Base de datos (principal):** MongoDB Atlas (Mongoose)
- **Autenticación:** JWT (signup/login), rol `admin` por `ADMIN_EMAIL`
- **Scripts:** Migración desde `db.json` a Mongo

---

## Comandos rápidos

| Tarea | Comando |
|------|---------|
| Instalar dependencias | `npm install` |
| Ejecutar en **Mongo (dev)** | `npm run dev` |
| Migración **simulada** (JSON→Mongo) | `npm run migrate:json:dry` |
| Migración **real** (JSON→Mongo) | `npm run migrate:json` |
| Build (si aplica) | `npm run build` |

---

## Configuración de entorno (`.env`)

> **Mongo es el modo principal.** Solo definí `MONGO_URL` y dejá `USE_MONGO=true`.

```env
USE_MONGO=true
MONGO_URL=mongodb+srv://<usuario>:<password>@<cluster>/<nombreDB>?retryWrites=true&w=majority
PORT=4001
FRONT_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:4001/api
JWT_SECRET=dev-super-secret
ADMIN_EMAIL=admin@tienda.com
```

## Cómo correr el proyecto (Mongo — modo principal)

1. Crear `.env` con las variables de arriba (pegá tu `MONGO_URL` de Atlas).  
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Levantar entorno de desarrollo (API + Web):
   ```bash
   npm run dev
   ```
4. Verificar en consola del API:
   ```
   MongoDB conectado
   API escuchando en http://localhost:4001/api (USE_MONGO=true)
   ```
5. Navegar:
   - **Web**: `http://localhost:5173`
   - **API**: `http://localhost:4001/api/products`

---

## Migración de datos desde `db.json` → Mongo

- **Simulación (no escribe):**
  ```bash
  npm run migrate:json:dry
  ```
- **Migración real:**
  ```bash
  npm run migrate:json
  ```
Esto crea/actualiza colecciones `users`, `products`, `orders`.

---

## Modo alternativo JSON (opcional)

> Solo para práctica/offline. 

En `.env` podés conmutar:

```env
USE_MONGO=false
VITE_API_URL=http://localhost:4001/api
```

Luego `npm run dev`.

---

## 📷 Evidencias del funcionamiento (con MongoDB)

### 01. Sesión de usuario y admin
![01-conSesion](docs/capturas/01-conSesion.png)
![01-conSesionAdmin](docs/capturas/01-conSesionadmin.png)

### 01c. Home
![01-home](docs/capturas/01-home.png)

### 02. Registro y login
![02-formRegistro](docs/capturas/02-formregistro.png)
![02-rta201LoginInmediato](docs/capturas/02-rta201logininmediato.png)

### 03. Productos por categoría
![03-ProductosCategoriaHombre](docs/capturas/03-productoscategoriahombre.png)
![03-ProductosCategoriaMujer](docs/capturas/03-productoscategoriamujer.png)
![03-ProductosCategoriaUnisex](docs/capturas/03-productoscategoriaunisex.png)

### 04. Alta/Edición y eliminación
![04-alertaEliminar](docs/capturas/04-alertaeliminar.png)
![04-formAutoCompletadoParaEditar](docs/capturas/04-formautocompletadoparaeditar.png)
![04-formProductos-Listado-Crear](docs/capturas/04-formproductos-listado-crear.png)

### 05. Validaciones en creación de producto
![05-crearProductoCamposObligatorios](docs/capturas/05-crearproductocamposobligatorios.png)

### 06. Edición confirmada
![06-editarProducto-200Red](docs/capturas/06-editarproducto-200red.png)
![06-editarProductoRespuesta200Red](docs/capturas/06-editarproductorespuesta200red.png)

### 07. Eliminación reflejada en listado
![07-desaparicionProductoDelListado](docs/capturas/07-desaparicionproductodellistado.png)
![07-productoEliminadoRespuestaRed](docs/capturas/07-productoeliminadorespuestared.png)
![07-productoEliminarBermudaGabardinaHombre](docs/capturas/07-productoeliminarbermudagabardinahombre.png)

### 08. Carrito
![08-carrito](docs/capturas/08-carrito.png)
![08-productoAgregadoCarrito](docs/capturas/08-productoagregadocarrito.png)

### 09. Checkout
![09-checkout](docs/capturas/09-checkout.png)
![09-comprafinalizada](docs/capturas/09-comprafinalizada.png)

### 10. Compras (listado)
![10-comprasListado](docs/capturas/10-compraslistado.png)

### 11. Cambios de estado
![11-cambioestadoDesplegable](docs/capturas/11-cambioestadodesplegable.png)
![11-Red200](docs/capturas/11-red200.png)

### 12. Compra manual
![12-compraManualRed201](docs/capturas/12-compramanualred201.png)
![12-modalCompraManual](docs/capturas/12-modalcompramanual.png)

### 13. **MongoDB conectado (modo principal)**
![13-MongiDBconectado](docs/capturas/13-mongodbconectado.png)

---

## Credenciales de prueba

**Admin**
- Email: `admin@tienda.com`
- Password: `utn123`

**Usuario**
- Email: `griselmolina1970@gmail.com`
- Password: `Juan1970`

> Recordatorio: el rol admin se asigna al email configurado en `ADMIN_EMAIL` del `.env`.

---

## Estructura del proyecto (resumen)

```
backend/
  index.mjs
  db.mjs
  models/
    user.mjs
    product.mjs
    order.mjs
  routes/
    mongoRouter.mjs

public/
  images/

scripts/
  migrate-from-json.mjs

src/
  ... (Vite + React)

docs/
  capturas/
    (ver imágenes referenciadas en minúsculas)

.env
```

---

## Créditos

**Grupo 8 — Diplomatura Desarrollo Web I 2025 (UTN)**  
**Integrantes:** Axel · Magalí · Diego · Daniela · Griselda  
**Profesor:** Axel Leonardi