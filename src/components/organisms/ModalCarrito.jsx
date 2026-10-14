import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTienda } from '../../context/TiendaContext';
import { useOverlay } from '../../hooks/useOverlay';
import ItemCarrito from '../molecules/ItemCarrito';
import { formatearPrecio } from '../../utils/formato';

// Panel lateral del carrito 
export default function ModalCarrito() {
  const { carrito, mostrarModalCarrito, totalPrecio, totalCantidad, vaciarCarrito } = useCart();
  const { cerrarCarrito, setPagoAbierto, confirmacion, pieConfirmacion } = useTienda();
  const navigate = useNavigate();
  const location = useLocation();

  useOverlay(mostrarModalCarrito, cerrarCarrito);

  const vacio = carrito.length === 0;
  const mostrarPie = !vacio || pieConfirmacion;

  const verMenu = () => {
    cerrarCarrito();
    const menu = document.getElementById('menu');
    if (location.pathname === '/' && menu) menu.scrollIntoView({ behavior: 'smooth' });
    else navigate('/#menu');
  };

  const irAPagar = () => {
    if (vacio) return;
    cerrarCarrito();
    setPagoAbierto(true);
  };

  let resumen = '';
  if (pieConfirmacion && confirmacion) resumen = confirmacion.lineas + ' línea(s) confirmada(s)';
  else if (!vacio) resumen = totalCantidad + ' producto(s) en tu pedido';

  return (
    <div
      id="cartPanel"
      className={mostrarModalCarrito ? 'open' : ''}
      aria-hidden={!mostrarModalCarrito}
      onClick={(e) => { if (e.target === e.currentTarget) cerrarCarrito(); }}
    >
      <div className="cartbox" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
        <div className="carthead">
          <div>
            <span className="slbl">Tu pedido</span>
            <h3 id="cartTitle">Carrito</h3>
          </div>
          <button className="cartclose" id="cartClose" type="button" aria-label="Cerrar carrito" onClick={cerrarCarrito}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="cartitems" id="cartItems">
          {carrito.map((item) => (
            <ItemCarrito key={`${item.id}-${item.variante}`} item={item} />
          ))}
        </div>
        <div className={`cartempty${vacio ? ' show' : ''}`} id="cartEmpty">
          <i className="fas fa-shopping-basket"></i>
          {confirmacion ? (
            <p>
              <strong>Pago exitoso</strong><br />
              Pedido {confirmacion.numero} ({confirmacion.metodoTexto})<br />
              <small>{confirmacion.entregaTexto}. Confirmación enviada a {confirmacion.correo}.</small>
            </p>
          ) : (
            <p>Tu carrito está vacío.</p>
          )}
          <button className="btn-red" id="cartContinue" type="button" onClick={verMenu}>
            <i className="fas fa-utensils"></i>Ver el menú
          </button>
        </div>
        <div className="cartfoot" id="cartFoot" style={{ display: mostrarPie ? 'block' : 'none' }}>
          <div className="cartsummary" id="cartSummary" aria-live="polite">{resumen}</div>
          <div className="cartsum"><span>Subtotal</span><strong id="cartSubtotal">{formatearPrecio(totalPrecio)}</strong></div>
          <button className="cartcheckout" id="cartCheckout" type="button" style={{ display: confirmacion ? 'none' : '' }} onClick={irAPagar}>
            <i className="fas fa-check"></i>Confirmar pedido
          </button>
          <button className="cartclear" id="cartClear" type="button" style={{ display: confirmacion ? 'none' : '' }} onClick={vaciarCarrito}>
            Vaciar carrito
          </button>
          <p className="cartnotice" id="cartNotice" role="status">
            {confirmacion && (
              <><strong>Compra confirmada:</strong> {confirmacion.totalTexto} para {confirmacion.nombre}.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
