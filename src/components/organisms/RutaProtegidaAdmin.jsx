import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Componente para proteger las rutas de administración
export default function RutaProtegidaAdmin({ children, soloAdministrador = false }) {
  const { usuario } = useAuth();

  // Sin sesión se va al login; si el rol no es Admin/Vendedor, a la tienda
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== 'Administrador' && usuario.rol !== 'Vendedor') {
    return <Navigate to="/" replace />;
  }

  // El Vendedor solo puede ver Dashboard, Órdenes e Inventario
  if (soloAdministrador && usuario.rol === 'Vendedor') {
    return <Navigate to="/admin/productos" replace />;
  }

  return children;
}
