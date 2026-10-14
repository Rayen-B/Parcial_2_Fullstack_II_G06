import React from 'react';
import { obtenerImagen } from '../../assets/images';

// Tarjeta de producto del menú. favorito: null si nunca se marcó el corazón
export default function TarjetaProducto({ producto, favorito = null, onToggleFavorito, onAbrir }) {
  const handleCorazon = (e) => {
    e.stopPropagation(); // el corazón no abre el popup
    if (onToggleFavorito) onToggleFavorito();
  };

  return (
    <div className="mcard" onClick={onAbrir}>
      <div className="mimg">
        <img src={obtenerImagen(producto.img)} alt={producto.alt || producto.title} />
        {producto.badgeText && (
          <div className={`mbdg${producto.badgeType ? ' ' + producto.badgeType : ''}`}><i className="fas fa-star"></i> {producto.badgeText}</div>
        )}
        <div
          className="mhrt"
          style={favorito === null ? undefined : { color: favorito ? 'var(--primary)' : '#ccc' }}
          onClick={handleCorazon}
        >
          <i className={favorito ? 'fas fa-heart' : 'far fa-heart'}></i>
        </div>
      </div>
      <div className="mbody">
        <div className="mcat">{producto.catTarjeta || producto.cat}</div>
        <div className="mtit">{producto.nombre || producto.title}</div>
        <div className="mdesc">{producto.shortDesc}</div>
        <div className="mfoot">
          <div>
            <div className="mprice">
              {producto.price}
              {producto.old && !producto.ocultarAnteriorEnTarjeta && <> <small>{producto.old}</small></>}
            </div>
            <div className="mstars"><i className="fas fa-star"></i> <span className="text-light-gray text-xs">({producto.reviewsShown})</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
