import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatearPrecio } from '../../utils/formato';
import { obtenerImagen } from '../../assets/images';

// Una fila del carrito
export default function ItemCarrito({ item }) {
  const { actualizarCantidad, eliminarDelCarrito } = useCart();

  return (
    <div className="cartitem">
      <img src={obtenerImagen(item.imagen)} alt={item.nombre} />
      <div>
        <h5>{item.nombre}</h5>
        <div className="cartitem-price">{formatearPrecio(item.precio)}</div>
        <div className="cartqty">
          <button type="button" aria-label="Disminuir cantidad" onClick={() => actualizarCantidad(item.id, item.variante, item.cantidad - 1)}>-</button>
          <span>{item.cantidad}</span>
          <button type="button" aria-label="Aumentar cantidad" onClick={() => actualizarCantidad(item.id, item.variante, item.cantidad + 1)}>+</button>
        </div>
      </div>
      <button className="cartremove" type="button" aria-label={'Eliminar ' + item.nombre} onClick={() => eliminarDelCarrito(item.id, item.variante)}>
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  );
}
