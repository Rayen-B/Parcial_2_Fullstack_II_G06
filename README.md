# 🍰 Papita Dulce

Tienda online de la pastelería y cafetería **Papita Dulce**, desarrollada con **React + Vite** y **Bootstrap**.
Incluye la tienda para clientes (menú, carrito, pago y cuenta) y un panel de administración (productos, usuarios y órdenes).

## 🛠️ Tecnologías

- React 18 + Vite
- React Router DOM
- Bootstrap 5 y React-Bootstrap
- AOS (animaciones al hacer scroll) y Swiper (carrusel de testimonios)
- Font Awesome y Tabler Icons

## 📁 Estructura

```
src/
├── assets/          # Imágenes y hojas de estilo (images.js importa todas las imágenes)
├── components/
│   ├── atoms/       # Componentes pequeños (botones, mensajes de validación)
│   ├── molecules/   # Tarjeta de producto, buscador, ítem del carrito, lightbox
│   ├── organisms/   # Navbar, footer, carrito, pago, cuenta, layout del admin
│   └── secciones/   # Secciones de la página de inicio
├── context/         # Estado global: sesión (Auth), carrito (Cart) y tienda (Tienda)
├── data/            # Menú y regiones de Chile
├── hooks/           # Hooks propios (formularios, paneles, estilos)
├── pages/           # Inicio, detalle de producto, checkout y páginas del admin
├── services/        # Lectura y escritura en localStorage
└── utils/           # Validaciones, formato de precios y validación de tarjetas
```

## ✨ Funcionalidades

**Tienda**
- Menú con filtros por categoría, buscador y detalle de cada producto (con opción torta completa / trozo).
- Carrito de compras guardado en el navegador.
- Pago por pasos: datos de contacto, retiro en tienda o despacho, y pago con tarjeta, transferencia o efectivo.
- Registro, inicio de sesión y recuperación de contraseña.
- Formularios de reserva y contacto con validación.

**Panel de administración** (`/admin`)
- Dashboard con métricas y resumen del inventario.
- Inventario: ver, crear, editar y eliminar productos (con alerta de stock crítico).
- Gestión de usuarios y roles (Administrador, Vendedor y Cliente).
- Órdenes de compra con buscador y detalle.

## 🚀 Cómo ejecutarlo

```bash
npm install
npm run dev
```

Luego abrir la dirección que muestra la terminal (por defecto `http://localhost:5173`).

## 🔑 Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | alan.brito@duoc.cl | Admin@2026 |
| Vendedor | lola.mento@profesor.duoc.cl | Ventas#2026 |
| Cliente | armando.quito@gmail.com | Cliente!2026 |

Para entrar al panel: **Mi cuenta → Iniciar sesión** con el usuario Administrador o Vendedor.
