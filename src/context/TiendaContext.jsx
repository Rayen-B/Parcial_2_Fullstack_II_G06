import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCart } from './CartContext';

// Estado compartido de la tienda: buscador, filtros del menú, panel de pago y confirmación del pago
const TiendaContext = createContext();

export function TiendaProvider({ children }) {
  const { agregarItem, setMostrarModalCarrito } = useCart();

  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [pagoAbierto, setPagoAbierto] = useState(false);
  const [filtro, setFiltro] = useState('all');        // categoría activa del menú
  const [busqueda, setBusqueda] = useState(null);     // texto buscado (null = sin búsqueda)
  const [versionFiltro, setVersionFiltro] = useState(0); // cambia en cada filtrado para animar las tarjetas
  // Resultado del último pago, se muestra en el carrito 
  const [confirmacion, setConfirmacion] = useState(null);
  const [pieConfirmacion, setPieConfirmacion] = useState(false);

  const filtrarMenu = useCallback((cat) => {
    let normalizado = String(cat || 'all').trim().toLowerCase();
    if (normalizado === 'todo') normalizado = 'all';
    setFiltro(normalizado);
    setBusqueda(null);
    setVersionFiltro((v) => v + 1);
  }, []);

  const buscarMenu = useCallback((texto) => {
    setBusqueda(String(texto || '').trim().toLowerCase());
  }, []);

  const abrirCarrito = useCallback(() => {
    setPieConfirmacion(false);
    setMostrarModalCarrito(true);
  }, [setMostrarModalCarrito]);

  const cerrarCarrito = useCallback(() => setMostrarModalCarrito(false), [setMostrarModalCarrito]);

  const agregarProducto = useCallback((item, cantidad) => {
    agregarItem(item, cantidad);
    setConfirmacion(null);
    setPieConfirmacion(false);
  }, [agregarItem]);

  const confirmarPago = useCallback((datos) => {
    setConfirmacion(datos);
    setPieConfirmacion(true);
    setMostrarModalCarrito(true);
  }, [setMostrarModalCarrito]);

  return (
    <TiendaContext.Provider
      value={{
        buscadorAbierto,
        setBuscadorAbierto,
        pagoAbierto,
        setPagoAbierto,
        filtro,
        busqueda,
        versionFiltro,
        filtrarMenu,
        buscarMenu,
        abrirCarrito,
        cerrarCarrito,
        agregarProducto,
        confirmacion,
        pieConfirmacion,
        confirmarPago
      }}
    >
      {children}
    </TiendaContext.Provider>
  );
}

export function useTienda() {
  return useContext(TiendaContext);
}
