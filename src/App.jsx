import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { TiendaProvider, useTienda } from './context/TiendaContext';
import BarraNavegacion from './components/organisms/BarraNavegacion';
import PiePagina from './components/organisms/PiePagina';
import ModalCarrito from './components/organisms/ModalCarrito';
import PanelPago from './components/organisms/PanelPago';
import ModalAutenticacion from './components/organisms/ModalAutenticacion';
import BuscadorOverlay from './components/molecules/BuscadorOverlay';
import BotonVolverArriba from './components/atoms/BotonVolverArriba';

import Inicio from './pages/Inicio';
import DetalleProducto from './pages/DetalleProducto';
import Checkout from './pages/Checkout';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductos from './pages/admin/AdminProductos';
import AdminProductoForm from './pages/admin/AdminProductoForm';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminUsuarioForm from './pages/admin/AdminUsuarioForm';
import AdminOrdenes from './pages/admin/AdminOrdenes';
import estilosTienda from './assets/css/style.css?inline';
import { useEstilos } from './hooks/useEstilos';

// Componente para proteger las rutas de administración
function RutaProtegidaAdmin({ children, soloAdministrador = false }) {
  const { usuario } = useAuth();

  // Si no hay sesión iniciada o el usuario no tiene rol de Admin/Vendedor, redirigir a la tienda
  if (!usuario || (usuario.rol !== 'Administrador' && usuario.rol !== 'Vendedor')) {
    return <Navigate to="/" replace />;
  }

  // El Vendedor solo puede ver Dashboard, Órdenes e Inventario 
  if (soloAdministrador && usuario.rol === 'Vendedor') {
    return <Navigate to="/admin/productos" replace />;
  }

  return children;
}

function useScrollSuaveAnclas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { filtrarMenu } = useTienda();

  useEffect(() => {
    const onClick = (e) => {
      const enlace = e.target.closest('a[href^="#"]');
      if (!enlace) return;
      const href = enlace.getAttribute('href');
      if (href === '#') return;
      const destino = document.querySelector(href);
      e.preventDefault();
      if (!destino) {
        navigate('/' + href);
        return;
      }
      if (enlace.getAttribute('data-menu-action') === 'show-all') filtrarMenu('all');
      const navMenu = document.getElementById('navmenu');
      if (navMenu && navMenu.classList.contains('show')) {
        const colapso = window.bootstrap && window.bootstrap.Collapse.getInstance(navMenu);
        if (colapso) colapso.hide();
        else navMenu.classList.remove('show');
      }
      setTimeout(() => window.scrollTo({ top: destino.offsetTop - 78, behavior: 'smooth' }), 50);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate, location.pathname, filtrarMenu]);
}

function TiendaLayout({ children }) {
  useEstilos(estilosTienda, 'tienda');
  useScrollSuaveAnclas();
  return (
    <>
      <BarraNavegacion />
      <BuscadorOverlay />
      {children}
      <ModalCarrito />
      <PanelPago />
      <ModalAutenticacion />
      <PiePagina />
      <BotonVolverArriba />
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const esRutaAdmin = location.pathname.startsWith('/admin');

  const rutas = (
    <Routes>
      {/* Rutas de la Tienda Principal */}
      <Route path="/" element={<Inicio />} />
      <Route path="/producto/:id" element={<DetalleProducto />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* Rutas del Panel de Administración Protegidas */}
      <Route path="/admin" element={<RutaProtegidaAdmin><AdminDashboard /></RutaProtegidaAdmin>} />
      <Route path="/admin/productos" element={<RutaProtegidaAdmin><AdminProductos /></RutaProtegidaAdmin>} />
      <Route path="/admin/producto-form" element={<RutaProtegidaAdmin soloAdministrador><AdminProductoForm /></RutaProtegidaAdmin>} />
      <Route path="/admin/ordenes" element={<RutaProtegidaAdmin><AdminOrdenes /></RutaProtegidaAdmin>} />
      <Route path="/admin/usuarios" element={<RutaProtegidaAdmin soloAdministrador><AdminUsuarios /></RutaProtegidaAdmin>} />
      <Route path="/admin/usuario-form" element={<RutaProtegidaAdmin soloAdministrador><AdminUsuarioForm /></RutaProtegidaAdmin>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return esRutaAdmin ? rutas : <TiendaLayout>{rutas}</TiendaLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <TiendaProvider>
          <AppContent />
        </TiendaProvider>
      </CartProvider>
    </AuthProvider>
  );
}
