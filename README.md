# 🍰 Papita Dulce

Tienda online de la pastelería y cafetería **Papita Dulce**, desarrollada con **React 18 + Vite** y **Bootstrap 5** (Evaluación Parcial 2 · DSY1104 Desarrollo Fullstack II).

## 🛠️ Tecnologías

- React 18 + Vite, React Router DOM 6
- Bootstrap 5 y React-Bootstrap (diseño responsivo), Font Awesome y Tabler Icons
- **Vitest + jsdom** para las pruebas unitarias (sintaxis `describe / it / expect`, mocks con `vi.fn()` / `vi.spyOn()`)

## 🚀 Cómo ejecutarlo

```bash
npm install
npm run dev          # tienda en http://localhost:5173
npm run test:run     # ejecuta todas las pruebas unitarias una vez
npm test             # pruebas en modo observador
npm run coverage     # pruebas + reporte de cobertura (carpeta coverage/)
npm run build        # versión de producción
```

## 🔑 Accesos de prueba

| Rol | Usuario / correo | Contraseña |
|---|---|---|
| **Administrador (acceso rápido)** | `admin` | `admin` |
| Administrador | alan.brito@duoc.cl | Admin@2026 |
| Vendedor | lola.mento@profesor.duoc.cl | Ventas#2026 |
| Cliente | armando.quito@gmail.com | Cliente!2026 |

Al iniciar sesión en **/login** con `admin` / `admin` se entra directo al **panel de administración** (`/admin`).
Tarjeta de prueba para un **pago rechazado**: `4000 0000 0000 0002`. Para un pago aprobado: `4532 0151 1283 0366`.

## 🗺️ Mapa de vistas (según el diagrama de navegación)

**Tienda (pública)**: `/` (hub principal) · `/productos` · `/producto/:id` · `/categorias` · `/categorias/:id` · `/ofertas` · `/nosotros` · `/blog` · `/blog/:id` · `/contacto` · `/login` · `/registro` · `/checkout` · `/compra/exitosa/:id` · `/compra/error/:id`

**Administración (protegida)**: `/admin` (dashboard) · `/admin/ordenes` · `/admin/ordenes/:id` (boleta) · `/admin/productos` · `/admin/producto-form` (nuevo/editar) · `/admin/productos/criticos` · `/admin/productos/reportes` · `/admin/categorias` · `/admin/categoria-form` · `/admin/usuarios` · `/admin/usuario-form` · `/admin/usuarios/:run/compras` (historial) · `/admin/reportes` · `/admin/perfil`

## 📁 Estructura

```
src/
├── components/   # atoms · molecules · organisms · secciones (componentes reutilizables)
├── context/      # Estado global: Auth (sesión), Cart (carrito), Tienda (buscador/carrito)
├── data/         # Datos iniciales: blog y regiones de Chile
├── hooks/        # useFormulario (validación), useSeo (SEO por página), useOverlay, ...
├── pages/        # Vistas de la tienda y pages/admin (panel)
├── services/     # storage.js (localStorage) y db.js (archivo de datos con CRUD)
├── tests/        # Pruebas unitarias (Vitest)
├── ejemplos-documentacion/  # Código de ejemplo de las presentaciones React II y React IV (se prueba en tests/documentacion-*)
└── utils/        # Validaciones, formato de precios, pago
```

## ✅ Correcciones de la Evaluación 1

| Observación del profesor | Qué se hizo |
|---|---|
| `index` redirigía a `papitadulce/index` (afecta el CEO) | `index.html` es el **único hub**: no hay redirecciones ni páginas duplicadas. Cada vista es una ruta real con su propio `<title>`, meta description y URL canónica (`useSeo`), más `robots.txt`, `sitemap.xml` y `<h1>` único por página. Las rutas privadas llevan `noindex`. |
| El panel admin debe verse desde el Login (`admin` / `admin`) | Existe el usuario `admin`/`admin`; el login redirige al panel según el rol. Rutas `/admin/*` protegidas. |
| Formulario de contacto no validaba bien | Validación por campo (al salir del campo y al enviar): nombre solo letras, correo con dominio, teléfono chileno real (antes aceptaba letras), asunto de lista cerrada, mensaje de 10 a 500 caracteres con contador. |
| Login no validaba bien | `validarLogin`: usuario/correo obligatorio y bien formado, contraseña obligatoria (4+), mensajes por campo y mensaje de credenciales incorrectas. |

## 📚 Evaluación 2 – cumplimiento de requisitos

| Requisito | Dónde está |
|---|---|
| Migración de HTML a React (componentes reutilizables, props y estado) | `src/components/*`, `src/pages/*`, contextos en `src/context` |
| Archivo de datos JS con CRUD | `src/services/db.js` (productos, categorías, usuarios, órdenes, blog, reportes) sobre `storage.js` |
| Persistencia conectada a React | Tienda y admin leen/escriben la misma base: crear un producto en el admin lo muestra en la tienda |
| Diseño responsivo con Bootstrap | Grillas `col-12 col-sm-6 col-lg-4`, navbar colapsable, tablas `table-responsive`, sidebar admin móvil |
| Vistas adicionales | Categorías, ofertas, checkout, pago correcto/error, blog + detalle, boletas, críticos, reportes, perfil, historial de compras |
| Interactividad mejorada | Formularios con validación, filtros y búsqueda (`?q=`, `?categoria=`), buscador con sugerencias |
| Pruebas unitarias | `src/tests/*.test.*` (374 pruebas): renderizado, props, estado, eventos, mocks, flujos completos |

## 🧪 Pruebas unitarias: estilo y dónde están

- **Estilo:** el de la presentación *React IV – Pruebas Unitarias*: `describe` / `it` / `expect` importados de `vitest`, `render` + `screen` + `fireEvent` de Testing Library, `MemoryRouter` para probar rutas, una prueba = un caso, nombres descriptivos y casos inválidos además de los correctos.
- **Dónde:** `src/tests/` (16 archivos). `setup.js` simula las APIs que jsdom no tiene (`scrollIntoView`, `scrollTo`, `matchMedia`...).
- **Cómo:** `npm run test:run` (una vez), `npm test` (observador), `npm run coverage`.
- `secciones-inicio.test.jsx` comprueba el orden de la página de inicio: testimonios → reservas → … → chefs → horarios y entregas → suscripción.
